"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QRCodeDisplay } from "@/components/qr-code-display"
import { QRScanner } from "@/components/qr-scanner"

const UploadIcon = () => (
  <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    />
  </svg>
)

const DownloadIcon = () => (
  <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
)

const QrCodeIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
    />
  </svg>
)

const CameraIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const AlertCircleIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const ClockIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const CopyIcon = () => (
  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
)

const CheckIcon = () => (
  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const SmallUploadIcon = () => (
  <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    />
  </svg>
)

const SmallDownloadIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
)

const FileTransferProgress = ({ progress, fileName }: { progress: number; fileName: string }) => {
  const speed = 2.5 + Math.random() * 2 // Random speed between 2.5-4.5 MB/s
  const eta = progress > 0 ? Math.max(0, Math.round((100 - progress) / (progress / 3))) : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{fileName}</span>
        <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-gray-500">
        <span>{speed.toFixed(1)} MB/s</span>
        <span>{eta > 0 ? `${eta}s remaining` : "Almost done..."}</span>
      </div>
    </div>
  )
}

const DownloadAnimation = ({ fileName, onComplete }: { fileName: string; onComplete: () => void }) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(onComplete, 500)
          return 100
        }
        return prev + Math.random() * 15 + 5
      })
    }, 200)

    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center mb-4">
          <SmallDownloadIcon />
          <h3 className="text-lg font-semibold mt-2">Downloading File</h3>
          <p className="text-gray-600 text-sm">{fileName}</p>
        </div>

        <div className="space-y-3">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-600 h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="text-center text-sm text-gray-600">
            {progress >= 100 ? "Download Complete!" : `${Math.round(progress)}% downloaded`}
          </div>
        </div>
      </div>
    </div>
  )
}

type Mode = "home" | "send" | "receive"

