// ===================================
// ADMIN AUTHENTICATION CHECK
// ===================================

// Hide page content immediately until auth is verified
document.documentElement.style.visibility = 'hidden';

// Firebase configuration (use your existing config)
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

// Initialize Firebase (avoid duplicate initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

// Check authentication and admin status
async function checkAdminAuth() {
    return new Promise((resolve) => {
        // Timeout after 5 seconds if auth doesn't respond
        const timeout = setTimeout(() => {
            console.error('Auth check timeout - showing page anyway');
            document.documentElement.style.visibility = 'visible';
            resolve(false);
        }, 5000);

        onAuthStateChanged(auth, async (user) => {
            clearTimeout(timeout);
            
            if (!user) {
                console.log('No user logged in');
                window.location.replace('/index.html');
                resolve(false);
                return;
            }

            console.log('User logged in:', user.email, 'UID:', user.uid);

            try {
                // Check if user is admin
                console.log('Attempting to fetch user document...');
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                
                if (!userDoc.exists()) {
                    console.error('❌ User document does not exist in Firestore');
                    console.log('📍 Looking for document at path: users/' + user.uid);
                    console.log('🔍 Please verify this document exists in Firebase Console');
                    
                    // Try alternate path or show page anyway for debugging
                    console.warn('⚠️ Showing page for debugging - check console');
                    document.documentElement.style.visibility = 'visible';
                    resolve(false);
                    return;
                }

                const userData = userDoc.data();
                console.log('📄 User document found!');
                console.log('📊 Full user data:', JSON.stringify(userData, null, 2));
                console.log('🔑 isAdmin field type:', typeof userData.isAdmin);
                console.log('🔑 isAdmin field value:', userData.isAdmin);
                
                const isAdmin = userData.isAdmin === true || userData.isAdmin === 'true' || userData.isAdmin === 1;
                
                if (!isAdmin) {
                    console.error('❌ Access denied: User is not admin');
                    console.log('Current isAdmin value:', userData.isAdmin);
                    console.log('Expected: true (boolean) or "true" (string)');
                    window.location.replace('/index.html');
                    resolve(false);
                    return;
                }

                // User is authenticated and is admin - show page
                console.log('✅ SUCCESS: Admin access granted!');
                console.log('👤 User:', user.email);
                document.documentElement.style.visibility = 'visible';
                resolve(true);
            } catch (error) {
                console.error('❌ Auth check error:', error);
                console.error('Error details:', error.message);
                console.error('Error stack:', error.stack);
                
                // For debugging, show page anyway
                console.warn('⚠️ Error occurred - showing page for debugging');
                document.documentElement.style.visibility = 'visible';
                resolve(false);
            }
        });
    });
}

// Run check immediately
checkAdminAuth();

export { checkAdminAuth };
