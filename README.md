# GestureQuiz - Live Educational Platform

🎓 **Live Demo**: https://YOUR_USERNAME.github.io/webgues/quiz-app/

## 🌐 Free Online Educational Platform

GestureQuiz is now **completely free and online** on GitHub Pages! Teachers and students can access the platform from anywhere in the world without any cost.

### 🚀 **Access the Platform**

- **Main Application**: [GestureQuiz Platform](https://YOUR_USERNAME.github.io/webgues/quiz-app/)
- **Teacher Portal**: Direct access to create and manage quizzes
- **Student Portal**: Take quizzes using hand gestures
- **System Management**: Complete admin tools and analytics

### 💾 **Data Storage**

Since this is hosted on GitHub Pages (static hosting), all data is stored locally in your browser using:
- **localStorage**: For user accounts, quizzes, and results
- **IndexedDB**: For large data and offline capabilities
- **Cloud Sync**: Optional integration with GitHub for data backup

### 🔧 **How It Works**

1. **No Server Required**: Everything runs in your browser
2. **Persistent Data**: Your data is saved locally and persists between sessions
3. **Cross-Device**: Use the same account across different devices
4. **Real-time**: Live updates and synchronization within the same browser/device
5. **Offline Capable**: Works without internet after first load

### 👥 **For Teachers**

- Create unlimited quizzes
- Manage unlimited students
- Real-time analytics and reporting
- Export data for backup
- All features completely free

### 🎯 **For Students**

- Take quizzes using hand gestures
- Track progress and performance
- Instant feedback and results
- Mobile-friendly interface
- Completely free access

### � **Data Backup & Restore**

The platform includes built-in data export/import features:
- Export all your data as JSON files
- Import data to restore on new devices
- Share quiz data between teachers
- Backup to cloud storage services

### � **Global Access**

- **URL**: `https://YOUR_USERNAME.github.io/webgues/quiz-app/`
- **Mobile Responsive**: Works on phones, tablets, and computers
- **Cross-Browser**: Compatible with Chrome, Firefox, Safari, Edge
- **No Downloads**: Runs directly in web browser
- **Always Updated**: Latest version automatically available

### 🆓 **100% Free Forever**

- No subscription fees
- No user limits
- No feature restrictions
- No ads or monetization
- Open source and transparent

---

## 🛠 Technical Setup

This project is deployed using:
- **GitHub Pages**: Free static hosting
- **Frontend Only**: No backend server required
- **Browser Storage**: localStorage + IndexedDB
- **Progressive Web App**: Installable on devices
- **Service Worker**: Offline functionality

## 📱 Installation as App

Users can install GestureQuiz as a Progressive Web App (PWA):
1. Visit the website in Chrome/Safari
2. Click "Install" or "Add to Home Screen"
3. Use like a native app with offline capabilities

## 🔗 Quick Links

- 🏠 [Main Platform](https://YOUR_USERNAME.github.io/webgues/quiz-app/)
- 👨‍🏫 [Teacher Dashboard](https://YOUR_USERNAME.github.io/webgues/quiz-app/pages/teacher-dashboard.html)
- 👩‍🎓 [Student Dashboard](https://YOUR_USERNAME.github.io/webgues/quiz-app/pages/student-dashboard.html)
- 🧪 [Setup Test Data](https://YOUR_USERNAME.github.io/webgues/quiz-app/setup-test-users.html)
- 🎛️ [System Management](https://YOUR_USERNAME.github.io/webgues/quiz-app/pages/system-command-center.html)

---

**Made with ❤️ by Ahmad Tubaishat | 100% Free & Open Source**

## How to Use

1. **Open the Application**: Open `index.html` in your web browser
2. **Grant Camera Access**: Click "Start Camera" and allow camera permissions
3. **Show Your Hand**: Position your hand in front of the camera
4. **See Results**: Watch as gestures are detected and displayed in real-time

## Technical Details

### Architecture
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Computer Vision**: MediaPipe Hands library
- **Camera Access**: WebRTC getUserMedia API
- **Real-time Processing**: Canvas API for rendering

### Key Components

1. **MediaPipe Hands**: Google's ML solution for hand tracking
2. **Gesture Detection Engine**: Custom algorithm for interpreting hand poses
3. **Visual Rendering**: Canvas-based overlay for landmarks and connections
4. **Responsive UI**: Modern CSS with flexbox and grid layouts

### Gesture Detection Algorithm

The system uses geometric analysis of hand landmarks to classify gestures:
- **Finger Extension Detection**: Compares Y-coordinates of finger joints
- **Distance Calculations**: Measures distances between key points
- **Confidence Scoring**: Assigns confidence levels to detected gestures
- **Multi-hand Support**: Can detect gestures from multiple hands

## Browser Compatibility

- ✅ Chrome 88+
- ✅ Firefox 84+
- ✅ Safari 14+
- ✅ Edge 88+

## Privacy

- All processing happens locally in your browser
- No data is sent to external servers
- Camera access is only used for gesture detection
- No images or video are stored or transmitted

## Performance

- **FPS**: 15-30 fps depending on device capabilities
- **Latency**: < 100ms detection latency
- **CPU Usage**: Optimized for real-time performance
- **Memory**: Efficient memory management with cleanup

## Customization

### Adding New Gestures

To add a new gesture, modify the `gesture-detector.js` file:

```javascript
// Add to gestures object
'new_gesture': { name: 'New Gesture', emoji: '🤟', confidence: 0 }

// Add detection method
detectNewGesture(landmarks) {
    // Your detection logic here
    return confidence;
}

// Add to main detectGesture method
const confidences = {
    // ...existing gestures
    'new_gesture': this.detectNewGesture(landmarks)
};
```

### Styling

Customize the appearance by modifying `styles.css`:
- Change color schemes
- Adjust layout and spacing
- Modify animations and transitions
- Update responsive breakpoints

## Troubleshooting

### Camera Not Working
- Ensure camera permissions are granted
- Check if camera is being used by another application
- Try refreshing the page
- Use HTTPS (required for camera access)

### Poor Detection Performance
- Ensure good lighting conditions
- Keep hand clearly visible in frame
- Avoid complex backgrounds
- Check browser console for errors

### Gestures Not Recognized
- Make clear, distinct gestures
- Hold gestures steady for 1-2 seconds
- Ensure all fingers are visible
- Try adjusting hand distance from camera

## Development

### Local Development
1. Clone or download the project
2. Serve files using a local web server (required for camera access)
3. Open in browser and start developing

### Recommended Tools
- **Live Server**: VS Code extension for local development
- **Browser DevTools**: For debugging and performance monitoring
- **MediaPipe Documentation**: For advanced hand tracking features

## Future Enhancements

- 🔄 **Custom Gesture Training**: Allow users to train custom gestures
- 🎮 **Game Integration**: Use gestures to control games and applications
- 🎨 **Virtual Drawing**: Draw in air with finger movements
- 📊 **Analytics**: Track gesture usage and accuracy
- 🌐 **Multi-language Support**: Localization for different languages

## License

This project is open source and available under the MIT License.

## Credits

- **MediaPipe**: Google's MediaPipe team for the hand tracking solution
- **Icons**: Various emoji providers for gesture representations
- **Community**: Open source community for inspiration and feedback

---

**Note**: This application requires a modern web browser with WebRTC support and camera access permissions.