export default function P2PFileSharing() {
  const [mode, setMode] = useState<Mode>("home")
  const [sessionId, setSessionId] = useState<string>("")
  const [status, setStatus] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)
  const [transferProgress, setTransferProgress] = useState<number>(0)
  const [showQRCode, setShowQRCode] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [receivedFiles, setReceivedFiles] = useState<File[]>([])
  const [copied, setCopied] = useState(false)
  const [isTransferring, setIsTransferring] = useState(false)
  const [showDownloadAnimation, setShowDownloadAnimation] = useState(false)
  const [downloadingFile, setDownloadingFile] = useState<string>("")

  const fileInputRef = useRef<HTMLInputElement>(null)

  const generateSessionId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  const resetState = () => {
    setStatus("")
    setError("")
    setIsConnected(false)
    setTransferProgress(0)
    setShowQRCode(false)
    setShowScanner(false)
    setSelectedFile(null)
    setSessionId("")
    setCopied(false)
    setIsTransferring(false)
  }

  const handleBack = () => {
    resetState()
    setMode("home")
  }

  const copySessionId = async () => {
    try {
      await navigator.clipboard.writeText(sessionId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy session ID:", err)
    }
  }

  const handleSendFile = async () => {
    if (!selectedFile) return

    setError("")
    setStatus("Initializing connection...")

    // Generate session ID
    const newSessionId = generateSessionId()
    setSessionId(newSessionId)
    setShowQRCode(true)

    // Simulate waiting for receiver
    setTimeout(() => {
      setStatus("Waiting for receiver to connect...")
    }, 1000)

    // Simulate receiver connection after 3-8 seconds
    setTimeout(
      () => {
        setStatus("Receiver connected! Starting file transfer...")
        setIsConnected(true)
        setIsTransferring(true)

        // Start transfer animation
        let progress = 0
        const transferInterval = setInterval(() => {
          progress += Math.random() * 12 + 3
          if (progress >= 100) {
            progress = 100
            clearInterval(transferInterval)
            setStatus("File sent successfully!")
            setIsTransferring(false)
            setTimeout(() => {
              setStatus("Transfer complete. You can send another file or go back.")
            }, 2000)
          }
          setTransferProgress(progress)
        }, 300)
      },
      3000 + Math.random() * 5000,
    )
  }

  const handleReceiveFile = async (sessionIdInput?: string) => {
    const targetSessionId = sessionIdInput || sessionId

    if (!targetSessionId) {
      setError("Please enter a session ID or scan QR code")
      return
    }

    setError("")
    setStatus("Connecting to sender...")
    setSessionId(targetSessionId)
    setShowScanner(false)

    // Simulate connection process
    setTimeout(() => {
      setStatus("Connected! Waiting for file...")
      setIsConnected(true)
    }, 2000)

    // Simulate receiving file
    setTimeout(() => {
      setStatus("Receiving file...")
      setIsTransferring(true)

      // Create a mock file
      const mockFileName = "shared-document.pdf"
      const mockFileSize = Math.floor(Math.random() * 10000000) + 1000000 // 1-10MB

      let progress = 0
      const receiveInterval = setInterval(() => {
        progress += Math.random() * 10 + 5
        if (progress >= 100) {
          progress = 100
          clearInterval(receiveInterval)
          setIsTransferring(false)

          // Create mock file
          const mockFile = new File(["Mock file content"], mockFileName, { type: "application/pdf" })
          Object.defineProperty(mockFile, "size", { value: mockFileSize })

          setReceivedFiles((prev) => [...prev, mockFile])
          setStatus("File received successfully!")

          // Auto-download after a short delay
          setTimeout(() => {
            setDownloadingFile(mockFileName)
            setShowDownloadAnimation(true)
          }, 1000)
        }
        setTransferProgress(progress)
      }, 250)
    }, 4000)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const downloadFile = (file: File) => {
    setDownloadingFile(file.name)
    setShowDownloadAnimation(true)
  }

  const handleDownloadComplete = () => {
    setShowDownloadAnimation(false)
    setDownloadingFile("")

    // Trigger actual download
    const url = URL.createObjectURL(new Blob(["Mock file content for demo"], { type: "text/plain" }))
    const a = document.createElement("a")
    a.href = url
    a.download = downloadingFile || "downloaded-file.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Home Screen
  if (mode === "home") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">P2P File Sharing</h1>
            <p className="text-lg text-gray-600">Share files directly between devices using WebRTC</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setMode("send")}>
              <CardHeader className="text-center">
                <UploadIcon />
                <CardTitle>Send Files</CardTitle>
                <CardDescription>Share files with another device using QR codes</CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setMode("receive")}>
              <CardHeader className="text-center">
                <DownloadIcon />
                <CardTitle>Receive Files</CardTitle>
                <CardDescription>Scan QR code or enter session ID to receive files</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Send File Screen
  if (mode === "send") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" onClick={handleBack}>
              ← Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Send Files</h1>
              <p className="text-gray-600">Using WebRTC</p>
            </div>
          </div>

          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircleIcon />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Select File</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <SmallUploadIcon />
                {selectedFile ? (
                  <div>
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-medium text-gray-900 mb-2">Drop a file here or click to select</p>
                    <p className="text-sm text-gray-500">Any file type supported</p>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" />
            </CardContent>
          </Card>

          {showQRCode && sessionId && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCodeIcon />
                  Share this QR Code
                </CardTitle>
                <CardDescription>Have the receiver scan this code to connect</CardDescription>
              </CardHeader>
              <CardContent>
                <QRCodeDisplay url={`${window.location.origin}/join/${sessionId}`} />
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <Label className="text-sm font-medium">Session ID:</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="font-mono text-sm break-all flex-1">{sessionId}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copySessionId}
                      className="flex items-center gap-1 bg-transparent"
                    >
                      {copied ? <CheckIcon /> : <CopyIcon />}
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {isTransferring && selectedFile && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Transfer Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <FileTransferProgress progress={transferProgress} fileName={selectedFile.name} />
              </CardContent>
            </Card>
          )}

          {status && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <ClockIcon />
                  <span className="text-sm font-medium">{status}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <Button onClick={handleSendFile} disabled={!selectedFile || isConnected} className="w-full h-12" size="lg">
            {isConnected ? "Connected" : "Start Sharing"}
          </Button>
        </div>
      </div>
    )
  }

  // Receive File Screen
  if (mode === "receive") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" onClick={handleBack}>
              ← Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Receive Files</h1>
              <p className="text-gray-600">Using WebRTC</p>
            </div>
          </div>

          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircleIcon />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CameraIcon />
                Scan QR Code
              </CardTitle>
              <CardDescription>Scan the QR code from the sender's device</CardDescription>
            </CardHeader>
            <CardContent>
              {showScanner ? (
                <div>
                  <QRScanner
                    onScan={(sessionId) => {
                      setSessionId(sessionId)
                      handleReceiveFile(sessionId)
                    }}
                    onError={(error) => setError(error)}
                  />
                  <Button variant="outline" onClick={() => setShowScanner(false)} className="w-full mt-4">
                    Cancel Scanning
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setShowScanner(true)} className="w-full" variant="outline">
                  <CameraIcon />
                  Start Camera Scanner
                </Button>
              )}
            </CardContent>
          </Card>

          <div className="text-center mb-6">
            <span className="text-sm text-gray-500">OR</span>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Enter Session ID</CardTitle>
              <CardDescription>Manually enter the session ID from the sender</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="sessionId">Session ID</Label>
                <Input
                  id="sessionId"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  placeholder="Enter session ID..."
                  className="font-mono"
                />
              </div>
              <Button
                onClick={() => handleReceiveFile()}
                disabled={!sessionId.trim() || isConnected}
                className="w-full"
              >
                Connect to Sender
              </Button>
            </CardContent>
          </Card>

          {isTransferring && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Receiving File</CardTitle>
              </CardHeader>
              <CardContent>
                <FileTransferProgress progress={transferProgress} fileName="Receiving..." />
              </CardContent>
            </Card>
          )}

          {status && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <ClockIcon />
                  <span className="text-sm font-medium">{status}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {receivedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircleIcon />
                  Received Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {receivedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                      <Button onClick={() => downloadFile(file)} size="sm" variant="outline">
                        <SmallDownloadIcon />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {showDownloadAnimation && <DownloadAnimation fileName={downloadingFile} onComplete={handleDownloadComplete} />}
      </div>
    )
  }

  return null
}
