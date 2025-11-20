// ===================================
// ADMIN AUTHENTICATION CHECK
// ===================================

// Hide page content immediately until auth is verified
document.documentElement.style.visibility = 'hidden';

// Firebase configuration (use your existing config)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAXNIo4h3Uv7Z8IGdm01zQ8K4WY4G8VLzE",
    authDomain: "uc-intto.firebaseapp.com",
    projectId: "uc-intto",
    storageBucket: "uc-intto.firebasestorage.app",
    messagingSenderId: "156771180433",
    appId: "1:156771180433:web:4f9d57eb6b0e7882ef0430",
    measurementId: "G-ETY9E0F1K6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Check authentication and admin status
async function checkAdminAuth() {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
            if (!user) {
                // User not logged in - redirect immediately
                window.location.replace('/index.html');
                resolve(false);
                return;
            }

            try {
                // Check if user is admin
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                
                if (!userDoc.exists() || !userDoc.data().isAdmin) {
                    // User is not admin - redirect immediately
                    window.location.replace('/index.html');
                    resolve(false);
                    return;
                }

                // User is authenticated and is admin - show page
                document.documentElement.style.visibility = 'visible';
                resolve(true);
            } catch (error) {
                // Error checking auth - redirect immediately
                window.location.replace('/index.html');
                resolve(false);
            }
        });
    });
}

// Run check immediately
checkAdminAuth();

export { checkAdminAuth };
