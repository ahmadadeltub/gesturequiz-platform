# 🔥 Firebase Setup Guide for GestureQuiz

## Overview
This guide will help you set up Firebase for online data storage, replacing localStorage with cloud-based storage that works across all devices.

## 🚀 Step 1: Create Firebase Project

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Create New Project**:
   - Project name: `gesturequiz-platform`
   - Enable Google Analytics (optional)
   - Choose your region

## 🔧 Step 2: Configure Firebase Services

### Enable Authentication
1. Go to **Authentication** > **Get Started**
2. **Sign-in method** tab
3. Enable **Email/Password** authentication
4. **Optional**: Enable Google, GitHub, or other providers

### Enable Firestore Database
1. Go to **Firestore Database** > **Create Database**
2. **Start in test mode** (for development)
3. Choose your region (closest to your users)
4. **Security Rules** (for production):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Teachers can manage their own classes
    match /classes/{classId} {
      allow read, write: if request.auth != null && 
        resource.data.createdBy == request.auth.uid;
    }
    
    // Teachers can manage their own quizzes
    match /quizzes/{quizId} {
      allow read, write: if request.auth != null && 
        resource.data.createdBy == request.auth.uid;
    }
    
    // Students can read quizzes shared with them
    match /quizzes/{quizId} {
      allow read: if request.auth != null;
    }
    
    // Quiz results
    match /results/{resultId} {
      allow read, write: if request.auth != null && 
        (resource.data.studentId == request.auth.uid || 
         resource.data.teacherId == request.auth.uid);
    }
  }
}
```

### Enable Storage (Optional)
1. Go to **Storage** > **Get Started**
2. Use default security rules
3. This will be used for profile pictures, quiz images, etc.

## 🔑 Step 3: Get Configuration Keys

1. Go to **Project Settings** (gear icon)
2. **General** tab
3. **Your apps** section
4. Click **Web** app icon `</>`
5. **Register app**:
   - App nickname: `gesturequiz-web`
   - Check "Firebase Hosting" (optional)
6. **Copy the config object**:

```javascript
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAMGOSAICQQbbduHDBvLzhcdImJkTrlTmc",
  authDomain: "gesturequiz-platform-429dd.firebaseapp.com",
  projectId: "gesturequiz-platform-429dd",
  storageBucket: "gesturequiz-platform-429dd.firebasestorage.app",
  messagingSenderId: "911639818705",
  appId: "1:911639818705:web:22d5bf2845c469185e70f0",
  measurementId: "G-Z8W4H5WDG7"
};
```

**✅ Configuration Ready!** Your Firebase project is set up with the above configuration.

## 🔧 Step 4: Update Configuration

1. **Edit**: `/quiz-app/js/online-data-manager.js`
2. **Replace** the config object with your values:

```javascript
this.config = {
    apiKey: "your-actual-api-key-here",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};
```

## 🔧 Step 5: Update HTML Files

Add Firebase integration to your HTML files by replacing localStorage imports:

### Teacher Dashboard
```html
<!-- Add before closing </body> tag -->
<script src="../js/online-data-manager.js"></script>
<script>
    // Initialize online data manager
    const dataManager = new OnlineDataManager();
    
    // Replace localStorage calls with online storage
    document.addEventListener('DOMContentLoaded', async function() {
        await dataManager.initialize();
        loadUserData();
        loadDashboardStats();
    });
</script>
```

### Student Dashboard
```html
<!-- Add before closing </body> tag -->
<script src="../js/online-data-manager.js"></script>
<script>
    const dataManager = new OnlineDataManager();
    
    document.addEventListener('DOMContentLoaded', async function() {
        await dataManager.initialize();
        loadStudentData();
    });
