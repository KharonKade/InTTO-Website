// Loading Screen Manager
const LoadingScreen = {
    overlay: null,
    
    init() {
        // Create loading overlay if it doesn't exist
        if (!this.overlay) {
            this.overlay = document.createElement('div');
            this.overlay.className = 'loading-overlay';
            this.overlay.innerHTML = `
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">Loading<span class="loading-dots"></span></div>
                </div>
            `;
            document.body.appendChild(this.overlay);
        }
    },
    
    show(message = 'Loading') {
        this.init();
        const textElement = this.overlay.querySelector('.loading-text');
        if (textElement) {
            textElement.innerHTML = `${message}<span class="loading-dots"></span>`;
        }
        this.overlay.classList.remove('hidden');
    },
    
    hide() {
        if (this.overlay) {
            this.overlay.classList.add('hidden');
            // Remove from DOM after animation
            setTimeout(() => {
                if (this.overlay && this.overlay.classList.contains('hidden')) {
                    this.overlay.remove();
                    this.overlay = null;
                }
            }, 300);
        }
    },
    
    updateMessage(message) {
        const textElement = this.overlay?.querySelector('.loading-text');
        if (textElement) {
            textElement.innerHTML = `${message}<span class="loading-dots"></span>`;
        }
    }
};

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => LoadingScreen.init());
} else {
    LoadingScreen.init();
}

// Export for use in other scripts
window.LoadingScreen = LoadingScreen;
