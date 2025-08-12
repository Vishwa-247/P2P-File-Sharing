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

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionId = params.id
    const { answer } = await request.json()

    if (!answer) {
      return NextResponse.json({ error: "Answer is required" }, { status: 400 })
    }

    // Validate answer structure
    if (!answer.type || !answer.sdp) {
      return NextResponse.json({ error: "Invalid answer format" }, { status: 400 })
    }

    const session = sessions.get(sessionId)
    if (!session) {
      return NextResponse.json({ error: "Session not found or expired" }, { status: 404 })
    }

    // Check if session is expired
    const oneHour = 60 * 60 * 1000
    if (Date.now() - session.createdAt > oneHour) {
      sessions.delete(sessionId)
      return NextResponse.json({ error: "Session expired" }, { status: 410 })
    }

    // Store answer and update session
    session.answer = answer
    session.lastActivity = Date.now()
    session.status = "connected"
    sessions.set(sessionId, session)

    console.log(`Answer stored for session ${sessionId}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error storing answer:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionId = params.id
    const session = sessions.get(sessionId)

    if (!session || !session.answer) {
      return NextResponse.json({ error: "Answer not found" }, { status: 404 })
    }

    // Check if session is expired
    const oneHour = 60 * 60 * 1000
    if (Date.now() - session.createdAt > oneHour) {
      sessions.delete(sessionId)
      return NextResponse.json({ error: "Session expired" }, { status: 410 })
    }

    // Update activity
    session.lastActivity = Date.now()
    sessions.set(sessionId, session)

    console.log(`Answer retrieved for session ${sessionId}`)
    return NextResponse.json({ answer: session.answer })
  } catch (error) {
    console.error("Error retrieving answer:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
