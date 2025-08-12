"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Download, Wifi, File, ArrowLeft, CheckCircle, AlertCircle, Copy } from "lucide-react"
import {
  WebRTCService,
  createSession,
  getOffer,
  sendAnswer,
  getAnswer,
  cleanupSession,
  type FileTransferProgress,
} from "@/lib/webrtc-service"
import { QRCodeDisplay } from "@/components/qr-code-display"
import { QRScannerComponent } from "@/components/qr-scanner"
import { FileTransferProgressComponent } from "@/components/file-transfer-progress"

export default function HomePage() {
  const [mode, setMode] = useState<"home" | "send" | "receive">("home")

  if (mode === "send") {
    return <SendFileComponent onBack={() => setMode("home")} />
  }

  if (mode === "receive") {
    return <ReceiveFileComponent onBack={() => setMode("home")} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Wifi className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">P2P File Share</CardTitle>
          <CardDescription>Share files directly between devices using peer-to-peer connection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => setMode("send")} className="w-full h-14 text-lg" size="lg">
            <Upload className="w-5 h-5 mr-2" />
            Send File
          </Button>
          <Button onClick={() => setMode("receive")} variant="outline" className="w-full h-14 text-lg" size="lg">
            <Download className="w-5 h-5 mr-2" />
            Receive File
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function SendFileComponent({ onBack }: { onBack: () => void }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [status, setStatus] = useState<
    "idle" | "creating-session" | "waiting-for-receiver" | "connected" | "transferring" | "completed" | "error"
  >("idle")
  const [progress, setProgress] = useState<FileTransferProgress | null>(null)
  const [sessionId, setSessionId] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const webrtcServiceRef = useRef<WebRTCService | null>(null)

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setStatus("idle")
    }
  }, [])

  const handleStartSharing = useCallback(async () => {
    if (!selectedFile) return

    setStatus("creating-session")
    setError("")

    try {
      // Create WebRTC service
      webrtcServiceRef.current = new WebRTCService({
        onConnectionStateChange: (state) => {
          if (state === "connected") {
            setStatus("connected")
          } else if (state === "failed" || state === "disconnected") {
            setStatus("error")
            setError("Connection failed")
          }
        },
        onDataChannelOpen: () => {
          setStatus("connected")
          // Start file transfer
          setTimeout(() => {
            if (webrtcServiceRef.current && selectedFile) {
              setStatus("transferring")
              webrtcServiceRef.current.sendFile(selectedFile)
            }
          }, 500)
        },
        onProgress: (progressData: FileTransferProgress) => {
          setProgress(progressData)
          if (progressData.percentage === 100) {
            setStatus("completed")
          }
        },
        onError: (errorMsg) => {
          setStatus("error")
          setError(errorMsg)
        },
        onTransferCancelled: () => {
          setStatus("error")
          setError("Transfer was cancelled")
        },
      })

      // Create offer
      const offer = await webrtcServiceRef.current.createOffer()

      // Send offer to signaling server
      const newSessionId = await createSession(offer)
      setSessionId(newSessionId)
      // Set session ID for cleanup tracking
      webrtcServiceRef.current.setSessionId(newSessionId)
      setQrCodeUrl(`${window.location.origin}/join/${newSessionId}`)
      setStatus("waiting-for-receiver")

      // Poll for answer with timeout
      let pollAttempts = 0
      const maxPollAttempts = 30 // 1 minute timeout

      const pollForAnswer = async () => {
        try {
          const answer = await getAnswer(newSessionId)
          if (webrtcServiceRef.current) {
            await webrtcServiceRef.current.setAnswer(answer)
          }
        } catch (err) {
          pollAttempts++
          if (pollAttempts >= maxPollAttempts) {
            setStatus("error")
            setError("Connection timeout - no receiver joined")
            return
          }
          // Answer not ready yet, try again
          setTimeout(pollForAnswer, 2000)
        }
      }

      setTimeout(pollForAnswer, 2000)
    } catch (err) {
      setStatus("error")
      setError(err instanceof Error ? err.message : "Failed to create session")
    }
  }, [selectedFile])

  const handleCancelTransfer = useCallback(() => {
    if (webrtcServiceRef.current) {
      webrtcServiceRef.current.cancelTransfer()
    }
  }, [])

  const copyToClipboard = useCallback(async () => {
    if (qrCodeUrl) {
      await navigator.clipboard.writeText(qrCodeUrl)
    }
  }, [qrCodeUrl])

  // Enhanced cleanup with session cleanup
  useEffect(() => {
    return () => {
      if (webrtcServiceRef.current) {
        webrtcServiceRef.current.cleanup()
      }
      if (sessionId) {
        cleanupSession(sessionId).catch(console.error)
      }
    }
  }, [sessionId])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <CardTitle>Send File</CardTitle>
              <CardDescription>Select a file to share with another device</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selectedFile && status === "idle" && (
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <File className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">Click to select a file</p>
                <p className="text-xs text-gray-500">Any file type supported (max 100MB)</p>
              </div>
              <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" />
            </div>
          )}

          {selectedFile && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center space-x-2">
                <File className="w-5 h-5 text-blue-600" />
                <span className="font-medium truncate">{selectedFile.name}</span>
              </div>
              <p className="text-sm text-gray-600">{formatFileSize(selectedFile.size)}</p>
              {status === "idle" && (
                <Button onClick={handleStartSharing} className="w-full mt-2">
                  Start Sharing
                </Button>
              )}
            </div>
          )}

          {status === "creating-session" && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Creating sharing session...</AlertDescription>
            </Alert>
          )}

          {status === "waiting-for-receiver" && qrCodeUrl && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Ready to share! Have the receiver scan the QR code or visit the link.
                </AlertDescription>
              </Alert>

              <div className="bg-white p-4 rounded-lg border text-center">
                <div className="mb-4 flex justify-center">
                  <QRCodeDisplay url={qrCodeUrl} size={192} />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={qrCodeUrl}
                    readOnly
                    className="flex-1 px-3 py-2 text-sm border rounded bg-gray-50"
                  />
                  <Button size="sm" onClick={copyToClipboard}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {status === "connected" && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Connected! Starting transfer...</AlertDescription>
            </Alert>
          )}

          {status === "transferring" && progress && selectedFile && (
            <FileTransferProgressComponent
              progress={progress}
              fileName={selectedFile.name}
              onCancel={handleCancelTransfer}
              showCancel={true}
            />
          )}

          {status === "completed" && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>File sent successfully!</AlertDescription>
            </Alert>
          )}

          {status === "error" && error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ReceiveFileComponent({ onBack }: { onBack: () => void }) {
  const [sessionId, setSessionId] = useState<string>("")
  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "receiving" | "completed" | "error">(
    "idle",
  )
  const [progress, setProgress] = useState<FileTransferProgress | null>(null)
  const [fileName, setFileName] = useState<string>("")
  const [fileSize, setFileSize] = useState<number>(0)
  const [error, setError] = useState<string>("")
  const webrtcServiceRef = useRef<WebRTCService | null>(null)

  const handleConnect = useCallback(async () => {
    if (!sessionId.trim()) return

    setStatus("connecting")
    setError("")

    try {
      // Get offer from signaling server
      const offer = await getOffer(sessionId.trim())

      // Create WebRTC service
      webrtcServiceRef.current = new WebRTCService({
        onConnectionStateChange: (state) => {
          if (state === "connected") {
            setStatus("connected")
          } else if (state === "failed" || state === "disconnected") {
            setStatus("error")
            setError("Connection failed")
          }
        },
        onDataChannelOpen: () => {
          setStatus("receiving")
        },
        onProgress: (progressData: FileTransferProgress) => {
          setProgress(progressData)
          if (!fileName && progressData.totalBytes > 0) {
            setFileSize(progressData.totalBytes)
          }
        },
        onFileReceived: (file) => {
          setFileName(file.name)
          setFileSize(file.size)
          setStatus("completed")

          // Trigger download
          const url = URL.createObjectURL(file)
          const a = document.createElement("a")
          a.href = url
          a.download = file.name
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        },
        onError: (errorMsg) => {
          setStatus("error")
          setError(errorMsg)
        },
        onTransferCancelled: () => {
          setStatus("error")
          setError("Transfer was cancelled by sender")
        },
      })

      // Set session ID for cleanup tracking
      webrtcServiceRef.current.setSessionId(sessionId.trim())

      // Create answer
      const answer = await webrtcServiceRef.current.createAnswer(offer)

      // Send answer to signaling server
      await sendAnswer(sessionId.trim(), answer)
    } catch (err) {
      setStatus("error")
      setError(err instanceof Error ? err.message : "Failed to connect")
    }
  }, [sessionId, fileName])

  const handleQRScan = useCallback(
    (sessionId: string) => {
      setSessionId(sessionId)
      handleConnect()
    },
    [handleConnect],
  )

  // Enhanced cleanup with session cleanup
  useEffect(() => {
    return () => {
      if (webrtcServiceRef.current) {
        webrtcServiceRef.current.cleanup()
      }
    }
  }, [])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <CardTitle>Receive File</CardTitle>
              <CardDescription>Enter session ID or scan QR code to receive a file</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "idle" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="sessionId" className="text-sm font-medium">
                  Session ID
                </label>
                <input
                  id="sessionId"
                  type="text"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  placeholder="Enter session ID from sender"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button onClick={handleConnect} disabled={!sessionId.trim()} className="w-full">
                Connect to Sender
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">Or scan QR code:</p>
                <QRScannerComponent
                  onScan={handleQRScan}
                  onError={(error) => {
                    setStatus("error")
                    setError(error)
                  }}
                />
              </div>
            </div>
          )}

          {status === "connecting" && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Connecting to sender...</AlertDescription>
            </Alert>
          )}

          {status === "connected" && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Connected! Waiting for file transfer to begin...</AlertDescription>
            </Alert>
          )}

          {status === "receiving" && progress && (
            <div className="space-y-4">
              <Alert>
                <Download className="h-4 w-4" />
                <AlertDescription>Receiving file...</AlertDescription>
              </Alert>

              <FileTransferProgressComponent
                progress={progress}
                fileName={fileName || "Receiving file..."}
                showCancel={false}
              />
            </div>
          )}

          {status === "completed" && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>File received successfully! Check your downloads folder.</AlertDescription>
            </Alert>
          )}

          {status === "error" && error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
