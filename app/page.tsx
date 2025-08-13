"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Download, QrCode, Camera, CheckCircle, AlertCircle, Clock, Copy, Check } from "lucide-react"
import {
  WebRTCService,
  type FileTransferProgress,
  createSession,
  getOffer,
  sendAnswer,
  getAnswer,
  cleanupSession,
} from "@/lib/webrtc-service"
import { QRCodeDisplay } from "@/components/qr-code-display"
import { QRScanner } from "@/components/qr-scanner"
import { FileTransferProgressComponent } from "@/components/file-transfer-progress"

type Mode = "home" | "send" | "receive"

export default function P2PFileSharing() {
  const [mode, setMode] = useState<Mode>("home")
  const [sessionId, setSessionId] = useState<string>("")
  const [status, setStatus] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)
  const [transferProgress, setTransferProgress] = useState<FileTransferProgress | null>(null)
  const [showQRCode, setShowQRCode] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [receivedFiles, setReceivedFiles] = useState<File[]>([])
  const [copied, setCopied] = useState(false)

  const webrtcService = useRef<WebRTCService | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (webrtcService.current) {
        webrtcService.current.cleanup()
      }
      if (sessionId) {
        cleanupSession(sessionId).catch(console.error)
      }
    }
  }, [sessionId])

  const resetState = () => {
    setStatus("")
    setError("")
    setIsConnected(false)
    setTransferProgress(null)
    setShowQRCode(false)
    setShowScanner(false)
    setSelectedFile(null)
    setSessionId("")
    setCopied(false)

    if (webrtcService.current) {
      webrtcService.current.cleanup()
      webrtcService.current = null
    }
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

    try {
      setError("")
      setStatus("Initializing connection...")

      webrtcService.current = new WebRTCService({
        onConnectionStateChange: (state) => {
          setStatus(`Connection: ${state}`)
          if (state === "connected") {
            setIsConnected(true)
            setShowQRCode(false)
            setStatus("Sending file...")
            // Send file once connected
            webrtcService.current?.sendFile(selectedFile).catch((err) => {
              setError(err.message)
            })
          } else if (state === "failed" || state === "disconnected") {
            setError("Connection failed. Please try again.")
          }
        },
        onProgress: (progress) => {
          setTransferProgress(progress)
        },
        onError: (error) => {
          setError(error)
          setStatus("")
        },
      })

      // Create the WebRTC offer first
      const offer = await webrtcService.current.createOffer()

      // Then create session with the offer
      const newSessionId = await createSession(offer)
      setSessionId(newSessionId)
      webrtcService.current.setSessionId(newSessionId)
      setShowQRCode(true)
      setStatus("Waiting for receiver to connect...")

      // Poll for answer
      const pollForAnswer = async () => {
        try {
          const answer = await getAnswer(newSessionId)
          await webrtcService.current?.setAnswer(answer)
        } catch (err) {
          // Continue polling if no answer yet
          setTimeout(pollForAnswer, 2000)
        }
      }

      setTimeout(pollForAnswer, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send file")
      setStatus("")
    }
  }

  const handleReceiveFile = async (sessionIdInput?: string) => {
    try {
      setError("")
      const targetSessionId = sessionIdInput || sessionId

      if (!targetSessionId) {
        setError("Please enter a session ID or scan QR code")
        return
      }

      setStatus("Connecting to sender...")

      webrtcService.current = new WebRTCService({
        onConnectionStateChange: (state) => {
          setStatus(`Connection: ${state}`)
          setIsConnected(state === "connected")
        },
        onProgress: (progress) => {
          setTransferProgress(progress)
        },
        onFileReceived: (file) => {
          setReceivedFiles((prev) => [...prev, file])
          setStatus("File received successfully!")
          setTransferProgress(null)
        },
        onError: (error) => {
          setError(error)
          setStatus("")
        },
      })

      // Get offer from sender
      const offer = await getOffer(targetSessionId)

      // Create answer
      const answer = await webrtcService.current.createAnswer(offer)

      // Send answer back to sender
      await sendAnswer(targetSessionId, answer)

      webrtcService.current.setSessionId(targetSessionId)
      setSessionId(targetSessionId)
      setShowScanner(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to receive file")
      setStatus("")
    }
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
    const url = URL.createObjectURL(file)
    const a = document.createElement("a")
    a.href = url
    a.download = file.name
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

          {/* Action Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setMode("send")}>
              <CardHeader className="text-center">
                <Upload className="h-12 w-12 mx-auto text-blue-600 mb-4" />
                <CardTitle>Send Files</CardTitle>
                <CardDescription>Share files with another device using QR codes</CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setMode("receive")}>
              <CardHeader className="text-center">
                <Download className="h-12 w-12 mx-auto text-green-600 mb-4" />
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
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* File Selection */}
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
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
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

          {/* QR Code Display */}
          {showQRCode && sessionId && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
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
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transfer Progress */}
          {transferProgress && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Transfer Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <FileTransferProgressComponent progress={transferProgress} />
              </CardContent>
            </Card>
          )}

          {/* Status */}
          {status && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">{status}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Send Button */}
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
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* QR Scanner */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
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
                  <Camera className="h-4 w-4 mr-2" />
                  Start Camera Scanner
                </Button>
              )}
            </CardContent>
          </Card>

          <div className="text-center mb-6">
            <span className="text-sm text-gray-500">OR</span>
          </div>

          {/* Manual Session ID Input */}
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

          {/* Transfer Progress */}
          {transferProgress && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Receiving File</CardTitle>
              </CardHeader>
              <CardContent>
                <FileTransferProgressComponent progress={transferProgress} />
              </CardContent>
            </Card>
          )}

          {/* Status */}
          {status && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">{status}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Received Files */}
          {receivedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
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
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  return null
}
