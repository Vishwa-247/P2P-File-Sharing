import { type NextRequest, NextResponse } from "next/server"

// Access the same sessions map
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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionId = params.id
    const session = sessions.get(sessionId)

    if (!session || !session.offer) {
      return NextResponse.json({ error: "Session not found or expired" }, { status: 404 })
    }

    // Check if session is expired
    const oneHour = 60 * 60 * 1000
    if (Date.now() - session.createdAt > oneHour) {
      sessions.delete(sessionId)
      return NextResponse.json({ error: "Session expired" }, { status: 410 })
    }

    // Update activity and connection count
    session.lastActivity = Date.now()
    session.connectionCount += 1

    // Limit connections per session for security
    if (session.connectionCount > 5) {
      return NextResponse.json({ error: "Too many connection attempts" }, { status: 429 })
    }

    sessions.set(sessionId, session)

    console.log(`Session ${sessionId} accessed, connection count: ${session.connectionCount}`)
    return NextResponse.json({ offer: session.offer })
  } catch (error) {
    console.error("Error retrieving offer:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
