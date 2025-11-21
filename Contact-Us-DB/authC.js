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
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10000;';
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = 'background: white; padding: 40px; border-radius: 16px; max-width: 450px; width: 90%; box-shadow: 0 8px 32px rgba(0,0,0,0.2);';
    
    modalContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0 0 10px 0; color: #1C7F56; font-size: 28px;">${isLogin ? 'Login' : 'Sign Up'}</h2>
            <p style="color: #666; margin: 0; font-size: 14px;">${isLogin ? 'Welcome back! Please login to continue.' : 'Create an account to use the contact form.'}</p>
        </div>
        
        <form id="auth-form" style="display: flex; flex-direction: column; gap: 20px;">
            <div>
                <label style="display: block; margin-bottom: 5px; color: #333; font-size: 14px; font-weight: 600;">Email</label>
                <input type="email" id="auth-email" required 
                    style="width: 100%; padding: 12px; border: 2px solid #E5E5E5; border-radius: 8px; font-size: 14px; box-sizing: border-box;"
                    placeholder="your.email@example.com">
            </div>
            
            <div>
                <label style="display: block; margin-bottom: 5px; color: #333; font-size: 14px; font-weight: 600;">Password</label>
                <input type="password" id="auth-password" required 
                    style="width: 100%; padding: 12px; border: 2px solid #E5E5E5; border-radius: 8px; font-size: 14px; box-sizing: border-box;"
                    placeholder="Enter your password">
                <small style="color: #999; font-size: 12px; display: block; margin-top: 5px;">
                    ${isLogin ? '' : 'Password must be at least 6 characters'}
                </small>
            </div>
            
            <div id="auth-error" style="display: none; background: #FEE; color: #C33; padding: 12px; border-radius: 8px; font-size: 14px; border: 1px solid #FCC;"></div>
            
            <button type="submit" id="auth-submit-btn" 
                style="background: #1C7F56; color: white; border: none; padding: 14px; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600; transition: background 0.2s;">
                ${isLogin ? 'Login' : 'Sign Up'}
            </button>
            
            <div style="text-align: center; font-size: 14px; color: #666;">
                ${isLogin ? "Don't have an account?" : "Already have an account?"}
                <a href="#" id="toggle-auth-mode" style="color: #1C7F56; text-decoration: none; font-weight: 600; margin-left: 5px;">
                    ${isLogin ? 'Sign Up' : 'Login'}
                </a>
            </div>
            
            <button type="button" id="close-auth-modal" 
                style="background: transparent; color: #999; border: none; cursor: pointer; font-size: 14px; text-decoration: underline;">
                Cancel
            </button>
        </form>
    `;
    
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
        
        errorDiv.style.display = 'none';
        submitBtn.disabled = true;
        submitBtn.textContent = isLogin ? 'Logging in...' : 'Creating account...';
        
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
            submitBtn.textContent = isLogin ? 'Login' : 'Sign Up';
        }
    });
    
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
