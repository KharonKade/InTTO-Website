// ===================================
// ADMIN AUTHENTICATION CHECK
// Block unauthorized access to admin pages
// ===================================

// Hide page immediately until verification complete
document.documentElement.style.visibility = 'hidden';

// Firebase imports
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
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
let app;
if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];
}

const auth = getAuth(app);
const db = getFirestore(app);

// Redirect to homepage
function redirectToHome() {
    window.location.replace('/index.html');
}

// Check admin access
async function checkAdminAccess() {
    return new Promise((resolve) => {
        // Set timeout - if auth doesn't respond in 5 seconds, deny access
        const timeout = setTimeout(() => {
            redirectToHome();
            resolve(false);
        }, 5000);

        onAuthStateChanged(auth, async (user) => {
            clearTimeout(timeout);
            
            // LOGIC 1: If user is not logged in, deny access
            if (!user) {
                redirectToHome();
                resolve(false);
                return;
            }

            try {
                // Get user document from Firestore - using "Registered Accounts" collection as shown in your screenshot
                const userDocRef = doc(db, 'Registered Accounts', user.uid);
                const userDoc = await getDoc(userDocRef);
                
                // LOGIC 2: If user document doesn't exist or isAdmin is false, deny access
                if (!userDoc.exists()) {
                    redirectToHome();
                    resolve(false);
                    return;
                }

                const userData = userDoc.data();
                const isAdmin = userData.isAdmin === true;
                
                // LOGIC 3: If isAdmin === true, grant access
                if (isAdmin) {
                    document.documentElement.style.visibility = 'visible';
                    resolve(true);
                } else {
                    // User is logged in but isAdmin === false, deny access
                    redirectToHome();
                    resolve(false);
                }
                
            } catch (error) {
                // On any error, deny access
                redirectToHome();
                resolve(false);
            }
        });
    });
}

// Run the access check
checkAdminAccess();
