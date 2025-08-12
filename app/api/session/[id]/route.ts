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

// Get session status
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionId = params.id
    const session = sessions.get(sessionId)

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Check if session is expired
    const oneHour = 60 * 60 * 1000
    if (Date.now() - session.createdAt > oneHour) {
      sessions.delete(sessionId)
      return NextResponse.json({ error: "Session expired" }, { status: 410 })
    }

    return NextResponse.json({
      status: session.status,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
      connectionCount: session.connectionCount,
    })
  } catch (error) {
    console.error("Error getting session status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Update session status or cleanup
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionId = params.id
    const { status, action } = await request.json()

    const session = sessions.get(sessionId)
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    if (action === "cleanup") {
      sessions.delete(sessionId)
      console.log(`Session ${sessionId} cleaned up by request`)
      return NextResponse.json({ success: true })
    }

    if (status && ["waiting", "connected", "completed", "expired"].includes(status)) {
      session.status = status
      session.lastActivity = Date.now()
      sessions.set(sessionId, session)
      console.log(`Session ${sessionId} status updated to ${status}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Delete session
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionId = params.id
    const deleted = sessions.delete(sessionId)

    if (deleted) {
      console.log(`Session ${sessionId} deleted`)
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error deleting session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
