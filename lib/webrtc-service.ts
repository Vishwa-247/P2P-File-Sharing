export interface FileTransferProgress {
  bytesTransferred: number
  totalBytes: number
  percentage: number
  transferSpeed: number // bytes per second
  estimatedTimeRemaining: number // seconds
  startTime: number
  elapsedTime: number
}

export interface WebRTCServiceCallbacks {
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void
  onDataChannelOpen?: () => void
  onDataChannelClose?: () => void
  onFileReceived?: (file: File) => void
  onProgress?: (progress: FileTransferProgress) => void
  onError?: (error: string) => void
  onTransferCancelled?: () => void
}

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null
  private dataChannel: RTCDataChannel | null = null
  private callbacks: WebRTCServiceCallbacks = {}
  private fileBuffer: ArrayBuffer[] = []
  private receivedBytes = 0
  private totalFileSize = 0
  private fileName = ""
  private transferStartTime = 0
  private lastProgressTime = 0
  private lastBytesTransferred = 0
  private transferCancelled = false
  private currentFileReader: FileReader | null = null
  private connectionTimeout: NodeJS.Timeout | null = null
  private sessionId: string | null = null
  private cleanupRegistered = false
  private isInitiator = false

  constructor(callbacks: WebRTCServiceCallbacks = {}) {
    this.callbacks = callbacks
    this.registerCleanupHandlers()
  }

  private registerCleanupHandlers(): void {
    if (this.cleanupRegistered || typeof window === "undefined") return

    this.cleanupRegistered = true

    window.addEventListener("beforeunload", () => {
      this.cleanup()
    })

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.cleanup()
      }
    })

    window.addEventListener("blur", () => {
      setTimeout(() => {
        if (!document.hasFocus()) {
          this.cleanup()
        }
      }, 5000)
    })
  }

  setSessionId(sessionId: string): void {
    this.sessionId = sessionId
  }

  private createPeerConnection(): RTCPeerConnection {
    const configuration: RTCConfiguration = {
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
      iceCandidatePoolSize: 10,
    }

    const pc = new RTCPeerConnection(configuration)

    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState)
      this.callbacks.onConnectionStateChange?.(pc.connectionState)

      if (pc.connectionState === "connected") {
        this.clearConnectionTimeout()
        this.updateSessionStatus("connected")
      } else if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
        this.clearConnectionTimeout()
        this.updateSessionStatus("expired")
      }
    }

    pc.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", pc.iceConnectionState)

      if (pc.iceConnectionState === "checking") {
        this.setConnectionTimeout()
      } else if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
        this.clearConnectionTimeout()
      }
    }

    return pc
  }

  private setConnectionTimeout(): void {
    this.clearConnectionTimeout()
    this.connectionTimeout = setTimeout(() => {
      console.log("Connection timeout")
      if (this.isInitiator) {
        this.callbacks.onError?.(
          "Connection timeout - no receiver joined. Make sure the receiver scans the QR code or enters the session ID.",
        )
      } else {
        this.callbacks.onError?.(
          "Connection timeout - failed to connect to sender. Please try scanning the QR code again.",
        )
      }
      this.cleanup()
    }, 45000) // 45 second timeout for better user experience
  }

  private clearConnectionTimeout(): void {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout)
      this.connectionTimeout = null
    }
  }

  private async updateSessionStatus(status: string): Promise<void> {
    if (!this.sessionId) return

    try {
      await fetch(`/api/session/${this.sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
    } catch (error) {
      console.error("Failed to update session status:", error)
    }
  }

  private async cleanupSessionInternal(): Promise<void> {
    if (!this.sessionId) return

    try {
      await fetch(`/api/session/${this.sessionId}`, {
        method: "DELETE",
      })
    } catch (error) {
      console.error("Failed to cleanup session:", error)
    }
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    this.peerConnection = this.createPeerConnection()
    this.isInitiator = true

    this.dataChannel = this.peerConnection.createDataChannel("fileTransfer", {
      ordered: true,
    })

    this.setupDataChannelEvents(this.dataChannel)

    const offer = await this.peerConnection.createOffer()
    await this.peerConnection.setLocalDescription(offer)

    this.setConnectionTimeout()

    return offer
  }

  async createAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    this.peerConnection = this.createPeerConnection()
    this.isInitiator = false

    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel
      this.setupDataChannelEvents(this.dataChannel)
    }

    try {
      await this.peerConnection.setRemoteDescription(offer)
      const answer = await this.peerConnection.createAnswer()
      await this.peerConnection.setLocalDescription(answer)

      this.setConnectionTimeout()

      return answer
    } catch (error) {
      console.error("Error creating answer:", error)
      this.callbacks.onError?.("Failed to create connection. Please try again.")
      throw error
    }
  }

  async setAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error("Peer connection not initialized")
    }

    await this.peerConnection.setRemoteDescription(answer)
  }

  private setupDataChannelEvents(channel: RTCDataChannel): void {
    channel.onopen = () => {
      console.log("Data channel opened")
      this.callbacks.onDataChannelOpen?.()
    }

    channel.onclose = () => {
      console.log("Data channel closed")
      this.callbacks.onDataChannelClose?.()
    }

    channel.onerror = (error) => {
      console.error("Data channel error:", error)
      this.callbacks.onError?.("Data channel error")
    }

    channel.onmessage = (event) => {
      this.handleDataChannelMessage(event.data)
    }
  }

  private handleDataChannelMessage(data: any): void {
    if (typeof data === "string") {
      const message = JSON.parse(data)

      if (message.type === "file-info") {
        this.totalFileSize = message.size
        this.fileName = message.name
        this.fileBuffer = []
        this.receivedBytes = 0
        this.transferStartTime = Date.now()
        this.lastProgressTime = this.transferStartTime
        this.lastBytesTransferred = 0

        if (this.totalFileSize > 100 * 1024 * 1024) {
          this.callbacks.onError?.("File too large (max 100MB)")
          return
        }
      } else if (message.type === "file-end") {
        this.reconstructFile()
      } else if (message.type === "cancel") {
        this.transferCancelled = true
        this.callbacks.onTransferCancelled?.()
      }
    } else {
      if (this.transferCancelled) return

      this.fileBuffer.push(data)
      this.receivedBytes += data.byteLength

      const progress = this.calculateProgress(this.receivedBytes, this.totalFileSize)
      this.callbacks.onProgress?.(progress)
    }
  }

  private calculateProgress(bytesTransferred: number, totalBytes: number): FileTransferProgress {
    const now = Date.now()
    const elapsedTime = (now - this.transferStartTime) / 1000 // seconds
    const timeSinceLastUpdate = (now - this.lastProgressTime) / 1000

    let transferSpeed = 0
    if (timeSinceLastUpdate > 0) {
      const bytesSinceLastUpdate = bytesTransferred - this.lastBytesTransferred
      transferSpeed = bytesSinceLastUpdate / timeSinceLastUpdate
    }

    const remainingBytes = totalBytes - bytesTransferred
    const estimatedTimeRemaining = transferSpeed > 0 ? remainingBytes / transferSpeed : 0

    this.lastProgressTime = now
    this.lastBytesTransferred = bytesTransferred

    return {
      bytesTransferred,
      totalBytes,
      percentage: Math.round((bytesTransferred / totalBytes) * 100),
      transferSpeed,
      estimatedTimeRemaining,
      startTime: this.transferStartTime,
      elapsedTime,
    }
  }

  private reconstructFile(): void {
    if (this.transferCancelled) return

    try {
      const completeBuffer = new Uint8Array(this.totalFileSize)
      let offset = 0

      for (const chunk of this.fileBuffer) {
        completeBuffer.set(new Uint8Array(chunk), offset)
        offset += chunk.byteLength
      }

      const file = new File([completeBuffer], this.fileName)
      this.callbacks.onFileReceived?.(file)
      this.updateSessionStatus("completed")
    } catch (error) {
      console.error("Error reconstructing file:", error)
      this.callbacks.onError?.("Failed to reconstruct file")
    }
  }

  async sendFile(file: File): Promise<void> {
    if (!this.dataChannel || this.dataChannel.readyState !== "open") {
      throw new Error("Data channel not ready")
    }

    if (file.size > 100 * 1024 * 1024) {
      throw new Error("File too large (max 100MB)")
    }

    this.transferStartTime = Date.now()
    this.lastProgressTime = this.transferStartTime
    this.lastBytesTransferred = 0
    this.transferCancelled = false

    const fileInfo = {
      type: "file-info",
      name: file.name,
      size: file.size,
    }
    this.dataChannel.send(JSON.stringify(fileInfo))

    const chunkSize = Math.min(16384, this.dataChannel.bufferedAmountLowThreshold || 16384)
    let offset = 0

    const sendNextChunk = () => {
      if (this.transferCancelled) return

      const slice = file.slice(offset, offset + chunkSize)
      this.currentFileReader = new FileReader()
      this.currentFileReader.readAsArrayBuffer(slice)
    }

    const fileReader = new FileReader()
    fileReader.onload = (event) => {
      if (this.transferCancelled || !event.target?.result) return

      try {
        this.dataChannel!.send(event.target.result as ArrayBuffer)
        offset += chunkSize

        const progress = this.calculateProgress(offset, file.size)
        this.callbacks.onProgress?.(progress)

        if (offset < file.size) {
          setTimeout(sendNextChunk, 10)
        } else {
          this.dataChannel!.send(JSON.stringify({ type: "file-end" }))
          this.updateSessionStatus("completed")
        }
      } catch (error) {
        console.error("Error sending chunk:", error)
        this.callbacks.onError?.("Failed to send file chunk")
      }
    }

    fileReader.onerror = () => {
      this.callbacks.onError?.("Failed to read file")
    }

    this.currentFileReader = fileReader
    sendNextChunk()
  }

  cancelTransfer(): void {
    this.transferCancelled = true

    if (this.currentFileReader) {
      this.currentFileReader.abort()
      this.currentFileReader = null
    }

    if (this.dataChannel && this.dataChannel.readyState === "open") {
      try {
        this.dataChannel.send(JSON.stringify({ type: "cancel" }))
      } catch (error) {
        console.error("Error sending cancel message:", error)
      }
    }

    this.callbacks.onTransferCancelled?.()
  }

  cleanup(): void {
    this.transferCancelled = true

    this.clearConnectionTimeout()

    if (this.currentFileReader) {
      this.currentFileReader.abort()
      this.currentFileReader = null
    }

    if (this.dataChannel) {
      this.dataChannel.close()
      this.dataChannel = null
    }

    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }

    this.cleanupSessionInternal()

    this.fileBuffer = []
    this.receivedBytes = 0
    this.totalFileSize = 0
    this.fileName = ""
    this.transferStartTime = 0
    this.lastProgressTime = 0
    this.lastBytesTransferred = 0
    this.sessionId = null
  }

  getConnectionState(): RTCPeerConnectionState | null {
    return this.peerConnection?.connectionState || null
  }

  isTransferring(): boolean {
    return this.transferStartTime > 0 && !this.transferCancelled
  }
}

export async function createSession(offer: RTCSessionDescriptionInit): Promise<string> {
  try {
    if (!offer || !offer.type || !offer.sdp) {
      throw new Error("Invalid offer: missing type or sdp")
    }

    console.log("Creating session with offer:", { type: offer.type, sdpLength: offer.sdp.length })

    const response = await fetch("/api/offer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ offer }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Session creation failed:", response.status, errorText)
      throw new Error(`Failed to create session: ${response.status} ${errorText}`)
    }

    const result = await response.json()
    console.log("Session created successfully:", result.sessionId)

    if (!result.sessionId) {
      throw new Error("No session ID returned from server")
    }

    return result.sessionId
  } catch (error) {
    console.error("Error in createSession:", error)
    throw error
  }
}

export async function getOffer(sessionId: string): Promise<RTCSessionDescriptionInit> {
  const response = await fetch(`/api/offer/${sessionId}`)

  if (!response.ok) {
    if (response.status === 410) {
      throw new Error("Session expired")
    }
    throw new Error("Failed to get offer")
  }

  const { offer } = await response.json()
  return offer
}

export async function sendAnswer(sessionId: string, answer: RTCSessionDescriptionInit): Promise<void> {
  const response = await fetch(`/api/answer/${sessionId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answer }),
  })

  if (!response.ok) {
    if (response.status === 410) {
      throw new Error("Session expired")
    }
    throw new Error("Failed to send answer")
  }
}

export async function getAnswer(sessionId: string): Promise<RTCSessionDescriptionInit> {
  const response = await fetch(`/api/answer/${sessionId}`)

  if (!response.ok) {
    if (response.status === 410) {
      throw new Error("Session expired")
    }
    throw new Error("Failed to get answer")
  }

  const { answer } = await response.json()
  return answer
}

export async function getSessionStatus(sessionId: string): Promise<any> {
  const response = await fetch(`/api/session/${sessionId}`)

  if (!response.ok) {
    if (response.status === 410) {
      throw new Error("Session expired")
    }
    throw new Error("Failed to get session status")
  }

  return response.json()
}

export async function cleanupSession(sessionId: string): Promise<void> {
  try {
    await fetch(`/api/session/${sessionId}`, {
      method: "DELETE",
    })
  } catch (error) {
    console.error("Failed to cleanup session:", error)
    // Don't throw error for cleanup operations to avoid breaking the app
  }
}
