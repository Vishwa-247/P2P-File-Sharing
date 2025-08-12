"use client"

import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { FileTransferProgress } from "@/lib/webrtc-service"
import { X, Clock, Zap } from "lucide-react"

interface FileTransferProgressProps {
  progress: FileTransferProgress
  fileName: string
  onCancel?: () => void
  showCancel?: boolean
}

export function FileTransferProgressComponent({
  progress,
  fileName,
  onCancel,
  showCancel = false,
}: FileTransferProgressProps) {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  const formatSpeed = (bytesPerSecond: number): string => {
    return formatBytes(bytesPerSecond) + "/s"
  }

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* File Info */}
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{fileName}</p>
            <p className="text-sm text-gray-500">
              {formatBytes(progress.bytesTransferred)} of {formatBytes(progress.totalBytes)}
            </p>
          </div>
          {showCancel && onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel} className="ml-2">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{progress.percentage}%</span>
          </div>
          <Progress value={progress.percentage} className="h-2" />
        </div>

        {/* Transfer Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-blue-500" />
            <div>
              <p className="text-gray-500">Speed</p>
              <p className="font-medium">{formatSpeed(progress.transferSpeed)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-green-500" />
            <div>
              <p className="text-gray-500">ETA</p>
              <p className="font-medium">
                {progress.estimatedTimeRemaining > 0 ? formatTime(progress.estimatedTimeRemaining) : "Calculating..."}
              </p>
            </div>
          </div>
        </div>

        {/* Elapsed Time */}
        <div className="text-xs text-gray-500 text-center">Elapsed: {formatTime(progress.elapsedTime)}</div>
      </CardContent>
    </Card>
  )
}
