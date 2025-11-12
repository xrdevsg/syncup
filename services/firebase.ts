// IMPORTANT: Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration provided by the user
const firebaseConfig = {
  apiKey: "AIzaSyAp2XBwJsKne8qW6iI38n87tgLGscC2cBI",
  authDomain: "syncup-app-6b350.firebaseapp.com",
  projectId: "syncup-app-6b350",
  storageBucket: "syncup-app-6b350.firebasestorage.app",
  messagingSenderId: "149709127669",
  appId: "1:149709127669:web:e5965fbabd442bf75c2abc"
};

// Initialize Firebase using the correct modular syntax
const app = initializeApp(firebaseConfig);

// Export Firebase services using the correct modular syntax
export const auth = getAuth(app);
export const db = getFirestore(app);
