"use client"

import { useState, useEffect } from "react"
import { generateQRCode } from "@/lib/qr-service"

interface QRCodeDisplayProps {
  url: string
  size?: number
}

export function QRCodeDisplay({ url, size = 200 }: QRCodeDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const generateCode = async () => {
      try {
        setLoading(true)
        const qrUrl = await generateQRCode(url)
        setQrCodeUrl(qrUrl)
      } catch (err) {
        setError("Failed to generate QR code")
        console.error("QR code generation error:", err)
      } finally {
        setLoading(false)
      }
    }

    if (url) {
      generateCode()
    }
  }, [url])

  if (loading) {
    return (
      <div
        className="bg-gray-100 rounded-lg flex items-center justify-center animate-pulse"
        style={{ width: size, height: size }}
      >
        <p className="text-sm text-gray-500">Generating QR code...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="bg-red-50 border border-red-200 rounded-lg flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <p className="text-sm text-red-600 text-center px-2">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      <img
        src={qrCodeUrl || "/placeholder.svg"}
        alt="QR Code"
        className="rounded-lg border"
        style={{ width: size, height: size }}
      />
      <p className="text-xs text-gray-500 mt-2 text-center">Scan with your camera app or QR scanner</p>
    </div>
  )
}
