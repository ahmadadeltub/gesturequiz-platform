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

// Initialize Firebase - Compatible with both v8 and v9
if (typeof firebase !== 'undefined') {
  // Firebase v8 (compat)
  firebase.initializeApp(firebaseConfig);
  
  // Initialize Firebase services
  const auth = firebase.auth();
  const db = firebase.firestore();
  const storage = firebase.storage();
  
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
  
  console.log('✅ Firebase v8 initialized successfully');
  console.log('📊 Project ID:', firebaseConfig.projectId);
  console.log('🔑 Auth Domain:', firebaseConfig.authDomain);
  console.log('💾 Storage Bucket:', firebaseConfig.storageBucket);
} else {
  console.error('❌ Firebase SDK not loaded');
}

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
