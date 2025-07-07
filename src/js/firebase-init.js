import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAt4ByDMxZFT00a-zESwNHS8uv3DY08uhg",
  authDomain: "gesturequiz-platform-live.firebaseapp.com",
  projectId: "gesturequiz-platform-live",
  storageBucket: "gesturequiz-platform-live.firebasestorage.app",
  messagingSenderId: "794242095954",
  appId: "1:794242095954:web:85868edc63c96d37ea388b",
  measurementId: "G-Y7WPTJRVG6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
