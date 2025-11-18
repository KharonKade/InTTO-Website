// Load approved startups from admin data
document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'ucInttoStartupsData';
    const cardsGrid = document.getElementById('cardsGrid');
    
    if (!cardsGrid) {
        console.warn('Cards grid not found on this page');
        return;
    }

    // Load startups data from localStorage
    function loadStartups() {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (!savedData) {
            console.log('No startups data found in localStorage');
            return [];
        }
        
        const allStartups = JSON.parse(savedData);
        // Only return active and graduated startups (approved ones)
        return allStartups.filter(startup => 
            startup.status === 'active' || startup.status === 'graduated'
        );
    }

    // Render startup cards
    function renderStartupCards() {
        const startups = loadStartups();
        
        if (startups.length === 0) {
            console.log('No approved startups to display');
            return;
        }

        // Clear existing cards
        cardsGrid.innerHTML = '';

        startups.forEach(startup => {
            // Get the logo image (use first image URL if available, otherwise use emoji)
            const logoSrc = (startup.imageUrls && startup.imageUrls.length > 0 && startup.imageUrls[0]) 
                ? startup.imageUrls[0] 
                : null;

            // Determine if we should use image or emoji
            const useImage = logoSrc && (logoSrc.startsWith('http') || logoSrc.startsWith('data:image'));
            
            // Build the card HTML
            const card = document.createElement('article');
            card.className = 'startup-card';
            card.dataset.category = (startup.category || startup.industry || 'other').toLowerCase();
            
            // Create logo HTML - either image or emoji
            let logoHTML;
            if (useImage) {
                logoHTML = `<img src="${logoSrc}" alt="${startup.name} logo" class="startup-logo" onerror="this.outerHTML='<div class=\\'startup-logo\\'>${startup.logo || '🚀'}</div>'">`;
            } else {
                logoHTML = `<div class="startup-logo-emoji">${startup.logo || '🚀'}</div>`;
            }

            // Create tags HTML
            let tagsHTML = `
                <span class="tag">${startup.category || startup.industry || 'Startup'}</span>
                <span class="tag small">TRL ${startup.trl || '?'}</span>
            `;

            // Add SDG badge if available
            if (startup.sdgs && Array.isArray(startup.sdgs) && startup.sdgs.length > 0) {
                tagsHTML += `<span class="tag sdg-tag">SDG ${startup.sdgs[0]}</span>`;
            }

            card.innerHTML = `
                <div class="card-head">
                    ${logoHTML}
                    <div class="card-meta">
                        <h3 class="startup-name">${startup.name || 'Unnamed Startup'}</h3>
                        <div class="tags">
                            ${tagsHTML}
                        </div>
                    </div>
                </div>
                <p class="startup-desc">${startup.description || startup.shortDescription || 'No description available.'}</p>
                <a href="#" class="card-cta" data-startup-id="${startup.id}">View More <span class="cta-circle">➜</span></a>
            `;

            cardsGrid.appendChild(card);
        });

        console.log(`✅ Loaded ${startups.length} approved startups`);

        // Re-apply any existing filters
        if (typeof applyCurrentFilter === 'function') {
            applyCurrentFilter();
        }
    }

    // Initial render
    renderStartupCards();

    // Re-render when storage changes (if user approves in another tab)
    window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) {
            console.log('Startups data updated, re-rendering...');
            renderStartupCards();
        }
    });
});
