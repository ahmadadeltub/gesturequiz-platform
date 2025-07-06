# GestureQuiz - Interactive Learning Platform

A professional SaaS quiz application where students can answer questions using hand gestures, with comprehensive teacher and student dashboards, complete registration and authentication system.

## 🚀 Features

### ✅ Authentication System
- **User Registration**: Complete signup with validation and role selection
- **Secure Login**: Support for both registered users and test accounts
- **Role-Based Access**: Separate teacher and student dashboards
- **Session Management**: Persistent login across browser sessions
- **Protected Pages**: Authentication required for all dashboard access

### For Students
- **Gesture-Based Answering**: Answer quiz questions using hand gestures (👍, ✌️, 👌, ✋)
- **Quiz Selection**: Browse and take available quizzes
- **Progress Tracking**: View scores, completed quizzes, and performance history
- **Interactive Interface**: Beautiful, modern UI with smooth animations
- **Real-time Results**: Instant feedback and scoring

### For Teachers
- **Quiz Creation**: Easy-to-use quiz builder with gesture-based answers
- **Quiz Management**: View, edit, and delete created quizzes
- **Student Monitoring**: Track student progress and quiz attempts
- **Analytics Dashboard**: View quiz statistics and performance metrics
- **Content Control**: Manage quiz content and difficulty levels

### Hand Gestures Supported
- 👍 **Thumbs Up** - Option A
- ✌️ **Peace Sign** - Option B  
- 👌 **OK Sign** - Option C
- ✋ **Open Palm** - Option D

## 🎯 Quick Start

### Instant Testing
1. **Open**: Navigate to `index.html` in your browser
2. **Login**: Use test accounts or register new account
   - **Teacher**: `teacher@test.com` / `password123`
   - **Student**: `student@test.com` / `password123`
3. **Register**: Click "Register" to create your own account
4. **Demo Quiz**: A sample quiz is automatically available for testing

### For Students
1. **Login**: Use student credentials or register as student
2. **Dashboard**: View available quizzes and your progress
3. **Take Quiz**: Select a quiz and answer using gesture choices
4. **Results**: View scores and track your learning progress

### For Teachers
1. **Login**: Use teacher credentials or register as teacher
2. **Create Quiz**: Click "Create New Quiz" and fill in details
3. **Add Questions**: Use the question builder to add multiple-choice questions
4. **Manage**: View and edit existing quizzes
5. **Monitor**: Track student progress and results

## 🛠️ Technical Requirements

### Browser Support
- Chrome 88+ (Recommended)
- Firefox 84+
- Safari 14+
- Edge 88+

### System Requirements
- Modern web browser with JavaScript enabled
- Camera access for gesture recognition
- Internet connection for MediaPipe libraries
- Local web server for development

## 📁 Project Structure

```
quiz-app/
├── index.html          # Main application entry point
├── css/
│   ├── main.css       # Core application styles
│   ├── auth.css       # Authentication styles
│   └── quiz.css       # Quiz interface styles
├── js/
│   ├── auth.js        # Authentication system
│   ├── main.js        # Main application logic
│   ├── quiz.js        # Quiz functionality
│   └── utils.js       # Utility functions and gesture detector
└── README.md          # This file
```

## 🔧 Installation & Setup

### Local Development
1. **Clone/Download**: Get the project files
2. **Start Server**: Use any local web server
   ```bash
   # Using Python
   python3 -m http.server 8000
   
   # Using Node.js
   npx http-server -p 8000
   
   # Using PHP
   php -S localhost:8000
   ```
3. **Open Browser**: Navigate to `http://localhost:8000/quiz-app/`
4. **Allow Camera**: Grant camera permissions when prompted

### Production Deployment
1. **Upload Files**: Deploy to any web hosting service
2. **HTTPS Required**: Ensure HTTPS for camera access
3. **Configure**: Update any API endpoints if needed

## 🎨 Customization

### Adding New Gestures
1. **Update Gesture Detector**: Add new gesture detection methods in `utils.js`
2. **Update UI**: Add gesture options in quiz interface
3. **Update Mapping**: Map gestures to quiz actions in `quiz.js`

### Styling
- **Colors**: Modify CSS variables in `main.css`
- **Layout**: Adjust grid layouts and responsive breakpoints
- **Animations**: Customize transitions and effects

### Quiz Types
- **Multiple Choice**: Currently supported
- **True/False**: Easy to implement
- **Fill in the Blank**: Gesture-based selection
- **Image-based**: Visual questions with gesture answers

## 📊 Data Management

### Local Storage
- User authentication data
- Quiz progress and scores
- Created quizzes and questions
- User preferences and settings

### Future Enhancements
- **Database Integration**: MySQL/PostgreSQL for production
- **Cloud Storage**: Save quizzes and results to cloud
- **Real-time Sync**: Multi-device synchronization
- **Backup/Export**: Data export functionality

## 🔐 Security Features

- **Client-side Authentication**: Demo implementation
- **Data Validation**: Input sanitization and validation
- **Camera Privacy**: Local processing only
- **Secure Storage**: Encrypted local storage options

## 🚀 Performance Optimization

- **Lazy Loading**: Load components as needed
- **Gesture Smoothing**: Reduce detection flickering
- **Memory Management**: Efficient camera handling
- **Offline Support**: Cache critical resources

## 🐛 Troubleshooting

### Camera Issues
- **Permission Denied**: Check browser settings
- **Camera Not Found**: Ensure camera is connected
- **Poor Detection**: Improve lighting conditions
- **HTTPS Required**: Use secure connection

### Performance Issues
- **Slow Loading**: Check internet connection
- **High CPU Usage**: Reduce video resolution
- **Memory Leaks**: Refresh page periodically
- **Gesture Lag**: Optimize lighting and hand visibility

## 🤝 Contributing

1. **Fork Repository**: Create your own copy
2. **Create Branch**: `git checkout -b feature-name`
3. **Make Changes**: Implement your improvements
4. **Test Thoroughly**: Ensure all features work
5. **Submit PR**: Create pull request with description

## 📈 Future Roadmap

### Phase 1 (Current)
- ✅ Basic gesture recognition
- ✅ Quiz creation and taking
- ✅ Student/Teacher dashboards
- ✅ Responsive design

### Phase 2 (Next)
- 🔄 Real-time multiplayer quizzes
- 🔄 Advanced analytics and reporting
- 🔄 Mobile app versions
- 🔄 Voice commands integration

### Phase 3 (Future)
- 🔄 AI-powered question generation
- 🔄 Adaptive learning algorithms
- 🔄 Virtual reality integration
- 🔄 Advanced gesture recognition

## 📞 Support

For technical support or questions:
- **Documentation**: Check this README
- **Issues**: Create GitHub issues
- **Community**: Join our Discord server
- **Email**: support@gesturequiz.com

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **MediaPipe**: Google's MediaPipe for hand tracking
- **Font Awesome**: Icons and visual elements
- **Community**: Open source contributors and testers

---

**Made with ❤️ for interactive education**
