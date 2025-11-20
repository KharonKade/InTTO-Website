// Load approved startups from Firestore
document.addEventListener('DOMContentLoaded', async () => {
    // DOM Elements
    const cardsGrid = document.getElementById('cardsGrid');
<<<<<<< Updated upstream
    
    if (!cardsGrid) {
        console.warn('Cards grid not found on this page');
        return;
    }

    // Initialize Firebase if not already initialized
    if (!window.db) {
        console.error('Firebase not initialized! Make sure Firebase scripts are loaded before this script.');
        return;
=======
    const resultsCount = document.querySelector('.results-count');
    const paginationContainer = document.querySelector('.pagination');

    // Filter Elements
    const searchInput = document.getElementById('search-input');
    const categorySelect = document.getElementById('filter-category');
    const sortSelect = document.getElementById('sort-order');

    // SDG Multi-Select Elements
    const sdgWrapper = document.getElementById('sdg-wrapper');
    const sdgBtn = document.getElementById('sdg-btn');
    const sdgBtnText = document.getElementById('sdg-btn-text');
    const sdgCheckboxes = document.querySelectorAll('.item input[type="checkbox"]');

    if (!window.db) {
        console.error('Firebase not initialized!');
        return;
    }

    // --- PAGINATION CONFIGURATION ---
    const ITEMS_PER_PAGE = 6; // Limit to 6 items per page
    let currentPage = 1;
    let allStartupsData = []; // Stores ALL data from DB
    let currentFilteredData = []; // Stores data after Search/Filters are applied
    let selectedSDGs = []; 

    // --- 1. SDG Dropdown Logic ---
    sdgBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sdgWrapper.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (!sdgWrapper.contains(e.target)) {
            sdgWrapper.classList.remove('open');
        }
    });

    sdgCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateSelectedSDGs();
            applyFilters(); // Trigger filter immediately
        });
    });

    function updateSelectedSDGs() {
        selectedSDGs = Array.from(sdgCheckboxes)
            .filter(box => box.checked)
            .map(box => box.value);

        if (selectedSDGs.length > 0) {
            sdgBtnText.textContent = `${selectedSDGs.length} SDG${selectedSDGs.length > 1 ? 's' : ''} Selected`;
            sdgBtnText.style.color = '#1C7F56';
            sdgBtnText.style.fontWeight = 'bold';
        } else {
            sdgBtnText.textContent = 'Select SDGs';
            sdgBtnText.style.color = '#555';
            sdgBtnText.style.fontWeight = 'normal';
        }
>>>>>>> Stashed changes
    }

    // Configuration
    const ITEMS_PER_PAGE = 20; // Limit items per load for performance
    let lastVisible = null;
    let allStartups = [];
    let isLoading = false;

