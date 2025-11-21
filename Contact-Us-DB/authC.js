import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from './scriptC.js';

let currentUser = null;

// Initialize auth state listener
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    updateAuthUI();
});

/**
 * Get current authenticated user
 */
export const getCurrentUser = () => {
    return currentUser;
};

/**
 * Update UI based on auth state
 */
const updateAuthUI = () => {
    const contactForm = document.getElementById('contact-form');
    const userInfo = document.getElementById('user-auth-info');
    
    if (!contactForm) return;
    
    // Remove existing auth info if present
    const existingInfo = document.getElementById('user-auth-info');
    if (existingInfo) {
        existingInfo.remove();
    }
    
    if (currentUser) {
        // User is logged in - show user info and enable form
        const inputs = contactForm.querySelectorAll('input, textarea, button');
        inputs.forEach(input => input.disabled = false);
        
        // Add user info above form
        const authInfo = document.createElement('div');
        authInfo.id = 'user-auth-info';
        authInfo.style.cssText = 'background: #E5FAEA; color: #1C7F56; padding: 15px; border-radius: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;';
        authInfo.innerHTML = `
            <div>
                <strong>✓ Logged in as:</strong> ${currentUser.email}
            </div>
            <button id="logout-btn" style="background: #1C7F56; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; font-size: 14px;">
                Logout
            </button>
        `;
        contactForm.insertBefore(authInfo, contactForm.firstChild);
        
        // Add logout handler
        document.getElementById('logout-btn').addEventListener('click', handleLogout);
        
    } else {
        // User is not logged in - disable form and show login prompt
        const inputs = contactForm.querySelectorAll('input, textarea, button[type="submit"]');
        inputs.forEach(input => input.disabled = true);
        
        // Add auth prompt above form
        const authInfo = document.createElement('div');
        authInfo.id = 'user-auth-info';
        authInfo.style.cssText = 'background: #FFF3CD; color: #856404; padding: 20px; border-radius: 10px; margin-bottom: 20px; text-align: center; border: 2px solid #FFE69C;';
        authInfo.innerHTML = `
            <div style="font-size: 32px; margin-bottom: 10px;">🔒</div>
            <h3 style="margin: 0 0 10px 0; font-size: 18px;">Authentication Required</h3>
            <p style="margin: 0 0 15px 0; font-size: 14px;">Please login or sign up to use the contact form</p>
            <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                <button id="show-login-btn" style="background: #1C7F56; color: white; border: none; padding: 10px 24px; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: 600;">
                    Login
                </button>
                <button id="show-signup-btn" style="background: white; color: #1C7F56; border: 2px solid #1C7F56; padding: 10px 24px; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: 600;">
                    Sign Up
                </button>
            </div>
        `;
        contactForm.insertBefore(authInfo, contactForm.firstChild);
        
        // Add event listeners to show auth modals
        document.getElementById('show-login-btn').addEventListener('click', () => showAuthModal('login'));
        document.getElementById('show-signup-btn').addEventListener('click', () => showAuthModal('signup'));
    }
};

/**
 * Show authentication modal
 */
