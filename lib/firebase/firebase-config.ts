import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAuth } from "firebase/auth"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCBEzvbVPfnvdHjUo-wCAth0MEJaLuYo1A",
  authDomain: "mebel1-36ef1.firebaseapp.com",
  projectId: "mebel1-36ef1",
  storageBucket: "mebel1-36ef1.firebasestorage.app",
  messagingSenderId: "513158929501",
  appId: "1:513158929501:web:444a44a4a1fff5c90441b4",
  measurementId: "G-6R4D5DM1BN",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize services
let analyticsInstance
if (typeof window !== "undefined") {
  try {
    analyticsInstance = getAnalytics(app)
  } catch (error) {
    console.error("Analytics failed to initialize:", error)
    // Fallback or handle the error
    analyticsInstance = null
  }
}

// Initialize Firebase services with error handling
let db, storage, auth

try {
  db = getFirestore(app)
  console.log("Firestore initialized successfully")
} catch (error) {
  console.error("Failed to initialize Firestore:", error)
  throw error
}

try {
  storage = getStorage(app)
  console.log("Firebase Storage initialized successfully")
  console.log("Storage bucket:", firebaseConfig.storageBucket)
} catch (error) {
  console.error("Failed to initialize Firebase Storage:", error)
  throw error
}

try {
  auth = getAuth(app)
  console.log("Firebase Auth initialized successfully")
} catch (error) {
  console.error("Failed to initialize Firebase Auth:", error)
  throw error
}

export { app, db, storage, auth, analyticsInstance }
