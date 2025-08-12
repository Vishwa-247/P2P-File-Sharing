export interface BluetoothTransferProgress {
  percentage: number
  transferredBytes: number
  totalBytes: number
  speed: number
  eta: number
  elapsedTime: number
}

export class BluetoothService {
  private device: BluetoothDevice | null = null
  private server: BluetoothRemoteGATTServer | null = null
  private service: BluetoothRemoteGATTService | null = null
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null
  private onProgress: (progress: BluetoothTransferProgress) => void
  private onFileReceived: (file: File) => void
  private onError: (error: string) => void
  private onConnectionStateChange: (state: string) => void

  // File transfer state
  private transferStartTime = 0
  private receivedChunks: ArrayBuffer[] = []
  private expectedFileSize = 0
  private receivedBytes = 0
  private fileName = ""

  constructor(
    callbacks: {
      onProgress?: (progress: BluetoothTransferProgress) => void
      onFileReceived?: (file: File) => void
      onError?: (error: string) => void
      onConnectionStateChange?: (state: string) => void
    } = {},
  ) {
    this.onProgress = callbacks.onProgress || (() => {})
    this.onFileReceived = callbacks.onFileReceived || (() => {})
    this.onError = callbacks.onError || ((error) => console.error("Bluetooth Error:", error))
    this.onConnectionStateChange = callbacks.onConnectionStateChange || (() => {})
  }

  async requestDevice(): Promise<boolean> {
    try {
      if (!navigator.bluetooth) {
        throw new Error("Bluetooth is not supported in this browser")
      }

      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ["12345678-1234-1234-1234-123456789abc"] }],
        optionalServices: ["12345678-1234-1234-1234-123456789abc"],
      })

      this.device.addEventListener("gattserverdisconnected", () => {
        this.onConnectionStateChange?.("disconnected")
      })

      return true
    } catch (error) {
      this.onError(`Failed to request Bluetooth device: ${error}`)
      return false
    }
  }

  async connect(): Promise<boolean> {
    try {
      if (!this.device) {
        throw new Error("No device selected")
      }

      this.onConnectionStateChange?.("connecting")
      this.server = await this.device.gatt?.connect()

      if (!this.server) {
        throw new Error("Failed to connect to GATT server")
      }

      this.service = await this.server.getPrimaryService("12345678-1234-1234-1234-123456789abc")
      this.characteristic = await this.service.getCharacteristic("87654321-4321-4321-4321-cba987654321")

      // Start notifications for receiving data
      await this.characteristic.startNotifications()
      this.characteristic.addEventListener("characteristicvaluechanged", this.handleDataReceived.bind(this))

      this.onConnectionStateChange?.("connected")
      return true
    } catch (error) {
      this.onError(`Failed to connect: ${error}`)
      return false
    }
  }

  async sendFile(file: File): Promise<void> {
    try {
      if (!this.characteristic) {
        throw new Error("Not connected to device")
      }

      this.transferStartTime = Date.now()
      const chunkSize = 512 // Bluetooth LE has limited MTU
      const totalChunks = Math.ceil(file.size / chunkSize)

      // Send file metadata first
      const metadata = JSON.stringify({
        type: "metadata",
        fileName: file.name,
        fileSize: file.size,
        totalChunks,
      })

      await this.characteristic.writeValue(new TextEncoder().encode(metadata))

      // Send file in chunks
      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize
        const end = Math.min(start + chunkSize, file.size)
        const chunk = file.slice(start, end)
        const arrayBuffer = await chunk.arrayBuffer()

        // Create chunk header
        const header = new Uint8Array(8)
        new DataView(header.buffer).setUint32(0, i, true) // chunk index
        new DataView(header.buffer).setUint32(4, arrayBuffer.byteLength, true) // chunk size

        // Combine header and data
        const chunkData = new Uint8Array(header.length + arrayBuffer.byteLength)
        chunkData.set(header, 0)
        chunkData.set(new Uint8Array(arrayBuffer), header.length)

        await this.characteristic.writeValue(chunkData)

        // Update progress
        const transferredBytes = end
        const percentage = (transferredBytes / file.size) * 100
        const elapsedTime = (Date.now() - this.transferStartTime) / 1000
        const speed = elapsedTime > 0 ? transferredBytes / elapsedTime : 0
        const eta = speed > 0 ? (file.size - transferredBytes) / speed : 0

        if (this.onProgress) {
          this.onProgress({
            percentage: Math.min(percentage, 100),
            transferredBytes,
            totalBytes: file.size,
            speed,
            eta: isFinite(eta) ? eta : 0,
            elapsedTime,
          })
        }

        // Small delay to prevent overwhelming the connection
        await new Promise((resolve) => setTimeout(resolve, 10))
      }

      // Send completion signal
      const completion = JSON.stringify({ type: "complete" })
      await this.characteristic.writeValue(new TextEncoder().encode(completion))
    } catch (error) {
      this.onError(`Failed to send file: ${error}`)
    }
  }

  private handleDataReceived(event: Event): void {
    const target = event.target as BluetoothRemoteGATTCharacteristic
    const value = target.value

    if (!value) return

    try {
      // Try to parse as JSON first (metadata or completion)
      const text = new TextDecoder().decode(value)
      const data = JSON.parse(text)

      if (data.type === "metadata") {
        this.fileName = data.fileName
        this.expectedFileSize = data.fileSize
        this.receivedChunks = []
        this.receivedBytes = 0
        this.transferStartTime = Date.now()
        return
      }

      if (data.type === "complete") {
        this.assembleFile()
        return
      }
    } catch {
      // Not JSON, treat as file chunk
      this.handleFileChunk(value)
    }
  }

  private handleFileChunk(value: DataView): void {
    // Extract chunk header
    const chunkIndex = value.getUint32(0, true)
    const chunkSize = value.getUint32(4, true)

    // Extract chunk data
    const chunkData = new ArrayBuffer(chunkSize)
    const chunkView = new Uint8Array(chunkData)
    const sourceView = new Uint8Array(value.buffer, value.byteOffset + 8, chunkSize)
    chunkView.set(sourceView)

    this.receivedChunks[chunkIndex] = chunkData
    this.receivedBytes += chunkSize

    // Update progress
    const percentage = (this.receivedBytes / this.expectedFileSize) * 100
    const elapsedTime = (Date.now() - this.transferStartTime) / 1000
    const speed = elapsedTime > 0 ? this.receivedBytes / elapsedTime : 0
    const eta = speed > 0 ? (this.expectedFileSize - this.receivedBytes) / speed : 0

    if (this.onProgress) {
      this.onProgress({
        percentage: Math.min(percentage, 100),
        transferredBytes: this.receivedBytes,
        totalBytes: this.expectedFileSize,
        speed,
        eta: isFinite(eta) ? eta : 0,
        elapsedTime,
      })
    }
  }

  private assembleFile(): void {
    try {
      // Combine all chunks
      const fileData = new Uint8Array(this.expectedFileSize)
      let offset = 0

      for (const chunk of this.receivedChunks) {
        if (chunk) {
          fileData.set(new Uint8Array(chunk), offset)
          offset += chunk.byteLength
        }
      }

      const file = new File([fileData], this.fileName)
      this.onFileReceived(file)
    } catch (error) {
      this.onError(`Failed to assemble file: ${error}`)
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.server) {
        await this.server.disconnect()
      }
    } catch (error) {
      console.error("Error disconnecting:", error)
    }
  }

  isSupported(): boolean {
    return "bluetooth" in navigator
  }
}
