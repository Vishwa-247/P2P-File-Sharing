# P2P File Sharing Web App

A secure, peer-to-peer file sharing application that allows users to share files directly between devices using WebRTC technology and QR code connections, with experimental Bluetooth support.

## 🚀 Features

### Core Functionality
- **WebRTC File Transfer**: Direct file sharing between devices without server storage (RECOMMENDED)
- **Bluetooth File Transfer**: Experimental local device-to-device sharing (LIMITED COMPATIBILITY)
- **QR Code Connection**: Easy device pairing using QR codes
- **Real-time Progress Tracking**: Live transfer speed, progress, and ETA display
- **Cross-Platform**: Works on desktop and mobile browsers
- **No File Size Limits**: Transfer files up to 100MB efficiently via WebRTC
- **Secure Transfer**: End-to-end encrypted file transfer

### User Experience
- **Dual Transfer Methods**: Choose between WebRTC (internet) or Bluetooth (local)
- **Drag & Drop Interface**: Easy file selection with drag-and-drop support
- **Camera Scanner**: Built-in QR code scanner with camera access
- **Manual Connection**: Fallback option to enter session IDs manually
- **Transfer Cancellation**: Ability to cancel transfers in progress
- **Connection Status**: Real-time connection state indicators
- **Error Handling**: Comprehensive error messages and recovery options

### Technical Features
- **WebRTC Data Channels**: Direct peer-to-peer communication over internet
- **Bluetooth Web API**: Local device-to-device communication (experimental)
- **Automatic Cleanup**: Session management with automatic timeout handling
- **Connection Recovery**: Robust error handling and reconnection logic
- **Mobile Optimized**: Responsive design for all device types
- **Browser Compatibility**: Works across modern browsers

## ⚠️ Important Limitations

### WebRTC (RECOMMENDED)
✅ **WORKS RELIABLY**: Internet-based P2P file sharing
✅ **Cross-platform**: Works between any devices with internet
✅ **No special setup**: Just open the app on both devices
✅ **Large files**: Handles files up to 100MB efficiently

### Bluetooth (EXPERIMENTAL)
⚠️ **LIMITED COMPATIBILITY**: Requires both devices to run this exact app
⚠️ **Custom service**: Uses custom Bluetooth service UUIDs
⚠️ **Same network**: Both devices need to be in close proximity
⚠️ **Browser support**: Limited browser support for Bluetooth Web API
⚠️ **May not work**: Real-world compatibility issues expected

**RECOMMENDATION**: Use WebRTC for reliable file sharing. Bluetooth is included for experimental purposes but may not work between different devices or browsers.

## 🛠 How It Works

### WebRTC Method (RECOMMENDED)
#### For Senders
1. **Select "WebRTC"** transfer method on homepage
2. **Click "Send File"** and choose your file
3. **Share QR Code** - show the generated QR code to receiver
4. **Wait for Connection** - receiver scans and connects automatically
5. **Transfer Completes** - file transfers directly over internet

#### For Receivers
1. **Select "WebRTC"** transfer method on homepage
2. **Click "Receive File"** and scan the QR code
3. **Connection Established** - automatic P2P connection
4. **File Downloads** - file saves automatically to your device

### Bluetooth Method (EXPERIMENTAL)
#### For Senders
1. **Select "Bluetooth"** transfer method on homepage
2. **Click "Send File"** and choose your file
3. **Select Bluetooth Device** - choose receiver from device list
4. **Transfer via Bluetooth** - direct local connection

#### For Receivers
1. **Select "Bluetooth"** transfer method on homepage
2. **Click "Receive File"** and make device discoverable
3. **Accept Connection** - accept incoming Bluetooth connection
4. **File Transfers** - receive file via Bluetooth

## 🔧 Technical Architecture

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **WebRTC APIs** for internet P2P communication
- **Bluetooth Web API** for local device communication
- **Camera API** for QR code scanning

### Backend
- **Next.js API Routes** for WebRTC signaling server
- **In-memory session storage** with automatic cleanup
- **RESTful endpoints** for offer/answer exchange

### Key Components
- **WebRTC Service**: Handles internet peer connections and file transfer
- **Bluetooth Service**: Manages local Bluetooth device connections
- **QR Service**: Manages QR code generation and scanning
- **Session Management**: Tracks connection states and cleanup
- **Progress Tracking**: Real-time transfer statistics

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- Modern web browser with WebRTC support
- Camera access (for QR code scanning)
- Bluetooth support (optional, for Bluetooth transfers)

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

**IMPORTANT**: For production use, the app must be served over HTTPS as both WebRTC and Bluetooth Web APIs require secure contexts.

### Usage Instructions
1. **Open the app on both devices**
2. **Choose transfer method**: WebRTC (recommended) or Bluetooth (experimental)
3. **For WebRTC**: Use QR codes to connect devices over internet
4. **For Bluetooth**: Pair devices locally (may not work reliably)
5. **Transfer files** automatically once connected

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

### Bluetooth Support (Experimental)
- **Chrome/Chromium**: ⚠️ Limited support
- **Firefox**: ❌ No support
- **Safari**: ❌ No support
- **Edge**: ⚠️ Limited support
- **Mobile**: ❌ Very limited support

## 🎯 Recommended Usage

### ✅ What Works Well
- **WebRTC file sharing** between any devices with internet
- **QR code connections** for easy pairing
- **Files up to 100MB** transfer reliably
- **Cross-platform** sharing (Windows ↔ Mac ↔ Mobile)
- **Real-time progress** tracking and cancellation

### ⚠️ What May Not Work
- **Bluetooth transfers** between different device types
- **Very large files** (>100MB) may timeout
- **Unstable internet** connections may fail
- **Corporate networks** with strict firewall rules

### 💡 Best Practices
1. **Use WebRTC** for reliable file sharing
2. **Ensure stable internet** for both devices
3. **Use HTTPS** in production (required for APIs)
4. **Test Bluetooth** functionality before relying on it
5. **Have fallback** methods for file sharing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Test both WebRTC and Bluetooth functionality
4. Submit a pull request with clear documentation

## 📄 License

This project is open source and available under the MIT License.

---

**⚡ Quick Start**: For the most reliable experience, use the WebRTC method with QR code connections. Bluetooth functionality is experimental and may not work consistently across different devices and browsers.
