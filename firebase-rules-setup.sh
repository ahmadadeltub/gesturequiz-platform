# Firebase Security Rules - Quick Fix
# Run this to update your Firebase rules automatically

# Firestore Rules
cat > firestore.rules << 'EOF'
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to authenticated users for their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow read/write access to authenticated users for classes they're involved in
    match /classes/{classId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid in resource.data.teacherIds || 
         request.auth.uid in resource.data.studentIds ||
         request.auth.uid == resource.data.teacherId);
    }
    
    // Allow read/write access to authenticated users for quizzes in their classes
    match /quizzes/{quizId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow read/write access to authenticated users for their quiz submissions
    match /submissions/{submissionId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.studentId;
    }
    
    // Allow test operations (for debugging - remove in production)
    match /test/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Allow test-realtime operations (for debugging - remove in production)
    match /test-realtime/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
EOF

# Storage Rules
cat > storage.rules << 'EOF'
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload/download their own files
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to access quiz-related files
    match /quizzes/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
    
    // Allow test files for debugging
    match /test/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
EOF

echo "📋 Firebase rules files created!"
echo "🔧 To deploy these rules:"
echo "   1. Install Firebase CLI: npm install -g firebase-tools"
echo "   2. Login to Firebase: firebase login"
echo "   3. Initialize project: firebase init"
echo "   4. Deploy rules: firebase deploy --only firestore:rules,storage"
echo ""
echo "Or manually copy the rules from the files above to Firebase Console."
