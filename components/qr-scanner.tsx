"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { QRScanner as QRScannerService } from "@/lib/qr-service"
import { Camera, CameraOff, Scan } from "lucide-react"

interface QRScannerProps {
  onScan: (sessionId: string) => void
  onError?: (error: string) => void
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string>("")
  const [manualInput, setManualInput] = useState<string>("")
  const [cameraPermission, setCameraPermission] = useState<"granted" | "denied" | "prompt">("prompt")
  const videoRef = useRef<HTMLVideoElement>(null)
  const scannerRef = useRef<QRScannerService | null>(null)

  useEffect(() => {
    checkCameraPermission()
  }, [])

  const checkCameraPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: "camera" as PermissionName })
      setCameraPermission(result.state)
    } catch (error) {
      console.log("Permission API not supported")
    }
  }

  const startScanning = async () => {
    if (!videoRef.current) return

    try {
      setError("")
      scannerRef.current = new QRScannerService(videoRef.current, (result) => {
        // Extract session ID from URL if it's a full URL
        const sessionId = result.includes("/join/") ? result.split("/join/")[1] : result

        onScan(sessionId)
        stopScanning()
      })

      await scannerRef.current.startScanning()
      setIsScanning(true)
      setCameraPermission("granted")
    } catch (err) {
      setIsScanning(false)
      setCameraPermission("denied")
    }
  }

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stopScanning()
      scannerRef.current = null
    }
    setIsScanning(false)
  }

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      // Extract session ID from URL if it's a full URL
      const sessionId = manualInput.includes("/join/") ? manualInput.split("/join/")[1] : manualInput.trim()

      onScan(sessionId)
    }
  }

  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  return (
    <div className="space-y-4">
      {/* Camera Scanner */}
      <div className="space-y-2">
        <div className="relative">
          <video
            ref={videoRef}
            className={`w-full h-64 bg-gray-100 rounded-lg object-cover ${isScanning ? "block" : "hidden"}`}
            playsInline
            muted
          />

          {!isScanning && (
            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Scan className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium text-gray-700 mb-2">QR Code Scanner</p>
                <p className="text-sm text-gray-500">
                  {cameraPermission === "denied"
                    ? "Camera access denied. Please enable camera permissions."
                    : 'Click "Start Scanner" to scan QR codes'}
                </p>
              </div>
            </div>
          )}

          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-48 h-48">
                {/* Corner indicators */}
                <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-blue-500"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-blue-500"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-blue-500"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-blue-500"></div>

                {/* Scanning line animation */}
                <div className="absolute inset-0 border-2 border-blue-500 rounded-lg">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 animate-pulse"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          {!isScanning ? (
            <Button onClick={startScanning} className="flex-1 bg-blue-600 hover:bg-blue-700">
              <Camera className="w-4 h-4 mr-2" />
              Start Scanner
            </Button>
          ) : (
            <Button onClick={stopScanning} variant="outline" className="flex-1 bg-transparent">
              <CameraOff className="w-4 h-4 mr-2" />
              Stop Scanner
            </Button>
          )}
        </div>
      </div>

      {/* Manual Input Fallback */}
      <div className="space-y-2">
        <div className="text-center">
          <p className="text-sm text-gray-500">Can't scan? Enter session ID manually:</p>
        </div>

        <div className="flex space-x-2">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Paste session ID or URL"
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button onClick={handleManualSubmit} disabled={!manualInput.trim()}>
            Connect
          </Button>
        </div>
      </div>
    </div>
  )
}
