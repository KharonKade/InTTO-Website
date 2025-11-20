document.addEventListener('DOMContentLoaded', async () => {
    // DOM Elements
    const cardsGrid = document.getElementById('cardsGrid');
    const resultsCount = document.querySelector('.results-count');
    const paginationContainer = document.querySelector('.pagination');

    // Filter Elements
    const searchInput = document.getElementById('search-input');
    const categorySelect = document.getElementById('filter-category');
    const sortSelect = document.getElementById('sort-order');
    
    // SDG Elements
    const sdgWrapper = document.getElementById('sdg-wrapper');
    const sdgBtn = document.getElementById('sdg-btn');
    const sdgBtnText = document.getElementById('sdg-btn-text');
    const sdgCheckboxes = document.querySelectorAll('.item input[type="checkbox"]');

    if (!window.db) {
        console.error('Firebase is NOT initialized. Check your HTML script order.');
        if(cardsGrid) cardsGrid.innerHTML = '<p>Error: Database not connected.</p>';
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
        
        document.addEventListener('click', (e) => {
            if (!sdgWrapper.contains(e.target)) {
                sdgWrapper.classList.remove('open');
            }
        });
    }

    if(sdgCheckboxes.length > 0) {
        sdgCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                updateSelectedSDGs();
                applyFilters();
            });
        });
    }

    if(searchInput) searchInput.addEventListener('input', applyFilters);
    if(categorySelect) categorySelect.addEventListener('change', applyFilters);
    if(sortSelect) sortSelect.addEventListener('change', applyFilters);


    // --- HELPER FUNCTIONS ---
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
    }

    // --- MAIN LOAD FUNCTION ---
    async function fetchStartups() {
        if(!cardsGrid) return;

        try {
            cardsGrid.innerHTML = '<p style="text-align:center; width:100%;">Loading startups...</p>';
            
            // FETCH ALL STARTUPS (Removed 'status' filter to ensure data shows)
            const snapshot = await db.collection('startups').get();

            allStartupsData = [];
            snapshot.forEach(doc => {
                allStartupsData.push({ id: doc.id, ...doc.data() });
            });

            applyFilters(); // Initial Render

        } catch (error) {
            console.error("Error fetching startups:", error);
            cardsGrid.innerHTML = '<p style="text-align:center;">Error loading data. Check console.</p>';
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

        currentFilteredData = filtered;
        currentPage = 1;
        updateDisplay();
    }

    // --- PAGINATION & RENDER ---
    function updateDisplay() {
        const totalItems = currentFilteredData.length;
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
        if (currentPage > totalPages) currentPage = totalPages || 1;

        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const pageItems = currentFilteredData.slice(start, end);

        renderCards(pageItems);
        renderPaginationControls(totalPages);
        
        if (resultsCount) {
            resultsCount.textContent = `Showing ${pageItems.length} of ${totalItems} startups`;
        }
    }

    function renderPaginationControls(totalPages) {
        if(!paginationContainer) return;
        paginationContainer.innerHTML = '';

        if (totalPages <= 1) return; 

        const createBtn = (content, onClick, isActive, isDisabled) => {
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
                    document.querySelector('.startups-section').scrollIntoView({behavior: 'smooth'});
                });
            }
            return a;
        };

        // Prev
        paginationContainer.appendChild(createBtn('<i class="fa-solid fa-chevron-left"></i>', () => { currentPage--; updateDisplay(); }, false, currentPage === 1));

        // Numbers
        for (let i = 1; i <= totalPages; i++) {
            paginationContainer.appendChild(createBtn(i, () => { currentPage = i; updateDisplay(); }, currentPage === i));
        }

        // Next
        paginationContainer.appendChild(createBtn('<i class="fa-solid fa-chevron-right"></i>', () => { currentPage++; updateDisplay(); }, false, currentPage === totalPages));
    }

    function renderCards(startups) {
        if(!cardsGrid) return;
        cardsGrid.innerHTML = '';

        if (startups.length === 0) {
            cardsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #777;">No startups match criteria.</p>';
            return;
        }

        startups.forEach(startup => {
            const card = document.createElement('article');
            card.className = 'startup-card';

            let logoHTML;
            if (startup.imageUrls && startup.imageUrls.length > 0 && (startup.imageUrls[0].startsWith('http') || startup.imageUrls[0].startsWith('data:'))) {
                logoHTML = `<img src="${startup.imageUrls[0]}" alt="logo" class="startup-logo">`;
            } else {
                logoHTML = `<div class="startup-logo-emoji">${startup.logo || '🚀'}</div>`;
            }

            let tagsHTML = `<span class="tag">${startup.industry || startup.category || 'Startup'}</span>`;
            
            if (startup.sdgs && startup.sdgs.length > 0) {
                tagsHTML += `<span class="tag small">${startup.sdgs[0]}</span>`;
            }
            if (startup.sdgs && startup.sdgs.length > 1) {
                tagsHTML += `<span class="tag small">+${startup.sdgs.length - 1}</span>`;
            }

            card.innerHTML = `
                <div class="card-head">
                    ${logoHTML}
                    <div class="card-meta">
                        <h3 class="startup-name">${startup.name || 'Unnamed'}</h3>
                        <div class="tags">${tagsHTML}</div>
                    </div>
                </div>
                <p class="startup-desc">${startup.description ? startup.description.substring(0, 120) + '...' : 'No description.'}</p>
                <a href="startup-details.html?id=${startup.id}" class="card-cta">View More <span class="cta-circle">➜</span></a>
            `;
            cardsGrid.appendChild(card);
        });
    }

    // Listeners
    searchInput.addEventListener('input', applyFilters);
    categorySelect.addEventListener('change', applyFilters);
    sortSelect.addEventListener('change', applyFilters);

    // Initialize
    fetchStartups();
});