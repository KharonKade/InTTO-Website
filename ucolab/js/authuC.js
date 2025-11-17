import { saveApplication } from "./saveInfouC.js";
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

// Initialize Firebase (replace with your config)
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
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

console.log("🔥 Firebase initialized successfully in authuC.js");
console.log("Firebase app name:", app.name);
console.log("Firebase project:", firebaseConfig.projectId);

/**
 * Redirects user based on admin status
 * @param {boolean} isAdmin - Whether user is admin
 */
function redirectUser(isAdmin) {
    console.log('🔀 redirectUser() called with isAdmin:', isAdmin);
    console.log('🔀 isAdmin === true:', isAdmin === true);
    console.log('🔀 typeof isAdmin:', typeof isAdmin);
    
    if (isAdmin === true) {
        console.log('👑 ADMIN DETECTED - Redirecting to: ../admin/dashboard.html');
        alert('Welcome Admin! Redirecting to dashboard...');
        window.location.href = '../admin/dashboard.html';
    } else {
        console.log('👤 Regular user - Redirecting to: index.html');
        window.location.href = 'index.html';
    }
}

/**
 * Collects form data from the signup form, excluding password
 * @param {HTMLFormElement} form - The signup form element
 * @returns {Object} Form data without password
 */
function collectFormData(form) {
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        // CRITICAL: Never store passwords in Firestore
        if (key !== 'password' && key !== 'password2' && key !== 'confirmPassword') {
            data[key] = value;
        }
    }
    
    return data;
}

// Sign In Form Handler
const signInForm = document.getElementById('signin-form');
const googleSignInBtn = document.getElementById('google-signin-btn');

if (signInForm) {
    signInForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            console.log('🔵 [authuC.js] Starting email/password sign in...');
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log('✅ [authuC.js] User signed in. UID:', user.uid);
            console.log('📧 [authuC.js] Email:', user.email);
            
            // Update last login time in Registered Accounts collection
            const userDocRef = doc(db, 'Registered Accounts', user.uid);
            console.log('🔍 [authuC.js] Fetching user document from Firestore...');
            const userDoc = await getDoc(userDocRef);
            
            if (!userDoc.exists()) {
                console.error('❌ [authuC.js] User document not found in Firestore!');
                alert('User profile not found. Please complete registration.');
                window.location.href = 'signupform.html';
            } else {
                console.log('✅ [authuC.js] User document found');
                
                // Update last login
                await setDoc(userDocRef, {
                    lastLogin: serverTimestamp()
                }, { merge: true });
                console.log('✅ [authuC.js] Last login updated');
                
                // Check if user is admin and redirect accordingly
                const userData = userDoc.data();
                console.log('📄 [authuC.js] User data:', JSON.stringify(userData, null, 2));
                
                const isAdmin = userData.isAdmin || false;
                console.log('🛡️  [authuC.js] isAdmin (raw):', userData.isAdmin);
                console.log('🛡️  [authuC.js] isAdmin (type):', typeof userData.isAdmin);
                console.log('🛡️  [authuC.js] isAdmin || false:', isAdmin);
                console.log('🛡️  [authuC.js] isAdmin === true:', isAdmin === true);
                console.log('🔀 [authuC.js] Calling redirectUser()...');
                
                redirectUser(isAdmin);
            }
        } catch (error) {
            console.error('Sign in error:', error);
            if (error.code === 'auth/user-not-found') {
                alert('No account found with this email. Please sign up first.');
            } else if (error.code === 'auth/wrong-password') {
                alert('Incorrect password. Please try again.');
            } else if (error.code === 'auth/invalid-email') {
                alert('Please enter a valid email address.');
            } else {
                alert('Sign in failed: ' + error.message);
            }
        }
    });
}

