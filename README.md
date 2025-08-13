# P2P File Sharing Web App

A secure, peer-to-peer file sharing application that allows users to share files directly between devices using WebRTC technology and QR code connections.

## 🚀 Features

### Core Functionality
- **WebRTC File Transfer**: Direct file sharing between devices without server storage
- **QR Code Connection**: Easy device pairing using QR codes
- **Real-time Progress Tracking**: Live transfer speed, progress, and ETA display
- **Cross-Platform**: Works on desktop and mobile browsers
- **File Size Support**: Transfer files up to 100MB efficiently
- **Secure Transfer**: End-to-end encrypted file transfer

### User Experience
- **Drag & Drop Interface**: Easy file selection with drag-and-drop support
- **Camera Scanner**: Built-in QR code scanner with camera access
- **Manual Connection**: Fallback option to enter session IDs manually
- **Copy Session ID**: One-click copy button for easy sharing
- **Transfer Cancellation**: Ability to cancel transfers in progress
- **Connection Status**: Real-time connection state indicators
- **Error Handling**: Comprehensive error messages and recovery options

### Technical Features
- **WebRTC Data Channels**: Direct peer-to-peer communication over internet
- **Automatic Cleanup**: Session management with automatic timeout handling
- **Connection Recovery**: Robust error handling and reconnection logic
- **Mobile Optimized**: Responsive design for all device types
- **Browser Compatibility**: Works across modern browsers

## 🛠 How It Works

### For Senders
1. **Click "Send File"** and choose your file
2. **Share QR Code** - show the generated QR code to receiver or copy the session ID
3. **Wait for Connection** - receiver scans and connects automatically
4. **Transfer Completes** - file transfers directly over internet

### For Receivers
1. **Click "Receive File"** and scan the QR code or enter session ID
2. **Connection Established** - automatic P2P connection
3. **File Downloads** - file saves automatically to your device

## 🔧 Technical Architecture

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **WebRTC APIs** for internet P2P communication
- **Camera API** for QR code scanning

### Backend
- **Next.js API Routes** for WebRTC signaling server
- **In-memory session storage** with automatic cleanup
- **RESTful endpoints** for offer/answer exchange

### Key Components
- **WebRTC Service**: Handles internet peer connections and file transfer
- **QR Service**: Manages QR code generation and scanning
- **Session Management**: Tracks connection states and cleanup
- **Progress Tracking**: Real-time transfer statistics

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- Modern web browser with WebRTC support
- Camera access (for QR code scanning)

### Installation & Running
\`\`\`bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Run development server
npm run dev

# Open in browser
# Navigate to http://localhost:3000
\`\`\`

### For Production Deployment
\`\`\`bash
# Build the application
npm run build

# Deploy to Vercel (recommended)
vercel deploy

# Or deploy to any hosting platform that supports Next.js
\`\`\`

**IMPORTANT**: For production use, the app must be served over HTTPS as WebRTC APIs require secure contexts.

### Usage Instructions
1. **Open the app on both devices**
2. **Sender**: Select file and share QR code or copy session ID
3. **Receiver**: Scan QR code or enter session ID manually
4. **Transfer files** automatically once connected

## 🔒 Security & Privacy

- **No Server Storage**: Files are never stored on servers
- **Direct Transfer**: Peer-to-peer connection ensures privacy
- **Session Expiration**: Temporary sessions expire automatically
- **Encrypted Transfer**: WebRTC provides built-in encryption
- **Local Processing**: All file handling happens locally
- **HTTPS Required**: Secure context required for all APIs

## 🌐 Browser Compatibility

### WebRTC Support
- **Chrome/Chromium**: ✅ Full support
- **Firefox**: ✅ Full support  
- **Safari**: ✅ Full support (iOS 11+)
- **Edge**: ✅ Full support
- **Mobile Browsers**: ✅ Optimized for mobile use

## 🎯 What Works Well

- **WebRTC file sharing** between any devices with internet
- **QR code connections** for easy pairing
- **Files up to 100MB** transfer reliably
- **Cross-platform** sharing (Windows ↔ Mac ↔ Mobile)
- **Real-time progress** tracking and cancellation
- **Copy session ID** for easy manual sharing

## 💡 Best Practices

1. **Ensure stable internet** for both devices
2. **Use HTTPS** in production (required for APIs)
3. **Keep devices connected** during transfer
4. **Use QR codes** for easiest connection
5. **Copy session ID** as backup connection method

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy automatically with HTTPS

### Other Platforms
- Netlify
- Railway
- Any platform supporting Next.js

**Note**: HTTPS is required for WebRTC and camera APIs to work properly.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Test WebRTC functionality thoroughly
4. Submit a pull request with clear documentation

## 📄 License

This project is open source and available under the MIT License.

---

**⚡ Quick Start**: Select "Send File" to share or "Receive File" to get files. Use QR codes for easiest connection or copy/paste session IDs as backup.
