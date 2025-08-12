// QR Code generation and scanning utilities

export async function generateQRCode(text: string): Promise<string> {
  // Using a simple QR code generation approach that works in the browser
  const size = 200
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`
  return qrApiUrl
}

// Simple QR code detection function (jsQR alternative)
function detectQRCode(imageData: ImageData): string | null {
  // This is a simplified QR detection - in production you'd use jsQR
  // For now, we'll implement a basic pattern detection
  const { data, width, height } = imageData

  // Look for QR code patterns (simplified approach)
  // Check for high contrast patterns that might indicate QR codes
  let darkPixels = 0
  let lightPixels = 0

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const brightness = (r + g + b) / 3

    if (brightness < 128) {
      darkPixels++
    } else {
      lightPixels++
    }
  }

  // If we have a good mix of dark and light pixels, it might be a QR code
  const ratio = darkPixels / (darkPixels + lightPixels)
  if (ratio > 0.3 && ratio < 0.7) {
    // Simulate QR code detection - in real app, this would decode the actual QR
    // For demo, we'll return null to rely on manual input
    return null
  }

  return null
}

export class QRScanner {
  private video: HTMLVideoElement | null = null
  private canvas: HTMLCanvasElement | null = null
  private context: CanvasRenderingContext2D | null = null
  private stream: MediaStream | null = null
  private scanning = false
  private onScanCallback: ((result: string) => void) | null = null
  private scanInterval: NodeJS.Timeout | null = null

  constructor(videoElement: HTMLVideoElement, onScan: (result: string) => void) {
    this.video = videoElement
    this.onScanCallback = onScan
    this.canvas = document.createElement("canvas")
    this.context = this.canvas.getContext("2d")
  }

  async startScanning(): Promise<void> {
    try {
      // Request camera access with better constraints
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera if available
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      })

      if (this.video) {
        this.video.srcObject = this.stream
        await this.video.play()
        this.scanning = true
        this.startScanLoop()
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      throw new Error("Camera access denied or not available. Please allow camera access and try again.")
    }
  }

  stopScanning(): void {
    this.scanning = false

    if (this.scanInterval) {
      clearInterval(this.scanInterval)
      this.scanInterval = null
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
      this.stream = null
    }

    if (this.video) {
      this.video.srcObject = null
    }
  }

  private startScanLoop(): void {
    this.scanInterval = setInterval(() => {
      this.scanFrame()
    }, 250) // Scan every 250ms for better performance
  }

  private scanFrame(): void {
    if (!this.scanning || !this.video || !this.canvas || !this.context) {
      return
    }

    if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
      this.canvas.width = this.video.videoWidth
      this.canvas.height = this.video.videoHeight
      this.context.drawImage(this.video, 0, 0)

      const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height)

      const result = detectQRCode(imageData)
      if (result && this.onScanCallback) {
        this.onScanCallback(result)
        this.stopScanning()
      }
    }
  }

  // Manual session ID input fallback
  processManualInput(sessionId: string): void {
    if (this.onScanCallback && sessionId.trim()) {
      this.onScanCallback(sessionId.trim())
    }
  }
}