</script>
```

## 🔄 Step 6: Update Authentication

Replace localStorage authentication with Firebase Auth:

### Login Function
```javascript
async function login(email, password) {
    const result = await dataManager.signIn(email, password);
    
    if (result.success) {
        // Get user profile from Firestore
        const profile = await dataManager.getUserProfile(result.user.uid);
        
        if (profile.success) {
            // Redirect to dashboard
            window.location.href = profile.data.role === 'teacher' ? 
                'pages/teacher-dashboard.html' : 
                'pages/student-dashboard.html';
        }
    } else {
        alert('Login failed: ' + result.error);
    }
}
```

### Registration Function
```javascript
async function register(email, password, userData) {
    const result = await dataManager.signUp(email, password, userData);
    
    if (result.success) {
        alert('Account created successfully!');
        // Redirect to login
        window.location.href = 'login.html';
    } else {
        alert('Registration failed: ' + result.error);
    }
}
```

## 💾 Step 7: Replace localStorage Calls

### Profile Management
```javascript
// OLD: localStorage
const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
localStorage.setItem('currentUser', JSON.stringify(updatedUser));

// NEW: Firebase
const user = dataManager.getCurrentUser();
await dataManager.updateProfile(user.uid, updatedData);
```

### Quiz Management
```javascript
// OLD: localStorage
const quizzes = JSON.parse(localStorage.getItem('gestureQuizzes') || '[]');
localStorage.setItem('gestureQuizzes', JSON.stringify(quizzes));

// NEW: Firebase
const quizzesResult = await dataManager.getQuizzes(user.uid);
const quizzes = quizzesResult.success ? quizzesResult.data : [];
await dataManager.createQuiz(newQuizData);
```

### Class Management
```javascript
// OLD: localStorage
const classes = JSON.parse(localStorage.getItem('teacherClasses') || '[]');
localStorage.setItem('teacherClasses', JSON.stringify(classes));

// NEW: Firebase
const classesResult = await dataManager.getClasses(user.uid);
const classes = classesResult.success ? classesResult.data : [];
await dataManager.createClass(newClassData);
```

## 🌐 Step 8: Enable Offline Support

The OnlineDataManager automatically falls back to localStorage when offline:

```javascript
// Check if online
if (dataManager.isOnline()) {
    // Use Firebase
    await dataManager.createQuiz(quizData);
} else {
    // Use localStorage as fallback
    // Data will sync when back online
}
```

## 📊 Step 9: Test the Setup

1. **Create test accounts**:
   - Teacher: teacher@test.com / password123
   - Student: student@test.com / password123

2. **Test features**:
   - User registration/login
   - Create quizzes
   - Manage classes
   - Add students
   - View analytics

3. **Check Firebase Console**:
   - Verify users in Authentication
   - Check data in Firestore
   - Monitor usage

## 🔒 Step 10: Security Best Practices

### Environment Variables
For production, use environment variables:

```javascript
// Don't commit API keys to GitHub
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    // ... other config
};
```

### Firestore Security Rules
```javascript
// More restrictive rules for production
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Teachers can only access their own data
    match /quizzes/{quizId} {
      allow read, write: if request.auth != null && 
        resource.data.createdBy == request.auth.uid;
    }
  }
}
```

## 📈 Step 11: Monitor Usage

### Firebase Console
- **Authentication**: Monitor user registrations
- **Firestore**: Check database usage
- **Storage**: Monitor file uploads
- **Analytics**: Track app usage

### Performance
- **Firestore**: Optimize queries with indexes
- **Storage**: Compress images before upload
- **Caching**: Use Firebase's built-in caching

## 🎯 Benefits of Firebase Integration

✅ **Cross-Device Sync**: Data accessible from any device
✅ **Real-time Updates**: Changes sync instantly
✅ **Offline Support**: Works without internet
✅ **Scalability**: Handles thousands of users
✅ **Security**: Built-in user authentication
✅ **Analytics**: Track user engagement
✅ **Free Tier**: Generous free usage limits

## 📋 Migration Checklist

- [ ] Create Firebase project
- [ ] Enable Authentication & Firestore
- [ ] Update config keys
- [ ] Replace localStorage in auth.js
- [ ] Update teacher dashboard
- [ ] Update student dashboard
- [ ] Update quiz management
- [ ] Update class management
- [ ] Test all features
- [ ] Deploy to production

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**: Add your domain to Firebase authorized domains
2. **Permission Denied**: Check Firestore security rules
3. **Offline Mode**: Ensure localStorage fallback works
4. **API Key Issues**: Verify config values are correct

### Debug Mode
```javascript
// Enable debug logging
localStorage.setItem('debug', 'firebase*');
```

---

**🚀 Ready to go online?** Follow this guide step by step and your GestureQuiz platform will have full cloud storage capabilities!
