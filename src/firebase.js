// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Adding Auth support as it's commonly needed

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD84Telp9eJ32tOd-08ei70CXygsgHzibY",
    authDomain: "cmr-62bc3.firebaseapp.com",
    projectId: "cmr-62bc3",
    storageBucket: "cmr-62bc3.firebasestorage.app",
    messagingSenderId: "293020797144",
    appId: "1:293020797144:web:e27abeee9a781b9858afad",
    measurementId: "G-ZK4YEX056J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };
