"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

const CongratulationsScreen = ({
  mode,
  fileName,
  onBack,
}: { mode: "send" | "receive"; fileName: string; onBack: () => void }) => (
  <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8 p-4 bg-white rounded-lg shadow-sm">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2 bg-transparent">
          ← Back to Home
        </Button>
        <div className="text-sm text-gray-600">Transfer Complete</div>
      </div>

      <div className="text-center">
        <div className="mb-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🎉 Congratulations!</h1>
          <p className="text-lg text-gray-600">
            {mode === "send"
              ? `Your file "${fileName}" has been successfully sent!`
              : `You have successfully received "${fileName}"!`}
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircleIcon />
                <span className="font-medium">Transfer Completed Successfully</span>
              </div>

              {mode === "receive" && (
                <div className="text-sm text-gray-600">
                  <p>The file has been automatically downloaded to your device.</p>
                  <p>Check your Downloads folder to access the file.</p>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500">
                  File: <span className="font-mono">{fileName}</span>
                </p>
                <p className="text-sm text-gray-500">Transfer method: WebRTC P2P</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button onClick={onBack} className="w-full" size="lg">
            Transfer Another File
          </Button>
          <Button variant="outline" onClick={onBack} className="w-full bg-transparent">
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  </div>
)

type Mode = "home" | "send" | "receive" | "congratulations"

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
  const [completedFileName, setCompletedFileName] = useState<string>("")

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
    }, 1500)

    // Simulate receiver connection after 5-10 seconds
    setTimeout(
      () => {
        setStatus("Receiver connected! Preparing file transfer...")
        setIsConnected(true)

        setTimeout(() => {
          setStatus("Starting secure file transfer...")
          setIsTransferring(true)

          let progress = 0
          const transferInterval = setInterval(() => {
            progress += Math.random() * 4 + 1 // Slower progress: 1-5% per interval
            if (progress >= 100) {
              progress = 100
              clearInterval(transferInterval)
              setStatus("File sent successfully!")
              setIsTransferring(false)
              setCompletedFileName(selectedFile.name)

              setTimeout(() => {
                setMode("congratulations")
              }, 2000)
            }
            setTransferProgress(progress)
          }, 800) // Slower interval: 800ms instead of 300ms
        }, 2000)
      },
      5000 + Math.random() * 5000, // 5-10 seconds wait
    )
  }

  const handleReceiveFile = async (sessionIdInput?: string) => {
    const targetSessionId = sessionIdInput || sessionId

    if (!targetSessionId) {
      return
    }

    setStatus("Connected! Preparing to receive file...")
    setSessionId(targetSessionId)
    setShowScanner(false)
    setIsConnected(true)

    setTimeout(() => {
      setStatus("Receiving file...")
      setIsTransferring(true)

      const cheatSheetContent = `MERN + Next.js + Tailwind CSS Interview Cheat Sheet

1. Next.js
Q: What is Next.js?
A: Next.js is like a super-powered React. It helps make websites faster by loading pages before you click them and lets you decide if you want the page made at build time (SSG) or each time someone visits (SSR).

Q: Difference between SSR (Server-Side Rendering) and SSG (Static Site Generation)?
A:
• SSR: Make the page fresh every time someone visits (like cooking food when ordered).
• SSG: Make the page once and give it to everyone (like ready-to-eat food).

Q: What are API routes in Next.js?
A: A way to make a small backend inside Next.js itself. Instead of making a separate Node server, you can create a file in /pages/api and boom — that's your API.

Q: Difference between Next.js and React?
A: React only runs in the browser. Next.js runs both in the browser and on the server, making it faster and better for SEO.

2. React.js
Q: What is the Virtual DOM?
A: It's like a draft paper of your web page. React changes the draft first, and only updates the real page where needed. That makes it faster.

Q: What are props?
A: Props are like gift boxes. You send them from one component to another so the child can use them.

Q: What are hooks?
A: Hooks are special tools in React that give superpowers to your function components.
• useState → Remember values
• useEffect → Do something after the page changes
• useContext → Share data with many components without passing props

Q: Controlled vs Uncontrolled components?
A:
• Controlled: React is the boss and decides the value of inputs.
• Uncontrolled: The browser decides the value of inputs.

3. Tailwind CSS
Q: What is Tailwind CSS?
A: Tailwind is like Lego blocks for design. Instead of writing CSS files, you just put ready-made classes in your HTML and your design appears.

Q: How to make something responsive in Tailwind?
A: Use size labels like sm:, md:, lg: before classes.
Example: sm:text-sm md:text-lg lg:text-xl

Q: Can I customize Tailwind?
A: Yes. You change the tailwind.config.js file and set your own colors, fonts, or sizes.

4. Node.js & Express.js
Q: What is Node.js?
A: Node.js lets you run JavaScript outside the browser — like on a server.

Q: What is Express.js?
A: Express is a helper for Node.js that makes building APIs and websites easier.

Q: What is middleware?
A: Middleware is like a security guard. Before your request reaches the final route, middleware can check, change, or stop it.

Q: How to create a simple GET API in Express?
A:
const express = require('express');
const app = express();

app.get('/hello', (req, res) => {
  res.send('Hello World');
});

app.listen(3000);

5. MongoDB
Q: SQL vs NoSQL?
A:
• SQL: Data in tables (rows & columns).
• NoSQL: Data in JSON-like documents.

Q: How to save data in MongoDB using Mongoose?
A:
const User = new mongoose.model("User", { name: String });
const newUser = new User({ name: "Vishwa" });
await newUser.save();

Q: What is indexing in MongoDB?
A: It's like a book index — makes finding data faster.

6. Git & General
Q: How to create a new branch in Git?
A:
git checkout -b new-branch
It's like making a copy of your code to work on separately.

Q: How to merge in Git?
A:
git checkout main
git merge new-branch
It's like taking changes from your copy and putting them back into the main book.

Advanced but Easy to Remember
1. Debouncing — Wait before doing something until the user stops typing/clicking.
2. Throttling — Allow something to happen only once in a set time.
3. JWT — A special token that proves you are logged in.

Technical Questions — Core Skills
They'll test your knowledge in the stack mentioned in the JD.

Next.js
• Difference between Next.js and React.js
• What are pages and routing in Next.js?
• How does server-side rendering (SSR) differ from static site generation (SSG)?
• How to use API routes in Next.js?

React.js
• Difference between functional and class components
• How React hooks work (useState, useEffect, useContext)
• How to pass props and handle state changes between components
• What is virtual DOM and how React uses it?

Tailwind CSS
• How Tailwind differs from normal CSS
• Example of applying responsive classes (e.g., sm:, md:, lg:)
• How to customize Tailwind config

Node.js & Express.js
• How to create a basic Express server
• Difference between middleware and route handlers
• How to handle errors in Express
• REST API structure (GET, POST, PUT, DELETE)

MongoDB
• Difference between SQL and NoSQL databases
• How to define a schema in Mongoose
• How to query documents in MongoDB (find, findOne, update, delete)
• Indexing and when to use it

Practical / Scenario-Based
They might give small problem-solving tasks:
• Create a REST API endpoint to fetch data from MongoDB
• Build a simple form in React and send data to backend API
• Optimize a slow-loading page in Next.js
• Debug a piece of code that has state management issues

Behavioral / Team Fit
They want to see if you fit their work culture:
• Tell me about a project you worked on with the MERN stack
• How do you handle deadlines?
• How do you collaborate with a designer or backend developer?
• How do you debug when you face an error?

Possible Small Coding Test
You could be asked to:
• Implement a to-do list app in React
• Build an Express.js route for CRUD operations
• Style a component using Tailwind CSS
• Query a MongoDB database and return results

How to Prepare Before Monday
• Revise Next.js basics (pages, routing, SSR vs SSG, API routes)
• Practice React hooks and state management
• Build 1-2 small Node.js + MongoDB APIs
• Revise Tailwind classes and how to make responsive UIs quickly
• Brush up Git basics (commit, branch, merge, push)
• Prepare to explain your past projects clearly`

      const mockFileName = "MERN-NextJS-Interview-CheatSheet.txt"

      let progress = 0
      const receiveInterval = setInterval(() => {
        progress += Math.random() * 3 + 2 // Slower progress: 2-5% per interval
        if (progress >= 100) {
          progress = 100
          clearInterval(receiveInterval)
          setIsTransferring(false)

          // Create the actual cheat sheet file
          const cheatSheetFile = new File([cheatSheetContent], mockFileName, { type: "text/plain" })
          Object.defineProperty(cheatSheetFile, "size", { value: cheatSheetContent.length })

          setReceivedFiles((prev) => [...prev, cheatSheetFile])
          setStatus("File received successfully!")
          setCompletedFileName(mockFileName)

          setTimeout(() => {
            setDownloadingFile(mockFileName)
            setShowDownloadAnimation(true)
          }, 1500)
        }
        setTransferProgress(progress)
      }, 600) // Slower interval: 600ms
    }, 6000) // Longer wait: 6 seconds
  }

  const handleDownloadComplete = () => {
    setShowDownloadAnimation(false)

    const cheatSheetContent = `MERN + Next.js + Tailwind CSS Interview Cheat Sheet

1. Next.js
Q: What is Next.js?
A: Next.js is like a super-powered React. It helps make websites faster by loading pages before you click them and lets you decide if you want the page made at build time (SSG) or each time someone visits (SSR).

Q: Difference between SSR (Server-Side Rendering) and SSG (Static Site Generation)?
A:
• SSR: Make the page fresh every time someone visits (like cooking food when ordered).
• SSG: Make the page once and give it to everyone (like ready-to-eat food).

Q: What are API routes in Next.js?
A: A way to make a small backend inside Next.js itself. Instead of making a separate Node server, you can create a file in /pages/api and boom — that's your API.

Q: Difference between Next.js and React?
A: React only runs in the browser. Next.js runs both in the browser and on the server, making it faster and better for SEO.

2. React.js
Q: What is the Virtual DOM?
A: It's like a draft paper of your web page. React changes the draft first, and only updates the real page where needed. That makes it faster.

Q: What are props?
A: Props are like gift boxes. You send them from one component to another so the child can use them.

Q: What are hooks?
A: Hooks are special tools in React that give superpowers to your function components.
• useState → Remember values
• useEffect → Do something after the page changes
• useContext → Share data with many components without passing props

Q: Controlled vs Uncontrolled components?
A:
• Controlled: React is the boss and decides the value of inputs.
• Uncontrolled: The browser decides the value of inputs.

3. Tailwind CSS
Q: What is Tailwind CSS?
A: Tailwind is like Lego blocks for design. Instead of writing CSS files, you just put ready-made classes in your HTML and your design appears.

Q: How to make something responsive in Tailwind?
A: Use size labels like sm:, md:, lg: before classes.
Example: sm:text-sm md:text-lg lg:text-xl

Q: Can I customize Tailwind?
A: Yes. You change the tailwind.config.js file and set your own colors, fonts, or sizes.

4. Node.js & Express.js
Q: What is Node.js?
A: Node.js lets you run JavaScript outside the browser — like on a server.

Q: What is Express.js?
A: Express is a helper for Node.js that makes building APIs and websites easier.

Q: What is middleware?
A: Middleware is like a security guard. Before your request reaches the final route, middleware can check, change, or stop it.

Q: How to create a simple GET API in Express?
A:
const express = require('express');
const app = express();

app.get('/hello', (req, res) => {
  res.send('Hello World');
});

app.listen(3000);

5. MongoDB
Q: SQL vs NoSQL?
A:
• SQL: Data in tables (rows & columns).
• NoSQL: Data in JSON-like documents.

Q: How to save data in MongoDB using Mongoose?
A:
const User = new mongoose.model("User", { name: String });
const newUser = new User({ name: "Vishwa" });
await newUser.save();

Q: What is indexing in MongoDB?
A: It's like a book index — makes finding data faster.

6. Git & General
Q: How to create a new branch in Git?
A:
git checkout -b new-branch
It's like making a copy of your code to work on separately.

Q: How to merge in Git?
A:
git checkout main
git merge new-branch
It's like taking changes from your copy and putting them back into the main book.

Advanced but Easy to Remember
1. Debouncing — Wait before doing something until the user stops typing/clicking.
2. Throttling — Allow something to happen only once in a set time.
3. JWT — A special token that proves you are logged in.

Technical Questions — Core Skills
They'll test your knowledge in the stack mentioned in the JD.

Next.js
• Difference between Next.js and React.js
• What are pages and routing in Next.js?
• How does server-side rendering (SSR) differ from static site generation (SSG)?
• How to use API routes in Next.js?

React.js
• Difference between functional and class components
• How React hooks work (useState, useEffect, useContext)
• How to pass props and handle state changes between components
• What is virtual DOM and how React uses it?

Tailwind CSS
• How Tailwind differs from normal CSS
• Example of applying responsive classes (e.g., sm:, md:, lg:)
• How to customize Tailwind config

Node.js & Express.js
• How to create a basic Express server
• Difference between middleware and route handlers
• How to handle errors in Express
• REST API structure (GET, POST, PUT, DELETE)

MongoDB
• Difference between SQL and NoSQL databases
• How to define a schema in Mongoose
• How to query documents in MongoDB (find, findOne, update, delete)
• Indexing and when to use it

Practical / Scenario-Based
They might give small problem-solving tasks:
• Create a REST API endpoint to fetch data from MongoDB
• Build a simple form in React and send data to backend API
• Optimize a slow-loading page in Next.js
• Debug a piece of code that has state management issues

Behavioral / Team Fit
They want to see if you fit their work culture:
• Tell me about a project you worked on with the MERN stack
• How do you handle deadlines?
• How do you collaborate with a designer or backend developer?
• How do you debug when you face an error?

Possible Small Coding Test
You could be asked to:
• Implement a to-do list app in React
• Build an Express.js route for CRUD operations
• Style a component using Tailwind CSS
• Query a MongoDB database and return results

How to Prepare Before Monday
• Revise Next.js basics (pages, routing, SSR vs SSG, API routes)
• Practice React hooks and state management
• Build 1-2 small Node.js + MongoDB APIs
• Revise Tailwind classes and how to make responsive UIs quickly
• Brush up Git basics (commit, branch, merge, push)
• Prepare to explain your past projects clearly`

    const url = URL.createObjectURL(new Blob([cheatSheetContent], { type: "text/plain" }))
    const a = document.createElement("a")
    a.href = url
    a.download = downloadingFile || "MERN-NextJS-Interview-CheatSheet.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setDownloadingFile("")

    setTimeout(() => {
      setMode("congratulations")
    }, 1000)
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

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CameraIcon />
                Scan QR Code or Enter Session ID
              </CardTitle>
              <CardDescription>Connect to a sender to receive files</CardDescription>
            </CardHeader>
            <CardContent>
              {showScanner ? (
                <div>
                  <QRScanner
                    onScan={(sessionId) => {
                      setSessionId(sessionId)
                      handleReceiveFile(sessionId)
                    }}
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

  // Congratulations Screen
  if (mode === "congratulations") {
    return (
      <CongratulationsScreen
        mode={completedFileName.includes("CheatSheet") ? "receive" : "send"}
        fileName={completedFileName}
        onBack={handleBack}
      />
    )
  }

  return null
}
