"use client"

import { useParams } from "next/navigation"
import { useEffect, useState, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Loader2, CheckCircle, AlertCircle, File } from "lucide-react"
import { WebRTCService, getOffer, sendAnswer, type FileTransferProgress } from "@/lib/webrtc-service"

export default function JoinPage() {
  const params = useParams()
  const sessionId = params.id as string
  const [status, setStatus] = useState<"connecting" | "connected" | "receiving" | "completed" | "error">("connecting")
  const [error, setError] = useState<string>("")
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState<string>("")
  const [fileSize, setFileSize] = useState<number>(0)
  const webrtcServiceRef = useRef<WebRTCService | null>(null)

  const connectToSession = useCallback(async () => {
    if (!sessionId) return

    try {
      // Get offer from signaling server
      const offer = await getOffer(sessionId)

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
        onProgress: (progress: FileTransferProgress) => {
          setProgress(progress.percentage)
          if (!fileName && progress.totalBytes > 0) {
            setFileSize(progress.totalBytes)
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
      })

      // Create answer
      const answer = await webrtcServiceRef.current.createAnswer(offer)

      // Send answer to signaling server
      await sendAnswer(sessionId, answer)
    } catch (err) {
      setStatus("error")
      setError(err instanceof Error ? err.message : "Failed to connect to session")
    }
  }, [sessionId, fileName])

  useEffect(() => {
    if (sessionId) {
      connectToSession()
    }

    // Cleanup on unmount
    return () => {
      if (webrtcServiceRef.current) {
        webrtcServiceRef.current.cleanup()
      }
    }
  }, [sessionId, connectToSession])

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
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Download className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle>Joining Session</CardTitle>
          <CardDescription>Session ID: {sessionId}</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === "connecting" && (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Connecting to sender...</span>
            </div>
          )}

          {status === "connected" && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Connected! Waiting for file transfer to begin...</AlertDescription>
            </Alert>
          )}

          {status === "receiving" && (
            <div className="space-y-4">
              <Alert>
                <Download className="h-4 w-4" />
                <AlertDescription>Receiving file...</AlertDescription>
              </Alert>

              {fileName && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <File className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">{fileName}</span>
                  </div>
                  <p className="text-sm text-gray-600">{formatFileSize(fileSize)}</p>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            </div>
          )}

          {status === "completed" && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>File received successfully! Check your downloads folder.</AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <div className="text-red-600">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Connection failed: {error}</AlertDescription>
              </Alert>
              <Button onClick={() => (window.location.href = "/")} className="mt-4">
                Go Home
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