// Google Sign In Handler
if (googleSignInBtn) {
    googleSignInBtn.addEventListener('click', async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            const isNewUser = result._tokenResponse?.isNewUser || false;
            
            // Check if user exists in our Registered Accounts collection
            const userDocRef = doc(db, 'Registered Accounts', user.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (!userDoc.exists() || isNewUser) {
                // New user - save to Registered Accounts
                const userData = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || 'N/A',
                    firstName: user.displayName?.split(' ')[0] || 'N/A',
                    lastName: user.displayName?.split(' ').slice(1).join(' ') || 'N/A',
                    affiliation: 'N/A', // Can be updated later in profile
                    loginType: 'Google',
                    createdAt: serverTimestamp(),
                    lastLogin: serverTimestamp(),
                    photoURL: user.photoURL || null,
                    isAdmin: false // New users are not admins by default
                };
                
                console.log("📝 Saving new Google user to Firestore:", userData);
                await saveApplication(userData);
                console.log("✅ Google user data saved successfully");
                alert('Welcome! Please complete your profile.');
                window.location.href = 'index.html';
            } else {
                console.log('✅ [authuC.js] Existing Google user found');
                // Existing user - just sign in and update last login
                await setDoc(userDocRef, {
                    lastLogin: serverTimestamp()
                }, { merge: true });
                console.log('✅ [authuC.js] Last login updated');
                
                // Check if user is admin and redirect accordingly
                const userData = userDoc.data();
                console.log('📄 [authuC.js] User data:', JSON.stringify(userData, null, 2));
                
                const isAdmin = userData.isAdmin || false;
                console.log('🛡️  [authuC.js] isAdmin (raw):', userData.isAdmin);
                console.log('🛡️  [authuC.js] isAdmin (type):', typeof userData.isAdmin);
                console.log('🛡️  [authuC.js] isAdmin || false:', isAdmin);
                console.log('🛡️  [authuC.js] isAdmin === true:', isAdmin === true);
                console.log('🔀 [authuC.js] Calling redirectUser()...');
                
                redirectUser(isAdmin);
            }
        } catch (error) {
            console.error('Google sign in error:', error);
            if (error.code === 'auth/popup-closed-by-user') {
                console.log('Sign-in popup was closed.');
            } else {
                alert('Google sign in failed: ' + error.message);
            }
        }
    });
}

// Sign Up Form Handler
const signUpForm = document.getElementById('signup-form');
if (signUpForm) {
    signUpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form values from the actual input IDs
        const email = document.getElementById('signup-email-input')?.value || 
                     document.getElementById('email')?.value;
        const password = document.getElementById('signup-password-input')?.value || 
                        document.getElementById('password')?.value;
        const password2 = document.getElementById('signup-password2-input')?.value;
        const firstName = document.getElementById('signup-first-name-input')?.value || 
                         document.getElementById('firstName')?.value || 
                         document.getElementById('first-name')?.value || '';
        const lastName = document.getElementById('signup-last-name-input')?.value || 
                        document.getElementById('lastName')?.value || 
                        document.getElementById('last-name')?.value || '';
        const affiliation = document.getElementById('signup-affiliation-input')?.value || 
                           document.getElementById('affiliation')?.value || '';
        
        // Validation
        if (!email || !password) {
            alert('Please provide both email and password.');
            return;
        }
        
        if (password2 && password !== password2) {
            alert('Passwords do not match. Please try again.');
            return;
        }
        
        if (password.length < 6) {
            alert('Password must be at least 6 characters long.');
            return;
        }
        
        try {
            // Create user account with Firebase Auth (password handled securely by Firebase)
            console.log("📝 Creating user account for:", email);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("✅ User account created successfully. UID:", user.uid);
            
            // Update user profile with display name
            if (firstName && lastName) {
                console.log("Updating user profile with display name...");
                await updateProfile(user, {
                    displayName: `${firstName} ${lastName}`
                });
                console.log("✅ User profile updated");
            }
            
            // Prepare user data for Firestore (NO PASSWORD)
            const userData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || `${firstName} ${lastName}`,
                firstName: firstName || 'N/A',
                lastName: lastName || 'N/A',
                affiliation: affiliation || 'N/A',
                loginType: 'Email/Password',
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
                isAdmin: false // New users are not admins by default
            };
            
            console.log("💾 Saving user data to Firestore:", userData);
            // Save to Firestore "Registered Accounts" collection
            const docId = await saveApplication(userData);
            
            console.log('🎉 User registered successfully. Document ID:', docId);
            alert('Registration successful! Welcome to UCoLab.');
            window.location.href = 'index.html'; // Redirect to main page
        } catch (error) {
            console.error('Sign up error:', error);
            if (error.code === 'auth/email-already-in-use') {
                alert('This email is already registered. Please sign in instead.');
            } else if (error.code === 'auth/weak-password') {
                alert('Password should be at least 6 characters.');
            } else if (error.code === 'auth/invalid-email') {
                alert('Please enter a valid email address.');
            } else {
                alert('Registration failed: ' + error.message);
            }
        }
    });
}