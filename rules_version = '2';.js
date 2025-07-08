rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to create and read their own user document
    match /users/{userId} {
      allow create: if request.auth != null;
      allow read, update: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to access other collections
    match /classes/{classId} {
      allow read, write: if request.auth != null;
    }
    
    match /quizzes/{quizId} {
      allow read, write: if request.auth != null;
    }
    
    match /submissions/{submissionId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow test collections (for diagnostics)
    match /test/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}