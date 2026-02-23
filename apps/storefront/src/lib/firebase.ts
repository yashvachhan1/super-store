import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBxAt52ML8Kir8Xh00jAo8e6otZqYke9DU",
    authDomain: "super-store-32a2d.firebaseapp.com",
    projectId: "super-store-32a2d",
    storageBucket: "super-store-32a2d.firebasestorage.app",
    messagingSenderId: "393719807263",
    appId: "1:393719807263:web:da2e36a9596c489330c42a",
    measurementId: "G-JMCY13LMYQ"
};

// Prevent multi-initialization in Next.js
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
