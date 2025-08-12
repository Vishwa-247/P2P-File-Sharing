# How to Run the P2P File Sharing App

## Development Mode

1. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Run Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`
   The app will be available at `http://localhost:3000`

## Production Deployment

### Option 1: Deploy to Vercel (Recommended)
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Deploy automatically with zero configuration

### Option 2: Build and Deploy Manually
1. **Build the app**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Start production server**
   \`\`\`bash
   npm start
   \`\`\`

## Important Notes

### For WebRTC File Sharing:
- **HTTPS Required**: WebRTC requires HTTPS in production
- **Local Testing**: Works on localhost for development
- **Firewall**: Ensure ports are open for peer connections

### For Bluetooth File Sharing:
- **Browser Support**: Only works in Chrome/Edge with Bluetooth support
- **HTTPS Required**: Bluetooth Web API requires secure context
- **Device Pairing**: Users need to pair devices through browser dialog
- **Range**: Limited to Bluetooth range (~10 meters)

### Testing the App:
1. **WebRTC**: Open two browser tabs/windows, one as sender, one as receiver
2. **Bluetooth**: Use two different devices with Bluetooth enabled
3. **QR Codes**: Use phone camera or QR scanner app to scan codes

### Troubleshooting:
- Enable camera/Bluetooth permissions in browser
- Use HTTPS for production deployment
- Check browser console for detailed error messages
- Ensure devices are within range for Bluetooth
