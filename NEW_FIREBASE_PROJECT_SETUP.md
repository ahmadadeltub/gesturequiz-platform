# GestureQuiz - New Firebase Project Setup Guide

## 🚀 Complete Firebase Project Creation & Integration

### **Step 1: Create New Firebase Project**

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Click "Add project"**
3. **Project Details**:
   - **Project name**: `GestureQuiz-Platform-Live`
   - **Project ID**: `gesturequiz-platform-live` (or similar)
   - **Location**: Choose your preferred region (e.g., us-central1)

4. **Google Analytics**: 
   - ✅ Enable Google Analytics
   - Create new analytics account or use existing

5. **Click "Create project"**

### **Step 2: Enable Required Services**

#### **2.1 Authentication**
1. Go to **Authentication** → **Get started**
2. **Sign-in method** tab
3. Enable these providers:
   - ✅ **Email/Password** (Enable)
   - ✅ **Google** (Optional - for social login)
4. **Settings** → **Authorized domains**
   - Add: `ahmadadeltub.github.io`
   - Add: `localhost` (for local testing)

#### **2.2 Firestore Database**
1. Go to **Firestore Database** → **Create database**
2. **Security rules**: Start in **production mode**
3. **Location**: Choose same region as project
4. **Click "Done"**

#### **2.3 Storage**
1. Go to **Storage** → **Get started**
2. **Security rules**: Start in **production mode**
3. **Location**: Choose same region
4. **Click "Done"**

#### **2.4 Hosting (Optional)**
1. Go to **Hosting** → **Get started**
2. This can be used as backup hosting option

### **Step 3: Get Firebase Configuration**

1. **Go to Project Settings** (gear icon)
2. **General** tab → **Your apps**
3. **Click "Add app"** → **Web app** (</> icon)
4. **App Details**:
   - **App nickname**: `GestureQuiz-Web`
   - ✅ **Also set up Firebase Hosting** (optional)
5. **Register app**

6. **Copy the Firebase config object**:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

### **Step 4: Configure Security Rules**

#### **4.1 Firestore Rules**
Go to **Firestore Database** → **Rules** tab:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can create and manage their own profile
    match /users/{userId} {
      allow create: if request.auth != null;
      allow read, update: if request.auth != null && request.auth.uid == userId;
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Teachers can create and manage their classes
    match /classes/{classId} {
      allow create: if request.auth != null;
      allow read, update, delete: if request.auth != null && 
        (resource.data.teacherId == request.auth.uid || 
         request.auth.uid in resource.data.students);
    }
    
    // Quizzes can be created by teachers and taken by students
    match /quizzes/{quizId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null;
      allow update, delete: if request.auth != null && 
        resource.data.createdBy == request.auth.uid;
    }
    
    // Quiz submissions
    match /submissions/{submissionId} {
      allow create: if request.auth != null;
      allow read, update: if request.auth != null && 
        resource.data.studentId == request.auth.uid;
    }
    
    // Analytics and logs
    match /analytics/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### **4.2 Storage Rules**
Go to **Storage** → **Rules** tab:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User avatars - users can only access their own
    match /avatars/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Quiz images and media
    match /quiz-media/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Class materials
    match /class-materials/{classId}/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
    
    // General authenticated access
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### **Step 5: Update Website Configuration**

The Firebase config needs to be updated in these files:
- `quiz-app/js/firebase-config.js`
- All HTML files that use Firebase
- Testing tools

### **Step 6: Test the Integration**

Use these testing tools to verify everything works:
1. **Firebase Connection Validator**
2. **Fresh User Creation Test**
3. **Firebase Integration Test Suite**
4. **Automated Test Runner**

### **Step 7: Deploy and Go Live**

1. **Test locally first**
2. **Commit changes to GitHub**
3. **Deploy to GitHub Pages**
4. **Verify live website functionality**

---

## 🎯 Quick Setup Checklist

- [ ] Create new Firebase project
- [ ] Enable Authentication (Email/Password)
- [ ] Create Firestore Database
- [ ] Set up Storage
- [ ] Configure security rules
- [ ] Get Firebase config
- [ ] Update website files
- [ ] Test integration
- [ ] Deploy to production

---

**Next Steps**: 
1. Complete the Firebase project setup
2. Get the new Firebase configuration
3. Update the website files with new config
4. Test the integration
