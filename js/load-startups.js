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

    // Configuration
    const ITEMS_PER_PAGE = 20; // Limit items per load for performance
    let lastVisible = null;
    let allStartups = [];
    let isLoading = false;

    // Load startups data from Firestore with pagination
    async function loadStartups(loadMore = false) {
        if (isLoading) return [];
        
        try {
            isLoading = true;
            
            // Build query with pagination
            let query = db.collection('startups')
                .where('status', 'in', ['active', 'graduated'])
                .limit(ITEMS_PER_PAGE);
            
            // If loading more, start after last document
            if (loadMore && lastVisible) {
                query = query.startAfter(lastVisible);
            }
            
            const snapshot = await query.get();
            
            // Store last visible document for pagination
            if (snapshot.docs.length > 0) {
                lastVisible = snapshot.docs[snapshot.docs.length - 1];
            }
            
            const startups = [];
            snapshot.forEach(doc => {
                startups.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return startups;
        } catch (error) {
            return [];
        } finally {
            isLoading = false;
        }
    }

    // Render startup cards
    async function renderStartupCards(loadMore = false) {
        if (!loadMore && window.LoadingScreen) {
            window.LoadingScreen.show('Loading startups');
        }
        
        const startups = await loadStartups(loadMore);
        
        if (startups.length === 0 && !loadMore) {
            cardsGrid.innerHTML = '<p style="text-align: center; color: var(--text-light); grid-column: 1/-1;">No startups available yet.</p>';
            if (window.LoadingScreen) window.LoadingScreen.hide();
            return;
        }

        // Add to all startups
        allStartups = loadMore ? [...allStartups, ...startups] : startups;

        // Clear existing cards only if not loading more
        if (!loadMore) {
            cardsGrid.innerHTML = '';
        }

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
                <a href="startup-details.html?id=${startup.id}" class="card-cta">View More <span class="cta-circle">➜</span></a>
            `;

            cardsGrid.appendChild(card);
        });

        // Hide loading screen
        if (window.LoadingScreen) window.LoadingScreen.hide();

        // Show/hide load more button
        const loadMoreBtn = document.getElementById('load-more-startups');
        if (loadMoreBtn) {
            // Show button if we got full page of results (might be more)
            loadMoreBtn.style.display = startups.length === ITEMS_PER_PAGE ? 'block' : 'none';
        }

        // Re-apply any existing filters
        if (typeof applyCurrentFilter === 'function') {
            applyCurrentFilter();
        }
    }

    // Initial render
    await renderStartupCards();

    // Load more button handler
    const loadMoreBtn = document.getElementById('load-more-startups');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', async () => {
            loadMoreBtn.disabled = true;
            loadMoreBtn.textContent = 'Loading...';
            await renderStartupCards(true);
            loadMoreBtn.disabled = false;
            loadMoreBtn.textContent = 'Load More';
        });
    }

    // Optional: Listen for real-time updates (only for first page)
    db.collection('startups')
        .where('status', 'in', ['active', 'graduated'])
        .limit(ITEMS_PER_PAGE)
        .onSnapshot(() => {
            lastVisible = null;
            allStartups = [];
            renderStartupCards();
        });
});
