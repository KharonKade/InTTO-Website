
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = { 
    apiKey: "AIzaSyAXNIo4h3Uv7Z8IGdm01zQ8K4WY4G8VLzE",
    authDomain: "uc-intto.firebaseapp.com",
    projectId: "uc-intto",
    storageBucket: "uc-intto.firebasestorage.app",
    messagingSenderId: "156771180433",
    appId: "1:156771180433:web:4f9d57eb6b0e7882ef0430",
    measurementId: "G-ETY9E0F1K6" 
  }; 
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); 