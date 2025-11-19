// Load approved startups from Firestore
document.addEventListener('DOMContentLoaded', async () => {
    const cardsGrid = document.getElementById('cardsGrid');
    
    if (!cardsGrid) {
        console.warn('Cards grid not found on this page');
        return;
    }

    // Initialize Firebase if not already initialized
    if (!window.db) {
        console.error('Firebase not initialized! Make sure Firebase scripts are loaded before this script.');
        return;
    }

    // Load startups data from Firestore
    async function loadStartups() {
        try {
            console.log('📥 Loading startups from Firestore...');
            const snapshot = await db.collection('startups')
                .where('status', 'in', ['active', 'graduated'])
                .get();
            
            const startups = [];
            snapshot.forEach(doc => {
                startups.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log(`✅ Loaded ${startups.length} approved startups`);
            return startups;
        } catch (error) {
            console.error('❌ Error loading startups:', error);
            return [];
        }
    }

    // Render startup cards
    async function renderStartupCards() {
        const startups = await loadStartups();
        
        if (startups.length === 0) {
            console.log('No approved startups to display');
            cardsGrid.innerHTML = '<p style="text-align: center; color: var(--text-light); grid-column: 1/-1;">No startups available yet.</p>';
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
                tagsHTML += `<span class="tag sdg-tag">${startup.sdgs[0]}</span>`;
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

        console.log(`✅ Rendered ${startups.length} startup cards`);

        // Re-apply any existing filters
        if (typeof applyCurrentFilter === 'function') {
            applyCurrentFilter();
        }
    }

    // Initial render
    await renderStartupCards();

    // Optional: Listen for real-time updates
    db.collection('startups')
        .where('status', 'in', ['active', 'graduated'])
        .onSnapshot(() => {
            console.log('📡 Startups updated in Firestore, re-rendering...');
            renderStartupCards();
        });
});
