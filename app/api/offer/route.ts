import { type NextRequest, NextResponse } from "next/server"

// Enhanced session storage with connection tracking
const sessions = new Map<
  string,
  {
    offer?: RTCSessionDescriptionInit
    answer?: RTCSessionDescriptionInit
    createdAt: number
    lastActivity: number
    status: "waiting" | "connected" | "completed" | "expired"
    connectionCount: number
  }
>()

// Clean up old sessions (older than 1 hour) and inactive sessions (no activity for 10 minutes)
function cleanupSessions() {
  const oneHour = 60 * 60 * 1000
  const tenMinutes = 10 * 60 * 1000
  const now = Date.now()

  for (const [sessionId, session] of sessions.entries()) {
    const isExpired = now - session.createdAt > oneHour
    const isInactive = now - session.lastActivity > tenMinutes

    if (isExpired || isInactive) {
      sessions.delete(sessionId)
      console.log(`Cleaned up session ${sessionId}: ${isExpired ? "expired" : "inactive"}`)
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupSessions, 5 * 60 * 1000)

export async function POST(request: NextRequest) {
  try {
    cleanupSessions()

    const { offer } = await request.json()

    if (!offer) {
      return NextResponse.json({ error: "Offer is required" }, { status: 400 })
    }

    // Validate offer structure
    if (!offer.type || !offer.sdp) {
      return NextResponse.json({ error: "Invalid offer format" }, { status: 400 })
    }

    // Generate unique session ID
    const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    // Store offer with enhanced tracking
    sessions.set(sessionId, {
      offer,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      status: "waiting",
      connectionCount: 0,
    })

    console.log(`Created session ${sessionId}`)
    return NextResponse.json({ sessionId })
  } catch (error) {
    console.error("Error storing offer:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