<<<<<<< Updated upstream
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
=======
            allStartupsData = [];
            snapshot.forEach(doc => {
                allStartupsData.push({ id: doc.id, ...doc.data() });
            });

            applyFilters(); // Initial Render

        } catch (error) {
            console.error("Error fetching startups:", error);
            cardsGrid.innerHTML = '<p>Error loading data.</p>';
        }
    }

    // --- 3. Filter Logic ---
    function applyFilters() {
        let filtered = [...allStartupsData];

        // A. Search
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(s => 
                (s.name && s.name.toLowerCase().includes(searchTerm)) ||
                (s.industry && s.industry.toLowerCase().includes(searchTerm))
            );
        }

        // B. Category
        const categoryValue = categorySelect.value;
        if (categoryValue) {
            filtered = filtered.filter(s => 
                (s.industry === categoryValue) || (s.category === categoryValue)
            );
        }

        // C. SDGs
        if (selectedSDGs.length > 0) {
            filtered = filtered.filter(s => {
                if (!s.sdgs) return false;
                return s.sdgs.some(startupSdg => selectedSDGs.includes(startupSdg));
            });
        }

        // D. Sort
        const sortValue = sortSelect.value;
        filtered.sort((a, b) => {
            if (sortValue === 'newest') {
                return (b.dateStarted || '').localeCompare(a.dateStarted || '');
            } else if (sortValue === 'oldest') {
                return (a.dateStarted || '').localeCompare(b.dateStarted || '');
            } else if (sortValue === 'a-z') {
                return (a.name || '').localeCompare(b.name || '');
            }
        });

        // Save results and reset to Page 1
        currentFilteredData = filtered;
        currentPage = 1;
        
        updateDisplay();
    }

    // --- 4. Pagination & Display Logic ---
    function updateDisplay() {
        const totalItems = currentFilteredData.length;
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

        // Safety check
        if (currentPage > totalPages) currentPage = totalPages || 1;

        // Calculate slice (e.g., Items 0-6 for Page 1)
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const pageItems = currentFilteredData.slice(start, end);

        // Update UI
        renderCards(pageItems);
        renderPaginationControls(totalPages);
        
        // Update Results Count Text
        if (resultsCount) {
            resultsCount.textContent = `Showing ${pageItems.length} of ${totalItems} startups`;
        }
    }

    function renderPaginationControls(totalPages) {
        // Clear existing buttons
        paginationContainer.innerHTML = '';

        // If we have 1 page or less, hide pagination entirely
        if (totalPages <= 1) {
            return; 
        }

        // Helper to create buttons
        const createBtn = (content, onClick, isActive = false, isDisabled = false) => {
            const a = document.createElement('a');
            a.href = "#";
            a.className = 'page-btn';
            if (isActive) a.classList.add('active');
            if (isDisabled) a.classList.add('disabled');
            a.innerHTML = content;
            
            if (!isDisabled && !isActive) {
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    onClick();
                    // Scroll to top of grid for better UX
                    document.querySelector('.startups-section').scrollIntoView({behavior: 'smooth'});
                });
            }
            return a;
        };

        // 1. Prev Button
        const prevBtn = createBtn('<i class="fa-solid fa-chevron-left"></i>', 
            () => { currentPage--; updateDisplay(); }, 
            false, 
            currentPage === 1 // Disabled if on page 1
        );
        prevBtn.classList.add('arrow');
        paginationContainer.appendChild(prevBtn);

        // 2. Number Buttons
        for (let i = 1; i <= totalPages; i++) {
            const btn = createBtn(i, 
                () => { currentPage = i; updateDisplay(); }, 
                currentPage === i // Active if current page
            );
            paginationContainer.appendChild(btn);
        }

        // 3. Next Button
        const nextBtn = createBtn('<i class="fa-solid fa-chevron-right"></i>', 
            () => { currentPage++; updateDisplay(); }, 
            false, 
            currentPage === totalPages // Disabled if on last page
        );
        nextBtn.classList.add('arrow');
        paginationContainer.appendChild(nextBtn);
    }

    // --- 5. Render Cards ---
    function renderCards(startups) {
        cardsGrid.innerHTML = '';
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
            card.dataset.category = (startup.category || startup.industry || 'other').toLowerCase();
            
            // Create logo HTML - either image or emoji
=======

>>>>>>> Stashed changes
            let logoHTML;
            if (useImage) {
                logoHTML = `<img src="${logoSrc}" alt="${startup.name} logo" class="startup-logo" onerror="this.outerHTML='<div class=\\'startup-logo\\'>${startup.logo || '🚀'}</div>'">`;
            } else {
                logoHTML = `<div class="startup-logo-emoji">${startup.logo || '🚀'}</div>`;
            }

<<<<<<< Updated upstream
            // Create tags HTML
            let tagsHTML = `
                <span class="tag">${startup.category || startup.industry || 'Startup'}</span>
                <span class="tag small">TRL ${startup.trl || '?'}</span>
            `;

            // Add SDG badge if available
            if (startup.sdgs && Array.isArray(startup.sdgs) && startup.sdgs.length > 0) {
                tagsHTML += `<span class="tag sdg-tag">${startup.sdgs[0]}</span>`;
=======
            let tagsHTML = `<span class="tag">${startup.industry || startup.category || 'Startup'}</span>`;
            
            if (startup.sdgs && startup.sdgs.length > 0) {
                tagsHTML += `<span class="tag small">${startup.sdgs[0]}</span>`;
            }
            if (startup.sdgs && startup.sdgs.length > 1) {
                tagsHTML += `<span class="tag small">+${startup.sdgs.length - 1}</span>`;
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
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
=======
    // Listeners
    searchInput.addEventListener('input', applyFilters);
    categorySelect.addEventListener('change', applyFilters);
    sortSelect.addEventListener('change', applyFilters);

    // Initialize
    fetchStartups();
});
>>>>>>> Stashed changes