const showAuthModal = (mode = 'login') => {
    const isLogin = mode === 'login';
    
    const modal = document.createElement('div');
    modal.id = 'auth-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 10000; font-family: "Poppins", sans-serif;';
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = 'background: white; padding: 40px; border-radius: 24px; max-width: 480px; width: 90%; box-shadow: 0 10px 40px rgba(0,0,0,0.15); position: relative;';
    
    if (isLogin) {
        // Login Modal Design
        modalContent.innerHTML = `
            <button id="close-auth-modal" style="position: absolute; top: 20px; right: 20px; background: transparent; border: none; font-size: 24px; color: #999; cursor: pointer; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; padding: 0;">×</button>
            
            <div style="margin-bottom: 32px;">
                <h2 style="margin: 0 0 8px 0; color: #000; font-size: 32px; font-weight: 700; font-family: 'Poppins', sans-serif;">Welcome Back</h2>
                <p style="color: #666; margin: 0; font-size: 16px; font-family: 'Poppins', sans-serif;">Sign in to submit and manage your projects</p>
            </div>
            
            <form id="auth-form" style="display: flex; flex-direction: column; gap: 20px;">
                <div>
                    <label style="display: block; margin-bottom: 8px; color: #000; font-size: 14px; font-weight: 500; font-family: 'Poppins', sans-serif;">Email Address <span style="color: #d9534f;">*</span></label>
                    <div style="position: relative;">
                        <span style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #999; font-size: 18px;">✉</span>
                        <input type="email" id="auth-email" required 
                            style="width: 100%; padding: 14px 14px 14px 48px; border: 2px solid #E5E5E5; border-radius: 12px; font-size: 15px; box-sizing: border-box; font-family: 'Poppins', sans-serif; transition: border-color 0.2s;"
                            placeholder="your.email@uc-bcf.edu.ph"
                            onfocus="this.style.borderColor='#1C7F56'" 
                            onblur="this.style.borderColor='#E5E5E5'">
                    </div>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 8px; color: #000; font-size: 14px; font-weight: 500; font-family: 'Poppins', sans-serif;">Password <span style="color: #d9534f;">*</span></label>
                    <div style="position: relative;">
                        <span style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #999; font-size: 18px;">🔒</span>
                        <input type="password" id="auth-password" required 
                            style="width: 100%; padding: 14px 14px 14px 48px; border: 2px solid #E5E5E5; border-radius: 12px; font-size: 15px; box-sizing: border-box; font-family: 'Poppins', sans-serif; transition: border-color 0.2s;"
                            placeholder="Enter your password"
                            onfocus="this.style.borderColor='#1C7F56'" 
                            onblur="this.style.borderColor='#E5E5E5'">
                    </div>
                    <div style="text-align: right; margin-top: 8px;">
                        <a href="#" style="color: #1C7F56; font-size: 13px; text-decoration: none; font-family: 'Poppins', sans-serif;">Forgot Password?</a>
                    </div>
                </div>
                
                <div id="auth-error" style="display: none; background: #FEE; color: #C33; padding: 12px; border-radius: 8px; font-size: 14px; border: 1px solid #FCC; font-family: 'Poppins', sans-serif;"></div>
                
                <button type="submit" id="auth-submit-btn" 
                    style="background: #1C7F56; color: white; border: none; padding: 16px; border-radius: 12px; cursor: pointer; font-size: 16px; font-weight: 600; font-family: 'Poppins', sans-serif; transition: background 0.2s; margin-top: 8px;"
                    onmouseover="this.style.background='#166c41'" 
                    onmouseout="this.style.background='#1C7F56'">
                    Sign In
                </button>
                
                <div style="text-align: center; margin: 16px 0;">
                    <span style="color: #999; font-size: 14px; font-family: 'Poppins', sans-serif;">OR</span>
                </div>
                
                <button type="button" id="google-signin-btn" 
                    style="background: #1C7F56; color: white; border: none; padding: 16px; border-radius: 12px; cursor: pointer; font-size: 16px; font-weight: 600; font-family: 'Poppins', sans-serif; display: flex; align-items: center; justify-content: center; gap: 10px; transition: background 0.2s;"
                    onmouseover="this.style.background='#166c41'" 
                    onmouseout="this.style.background='#1C7F56'">
                    <span style="font-size: 18px;">G</span> Sign in with Google
                </button>
                
                <div style="text-align: center; font-size: 15px; color: #666; margin-top: 8px; font-family: 'Poppins', sans-serif;">
                    Don't have an account? <a href="#" id="toggle-auth-mode" style="color: #1C7F56; text-decoration: none; font-weight: 600;">Sign Up</a>
                </div>
            </form>
        `;
    } else {
        // Sign Up Modal Design
        modalContent.innerHTML = `
            <button id="close-auth-modal" style="position: absolute; top: 20px; right: 20px; background: transparent; border: none; font-size: 24px; color: #999; cursor: pointer; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; padding: 0;">×</button>
            
            <div style="margin-bottom: 32px;">
                <h2 style="margin: 0 0 8px 0; color: #000; font-size: 32px; font-weight: 700; font-family: 'Poppins', sans-serif;">Create Account</h2>
                <p style="color: #666; margin: 0; font-size: 16px; font-family: 'Poppins', sans-serif;">Join the UC innovation community</p>
            </div>
            
            <form id="auth-form" style="display: flex; flex-direction: column; gap: 18px;">
                <div>
                    <label style="display: block; margin-bottom: 8px; color: #000; font-size: 14px; font-weight: 500; font-family: 'Poppins', sans-serif;">First Name <span style="color: #d9534f;">*</span></label>
                    <div style="position: relative;">
                        <span style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #999; font-size: 18px;">👤</span>
                        <input type="text" id="auth-firstname" required 
                            style="width: 100%; padding: 14px 14px 14px 48px; border: 2px solid #E5E5E5; border-radius: 12px; font-size: 15px; box-sizing: border-box; font-family: 'Poppins', sans-serif; transition: border-color 0.2s;"
                            placeholder="Enter your first name"
                            onfocus="this.style.borderColor='#1C7F56'" 
                            onblur="this.style.borderColor='#E5E5E5'">
                    </div>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 8px; color: #000; font-size: 14px; font-weight: 500; font-family: 'Poppins', sans-serif;">Last Name <span style="color: #d9534f;">*</span></label>
                    <div style="position: relative;">
                        <span style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #999; font-size: 18px;">👤</span>
                        <input type="text" id="auth-lastname" required 
                            style="width: 100%; padding: 14px 14px 14px 48px; border: 2px solid #E5E5E5; border-radius: 12px; font-size: 15px; box-sizing: border-box; font-family: 'Poppins', sans-serif; transition: border-color 0.2s;"
                            placeholder="Enter your last name"
                            onfocus="this.style.borderColor='#1C7F56'" 
                            onblur="this.style.borderColor='#E5E5E5'">
                    </div>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 8px; color: #000; font-size: 14px; font-weight: 500; font-family: 'Poppins', sans-serif;">Email Address <span style="color: #d9534f;">*</span></label>
                    <div style="position: relative;">
                        <span style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #999; font-size: 18px;">✉</span>
                        <input type="email" id="auth-email" required 
                            style="width: 100%; padding: 14px 14px 14px 48px; border: 2px solid #E5E5E5; border-radius: 12px; font-size: 15px; box-sizing: border-box; font-family: 'Poppins', sans-serif; transition: border-color 0.2s;"
                            placeholder="your.email@uc-bcf.edu.ph"
                            onfocus="this.style.borderColor='#1C7F56'" 
                            onblur="this.style.borderColor='#E5E5E5'">
                    </div>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 8px; color: #000; font-size: 14px; font-weight: 500; font-family: 'Poppins', sans-serif;">Affiliation <span style="color: #d9534f;">*</span></label>
                    <div style="position: relative;">
                        <span style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #999; font-size: 18px;">🏢</span>
                        <input type="text" id="auth-affiliation" required 
                            style="width: 100%; padding: 14px 14px 14px 48px; border: 2px solid #E5E5E5; border-radius: 12px; font-size: 15px; box-sizing: border-box; font-family: 'Poppins', sans-serif; transition: border-color 0.2s;"
                            placeholder="e.g., College of Business"
                            onfocus="this.style.borderColor='#1C7F56'" 
                            onblur="this.style.borderColor='#E5E5E5'">
                    </div>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 8px; color: #000; font-size: 14px; font-weight: 500; font-family: 'Poppins', sans-serif;">Password <span style="color: #d9534f;">*</span></label>
                    <div style="position: relative;">
                        <span style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #999; font-size: 18px;">🔒</span>
                        <input type="password" id="auth-password" required 
                            style="width: 100%; padding: 14px 14px 14px 48px; border: 2px solid #E5E5E5; border-radius: 12px; font-size: 15px; box-sizing: border-box; font-family: 'Poppins', sans-serif; transition: border-color 0.2s;"
                            placeholder="Enter your password"
                            onfocus="this.style.borderColor='#1C7F56'" 
                            onblur="this.style.borderColor='#E5E5E5'">
                    </div>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 8px; color: #000; font-size: 14px; font-weight: 500; font-family: 'Poppins', sans-serif;">Repeat Password <span style="color: #d9534f;">*</span></label>
                    <div style="position: relative;">
                        <span style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #999; font-size: 18px;">🔒</span>
                        <input type="password" id="auth-password-confirm" required 
                            style="width: 100%; padding: 14px 14px 14px 48px; border: 2px solid #E5E5E5; border-radius: 12px; font-size: 15px; box-sizing: border-box; font-family: 'Poppins', sans-serif; transition: border-color 0.2s;"
                            placeholder="Repeat your password"
                            onfocus="this.style.borderColor='#1C7F56'" 
                            onblur="this.style.borderColor='#E5E5E5'">
                    </div>
                </div>
                
                <div id="auth-error" style="display: none; background: #FEE; color: #C33; padding: 12px; border-radius: 8px; font-size: 14px; border: 1px solid #FCC; font-family: 'Poppins', sans-serif;"></div>
                
                <button type="submit" id="auth-submit-btn" 
                    style="background: #1C7F56; color: white; border: none; padding: 16px; border-radius: 12px; cursor: pointer; font-size: 16px; font-weight: 600; font-family: 'Poppins', sans-serif; transition: background 0.2s; margin-top: 8px;"
                    onmouseover="this.style.background='#166c41'" 
                    onmouseout="this.style.background='#1C7F56'">
                    Create Account
                </button>
                
                <button type="button" id="google-signup-btn" 
                    style="background: white; color: #666; border: 2px solid #E5E5E5; padding: 16px; border-radius: 12px; cursor: pointer; font-size: 16px; font-weight: 600; font-family: 'Poppins', sans-serif; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.2s;"
                    onmouseover="this.style.borderColor='#1C7F56'; this.style.color='#1C7F56'" 
                    onmouseout="this.style.borderColor='#E5E5E5'; this.style.color='#666'">
                    <span style="font-size: 18px;">G</span> Sign Up with Google
                </button>
                
                <div style="text-align: center; font-size: 15px; color: #666; margin-top: 8px; font-family: 'Poppins', sans-serif;">
                    Already have an account? <a href="#" id="toggle-auth-mode" style="color: #1C7F56; text-decoration: none; font-weight: 600;">Sign In</a>
                </div>
            </form>
        `;
    }
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Handle form submission
    const form = document.getElementById('auth-form');
    const errorDiv = document.getElementById('auth-error');
    const submitBtn = document.getElementById('auth-submit-btn');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;
        
        // Validate signup fields
        if (!isLogin) {
            const passwordConfirm = document.getElementById('auth-password-confirm').value;
            const firstname = document.getElementById('auth-firstname').value;
            const lastname = document.getElementById('auth-lastname').value;
            const affiliation = document.getElementById('auth-affiliation').value;
            
            if (password !== passwordConfirm) {
                errorDiv.textContent = 'Passwords do not match.';
                errorDiv.style.display = 'block';
                return;
            }
            
            if (!firstname || !lastname || !affiliation) {
                errorDiv.textContent = 'Please fill in all required fields.';
                errorDiv.style.display = 'block';
                return;
            }
        }
        
        errorDiv.style.display = 'none';
        submitBtn.disabled = true;
        submitBtn.textContent = isLogin ? 'Signing in...' : 'Creating account...';
        
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            
            // Success - close modal
            modal.remove();
            
            // Show success message
            showSuccessMessage(isLogin ? 'Successfully logged in!' : 'Account created successfully!');
            
        } catch (error) {
            console.error('Auth error:', error);
            let errorMessage = 'An error occurred. Please try again.';
            
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'This email is already registered. Please login instead.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password must be at least 6 characters.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Please enter a valid email address.';
            } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage = 'Invalid email or password.';
            } else if (error.code === 'auth/invalid-credential') {
                errorMessage = 'Invalid email or password.';
            }
            
            errorDiv.textContent = errorMessage;
            errorDiv.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = isLogin ? 'Sign In' : 'Create Account';
        }
    });
    
    // Google Sign In button (placeholder)
    const googleBtn = document.getElementById(isLogin ? 'google-signin-btn' : 'google-signup-btn');
    if (googleBtn) {
        googleBtn.addEventListener('click', () => {
            errorDiv.textContent = 'Google Sign-In is not configured yet. Please use email/password.';
            errorDiv.style.display = 'block';
        });
    }
    
    // Toggle between login/signup
    document.getElementById('toggle-auth-mode').addEventListener('click', (e) => {
        e.preventDefault();
        modal.remove();
        showAuthModal(isLogin ? 'signup' : 'login');
    });
    
    // Close modal
    document.getElementById('close-auth-modal').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
};

/**
 * Handle logout
 */
const handleLogout = async () => {
    try {
        await signOut(auth);
        showSuccessMessage('Successfully logged out!');
    } catch (error) {
        console.error('Logout error:', error);
        alert('Failed to logout. Please try again.');
    }
};

/**
 * Show success message
 */
const showSuccessMessage = (message) => {
    const toast = document.createElement('div');
    toast.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #1C7F56; color: white; padding: 16px 24px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 10001; font-size: 14px; font-weight: 600;';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transition = 'opacity 0.3s';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

// Initialize auth UI when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateAuthUI);
} else {
    updateAuthUI();
}
