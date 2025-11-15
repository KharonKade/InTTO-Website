/**
 * authentication.js
 * Handles Firebase Authentication (Sign In, Sign Up, Sign Out, Google Auth) and UI updates.
 * Requires the Firebase SDKs to be initialized in index.html.
 */

// --- DOM Elements ---
const authModalOverlay = document.getElementById('auth-modal-overlay');
const signinPanel = document.getElementById('signin-panel');
const signupPanel = document.getElementById('signup-panel');
const openSigninBtn = document.getElementById('open-signin-btn');
const modalCloseBtn = document.getElementById('modal-close-btn');
const showSignupLink = document.getElementById('show-signup-link');
const showSigninLink = document.getElementById('show-signin-link');
const signoutBtnMain = document.getElementById('signout-btn-main');
const userInfoContainer = document.getElementById('user-info-container');
const userDisplayMain = document.getElementById('user-display-main');
const submitProjectBtn = document.getElementById('submit-project-btn');
const alertModalOverlay = document.getElementById('alert-modal-overlay');
const alertModalOkBtn = document.getElementById('alert-modal-ok-btn');
const alertModalMessage = document.getElementById('alert-modal-message');

// Forms and inputs
const signinForm = document.getElementById('signin-form');
const signinEmailInput = document.getElementById('signin-email-input');
const signinPasswordInput = document.getElementById('signin-password-input');

const signupForm = document.getElementById('signup-form');
const signupFirstNameInput = document.getElementById('signup-first-name-input');
const signupLastNameInput = document.getElementById('signup-last-name-input');
const signupEmailInput = document.getElementById('signup-email-input');
const signupPasswordInput = document.getElementById('signup-password-input');
const signupPassword2Input = document.getElementById('signup-password2-input');
const signupAffiliationInput = document.getElementById('signup-affiliation-input');

// --- NEW GOOGLE AUTH DOM Elements ---
const googleSigninBtn = document.getElementById('google-signin-btn');
const googleSignupBtn = document.getElementById('google-signup-btn'); // <<< ADDED FOR SIGNUP PANEL

// --- Firebase Provider Initialization ---
const googleProvider = new firebase.auth.GoogleAuthProvider();


// --- UI Management Functions ---

/**
 * Shows the main authentication modal.
 * @param {string} panelId - 'signin-panel' or 'signup-panel' to show initially.
 */
function openAuthModal(panelId = 'signin-panel') {
    signinPanel.classList.toggle('hidden', panelId !== 'signin-panel');
    signupPanel.classList.toggle('hidden', panelId !== 'signup-panel');
    authModalOverlay.classList.remove('modal-hidden');
    // Clear any previous error messages in the form (a good practice)
    clearFormErrors();
}

/**
 * Hides the main authentication modal.
 */
function closeAuthModal() {
    authModalOverlay.classList.add('modal-hidden');
}

/**
 * Shows a custom alert modal for errors or warnings.
 * @param {string} message - The message to display.
 */
function showAlertModal(message) {
    alertModalMessage.textContent = message;
    alertModalOverlay.classList.remove('modal-hidden');
}

/**
 * Hides the custom alert modal.
 */
function closeAlertModal() {
    alertModalOverlay.classList.add('modal-hidden');
}

/**
 * Displays an error message inside the specified form.
 * @param {HTMLElement} formElement - The sign-in or sign-up form.
 * @param {string} message - The error message.
 */
function displayFormError(formElement, message) {
    // Look for an existing error message element, or create a new one
    let errorElement = formElement.querySelector('.form-error-message');
    if (!errorElement) {
        errorElement = document.createElement('p');
        errorElement.className = 'form-error-message';
        // Insert the error message before the first button (Google or Primary)
        const primaryBtn = formElement.querySelector('.btn-form-primary');
        const googleBtn = formElement.querySelector('.btn-google');
        
        // Use the first available button as the reference point
        const insertBeforeElement = primaryBtn || googleBtn || formElement.lastElementChild;
        formElement.insertBefore(errorElement, insertBeforeElement);
    }
    errorElement.textContent = `Error: ${message}`;
    errorElement.style.color = '#dc3545'; // Custom error styling
    errorElement.style.marginTop = '10px';
}

/**
 * Clears any error messages in both sign-in and sign-up forms.
 */
function clearFormErrors() {
    document.querySelectorAll('.form-error-message').forEach(el => el.remove());
}

/**
 * Updates the header UI based on the user's authentication state.
 * @param {firebase.User|null} user - The currently authenticated Firebase user.
 */
