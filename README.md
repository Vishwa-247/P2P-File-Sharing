# P2P File Sharing Web App

A secure, peer-to-peer file sharing application that allows users to share files directly between devices using WebRTC technology and QR code connections.

## 🚀 Features

### Core Functionality
- **Peer-to-Peer File Transfer**: Direct file sharing between devices without server storage
- **QR Code Connection**: Easy device pairing using QR codes
- **Real-time Progress Tracking**: Live transfer speed, progress, and ETA display
- **Cross-Platform**: Works on desktop and mobile browsers
- **No File Size Limits**: Transfer files up to 100MB efficiently
- **Secure Transfer**: End-to-end encrypted file transfer via WebRTC

### User Experience
- **Drag & Drop Interface**: Easy file selection with drag-and-drop support
- **Camera Scanner**: Built-in QR code scanner with camera access
- **Manual Connection**: Fallback option to enter session IDs manually
- **Transfer Cancellation**: Ability to cancel transfers in progress
- **Connection Status**: Real-time connection state indicators
- **Error Handling**: Comprehensive error messages and recovery options

### Technical Features
- **WebRTC Data Channels**: Direct peer-to-peer communication
- **Automatic Cleanup**: Session management with automatic timeout handling
- **Connection Recovery**: Robust error handling and reconnection logic
- **Mobile Optimized**: Responsive design for all device types
- **Browser Compatibility**: Works across modern browsers

## 🛠 How It Works

### For Senders (Sharing Files)
1. **Select "Send File"** on the homepage
2. **Choose your file** by clicking "Select File" or dragging and dropping
3. **Generate QR Code** - the app creates a unique session and displays a QR code
4. **Share the QR Code** with the receiver (show on screen or share the session ID)
5. **Wait for Connection** - the app will show "Waiting for receiver..."
6. **Transfer Begins** automatically once the receiver connects
7. **Monitor Progress** with real-time speed and completion estimates

### For Receivers (Receiving Files)
1. **Select "Receive File"** on the homepage
2. **Scan QR Code** using the built-in camera scanner, or
3. **Enter Session ID** manually if scanning isn't available
4. **Connection Established** automatically with the sender
5. **File Transfer** begins immediately upon connection
6. **Download Completes** - file is automatically saved to your device

### Technical Process
1. **Session Creation**: Sender creates a WebRTC offer and generates a unique session ID
2. **QR Code Generation**: Session URL is encoded into a QR code for easy sharing
3. **Signaling**: Session data is temporarily stored on the server for connection establishment
4. **WebRTC Connection**: Direct peer-to-peer connection is established between devices
5. **File Transfer**: Files are transferred in chunks through WebRTC data channels
6. **Cleanup**: Sessions are automatically cleaned up after completion or timeout

## 🔧 Technical Architecture

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **WebRTC APIs** for peer-to-peer communication
- **Camera API** for QR code scanning

### Backend
- **Next.js API Routes** for signaling server
- **In-memory session storage** with automatic cleanup
- **RESTful endpoints** for offer/answer exchange

### Key Components
- **WebRTC Service**: Handles peer connections and file transfer
- **QR Service**: Manages QR code generation and scanning
- **Session Management**: Tracks connection states and cleanup
- **Progress Tracking**: Real-time transfer statistics

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- Modern web browser with WebRTC support
- Camera access (for QR code scanning)

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`
4. Open `http://localhost:3000` in your browser

### Usage
1. Open the app on both devices
2. On sender device: Click "Send File" and select a file
3. On receiver device: Click "Receive File" and scan the QR code
4. Files transfer automatically once connected

## 🔒 Security & Privacy

- **No Server Storage**: Files are never stored on servers
- **Direct Transfer**: Peer-to-peer connection ensures privacy
- **Session Expiration**: Temporary sessions expire automatically
- **Encrypted Transfer**: WebRTC provides built-in encryption
- **Local Processing**: All file handling happens locally

## 🌐 Browser Compatibility

- **Chrome/Chromium**: Full support
- **Firefox**: Full support  
- **Safari**: Full support (iOS 11+)
- **Edge**: Full support
- **Mobile Browsers**: Optimized for mobile use

## 📱 Mobile Features

- **Responsive Design**: Optimized for mobile screens
- **Touch Interface**: Touch-friendly controls
- **Camera Integration**: Native camera access for QR scanning
- **Background Handling**: Proper cleanup on app switching

## 🔧 Configuration

### Environment Variables
No environment variables required for basic functionality.

### Customization
- Modify `CHUNK_SIZE` in WebRTC service for different transfer speeds
- Adjust `CONNECTION_TIMEOUT` for different network conditions
- Customize UI themes in Tailwind configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

---

**Note**: This application requires camera permissions for QR code scanning. Users can always fall back to manual session ID entry if camera access is not available.
