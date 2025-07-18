// Firebase Configuration for GestureQuiz Platform - NEW PROJECT
const firebaseConfig = {
  apiKey: "AIzaSyAt4ByDMxZFT00a-zESwNHS8uv3DY08uhg",
  authDomain: "gesturequiz-platform-live.firebaseapp.com",
  projectId: "gesturequiz-platform-live",
  storageBucket: "gesturequiz-platform-live.firebasestorage.app",
  messagingSenderId: "794242095954",
  appId: "1:794242095954:web:85868edc63c96d37ea388b",
  measurementId: "G-Y7WPTJRVG6"
};

// Initialize Firebase when script loads
console.log('🔥 Firebase config script loading...');

// Wait for Firebase to be available
function initializeFirebaseWhenReady() {
  if (typeof firebase !== 'undefined' && firebase.apps !== undefined) {
    try {
      // Initialize Firebase if not already initialized
      if (firebase.apps.length === 0) {
        firebase.initializeApp(firebaseConfig);
        console.log('🔥 Firebase app initialized');
      }
      
      // Initialize Firebase services
      const auth = firebase.auth();
      const db = firebase.firestore();
      const storage = firebase.storage();
      
      // CRITICAL: Set authentication persistence to LOCAL for better session management
      auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(() => {
        console.log('✅ Firebase auth persistence set to LOCAL - sessions will persist');
      }).catch((error) => {
        console.error('❌ Failed to set auth persistence:', error);
      });
      
      // Initialize analytics if available
      if (firebase.analytics) {
        const analytics = firebase.analytics();
        window.analytics = analytics;
      }
      
      // Export for use in other files
      window.firebaseConfig = firebaseConfig;
      window.auth = auth;
      window.db = db;
      window.storage = storage;
      window.firebase = firebase;
      
      console.log('✅ Firebase v8 initialized successfully');
      console.log('📊 Project ID:', firebaseConfig.projectId);
      console.log('🔑 Auth Domain:', firebaseConfig.authDomain);
      console.log('💾 Storage Bucket:', firebaseConfig.storageBucket);
      
      // Mark as ready
      window.firebaseReady = true;
      
      // Dispatch ready event
      window.dispatchEvent(new CustomEvent('firebaseReady'));
      
      return true;
    } catch (error) {
      console.error('❌ Firebase initialization error:', error);
      window.firebaseError = error;
      window.dispatchEvent(new CustomEvent('firebaseError', { detail: error }));
      return false;
    }
  } else {
    console.log('⏳ Waiting for Firebase SDK...');
    setTimeout(initializeFirebaseWhenReady, 100);
    return false;
  }
}

// Start initialization
initializeFirebaseWhenReady();

// Test Firebase connection
window.testFirebaseConnection = async function() {
  try {
    // Test Auth
    console.log('🔐 Testing Firebase Auth...');
    const authTest = firebase.auth();
    console.log('✅ Auth service available');
    
    // Test Firestore
    console.log('💾 Testing Firestore...');
    const dbTest = firebase.firestore();
    console.log('✅ Firestore service available');
    
    // Test Storage
    console.log('📁 Testing Storage...');
    const storageTest = firebase.storage();
    console.log('✅ Storage service available');
    
    console.log('🎉 All Firebase services initialized successfully!');
    return true;
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return false;
  }
};