function updateUI(user) {
    if (user) {
        // User is signed in
        openSigninBtn.classList.add('hidden');
        userInfoContainer.classList.remove('hidden');
        
        // Display user info (using displayName or email)
        const displayName = user.displayName || user.email;
        userDisplayMain.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            ${displayName.split('@')[0]}
        `;
        
        // Remove 'Sign In Required' lock for project submission
        submitProjectBtn.removeEventListener('click', showProjectAuthAlert);

    } else {
        // User is signed out
        openSigninBtn.classList.remove('hidden');
        userInfoContainer.classList.add('hidden');

        // Restore 'Sign In Required' lock for project submission
        submitProjectBtn.addEventListener('click', showProjectAuthAlert);
    }
}

/**
 * Prevents navigation and shows an alert if the user is not signed in.
 * @param {Event} e 
 */
function showProjectAuthAlert(e) {
    e.preventDefault(); // Stop the link from navigating
    showAlertModal('You must be signed in to submit a project. Please sign in or create an account.');
    // You could also auto-open the sign-in modal here: openAuthModal();
}

// --- Firebase Authentication Functions ---

/**
 * Handles user registration with Email/Password.
 * @param {string} email 
 * @param {string} password 
 * @param {string} firstName 
 * @param {string} lastName 
 */
async function handleSignUp(email, password, firstName, lastName) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Update user profile with display name
        await user.updateProfile({
            displayName: `${firstName} ${lastName}`
        });

        // Optional: Save additional user data (like affiliation) to Firestore/Realtime DB here
        // e.g., db.collection('users').doc(user.uid).set({ firstName, lastName, affiliation: signupAffiliationInput.value });
        
        closeAuthModal();
        console.log('User signed up and profile updated:', user);

    } catch (error) {
        displayFormError(signupForm, error.message);
        console.error('Sign Up Error:', error.code, error.message);
    }
}

/**
 * Handles user sign-in with Email/Password.
 * @param {string} email 
 * @param {string} password 
 */
async function handleSignIn(email, password) {
    try {
        await auth.signInWithEmailAndPassword(email, password);
        closeAuthModal();
        console.log('User signed in successfully.');

    } catch (error) {
        displayFormError(signinForm, error.message);
        console.error('Sign In Error:', error.code, error.message);
    }
}

/**
 * Handles Google Sign-In/Sign-Up using a pop-up window (reusable for both buttons).
 */
async function handleGoogleSignIn() {
    clearFormErrors();
    try {
        const result = await auth.signInWithPopup(googleProvider);
        
        const user = result.user;
        
        closeAuthModal();
        console.log("Google Sign-in successful:", user.displayName, user.email);
        
        // 🌟 SIGNUP/NEW USER LOGIC FOR GOOGLE 🌟
        if (result.additionalUserInfo.isNewUser) {
             console.log("New user signed up with Google. Checking for required fields...");
             
             // If a redirect to a profile completion page is intended:
             setTimeout(() => {
                 showAlertModal("Welcome! Please complete your profile (Affiliation) to submit a project.");
                 // window.location.href = '/complete-profile.html'; 
             }, 500); 
        }

    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        
        if (errorCode === 'auth/popup-closed-by-user') {
            console.log('Google Sign-In popup closed by user.');
            return;
        }

        console.error('Google Sign-In Error:', errorCode, errorMessage);
        
        // Display error in the currently visible form panel
        const activeForm = signinPanel.classList.contains('hidden') ? signupForm : signinForm;
        displayFormError(activeForm, `Google Sign-In Failed: ${errorMessage}`);
    }
}

/**
 * Handles user sign-out.
 */
async function handleSignOut() {
    try {
        await auth.signOut();
        console.log('User signed out successfully.');
    } catch (error) {
        showAlertModal('Error signing out. Please try again.');
        console.error('Sign Out Error:', error.code, error.message);
    }
}


// --- Event Listeners and Initial Setup ---

// 1. Initial Auth State Listener (Crucial for session persistence)
auth.onAuthStateChanged((user) => {
    updateUI(user);
    if (!user) {
        signinPanel.classList.remove('hidden');
        signupPanel.classList.add('hidden');
    }
});

// 2. Modal Controls
openSigninBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openAuthModal('signin-panel');
});

modalCloseBtn.addEventListener('click', closeAuthModal);
alertModalOkBtn.addEventListener('click', closeAlertModal);

// Close modal when clicking outside (on the overlay)
authModalOverlay.addEventListener('click', (e) => {
    if (e.target === authModalOverlay) {
        closeAuthModal();
    }
});

// 3. Form Switching
showSignupLink.addEventListener('click', (e) => {
    e.preventDefault();
    clearFormErrors();
    signinPanel.classList.add('hidden');
    signupPanel.classList.remove('hidden');
});

showSigninLink.addEventListener('click', (e) => {
    e.preventDefault();
    clearFormErrors();
    signupPanel.classList.add('hidden');
    signinPanel.classList.remove('hidden');
});

// 4. Sign-In Form Submission (Email/Password)
signinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFormErrors();
    const email = signinEmailInput.value;
    const password = signinPasswordInput.value;
    handleSignIn(email, password);
});

// 5. Sign-Up Form Submission (Email/Password)
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFormErrors();
    
    const email = signupEmailInput.value;
    const password = signupPasswordInput.value;
    const password2 = signupPassword2Input.value;
    const firstName = signupFirstNameInput.value;
    const lastName = signupLastNameInput.value;
    
    // --- INPUT VALIDATION ---
    if (password !== password2) {
        displayFormError(signupForm, 'Passwords do not match. Please ensure both fields are the same.');
        return;
    }
    
    if (password.length < 6) {
        displayFormError(signupForm, 'Password must be at least 6 characters.');
        return;
    }

    handleSignUp(email, password, firstName, lastName);
});

// 6. Sign-Out Button
signoutBtnMain.addEventListener('click', (e) => {
    e.preventDefault();
    handleSignOut();
});

// 7. Initial state for 'Submit Your Project' button
submitProjectBtn.addEventListener('click', showProjectAuthAlert);

// 8. Google Sign-In Button (for signin panel)
if (googleSigninBtn) {
    googleSigninBtn.addEventListener('click', handleGoogleSignIn);
}

// 9. Google Sign-Up Button (for signup panel)
if (googleSignupBtn) {
    googleSignupBtn.addEventListener('click', handleGoogleSignIn);
}