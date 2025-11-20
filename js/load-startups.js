document.addEventListener('DOMContentLoaded', async () => {
    const cardsGrid = document.getElementById('cardsGrid');
    const resultsCount = document.querySelector('.results-count');

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

    let allStartupsData = [];
    let selectedSDGs = []; // Array to hold selected SDGs (e.g. ['SDG 1', 'SDG 5'])

    // --- 1. SDG Dropdown Logic ---
    
    // Toggle Dropdown
    sdgBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent immediate close
        sdgWrapper.classList.toggle('open');
    });

    // Close Dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!sdgWrapper.contains(e.target)) {
            sdgWrapper.classList.remove('open');
        }
    });

    // Handle Checkbox Clicks
    sdgCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateSelectedSDGs();
            filterAndRender(); // Trigger filter immediately
        });
    });

    function updateSelectedSDGs() {
        selectedSDGs = Array.from(sdgCheckboxes)
            .filter(box => box.checked)
            .map(box => box.value); // Returns ['SDG 1', 'SDG 2']

        // Update Button Text
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

    // --- 2. Fetch Data ---
    async function fetchStartups() {
        try {
            cardsGrid.innerHTML = '<p style="text-align:center; width:100%;">Loading startups...</p>';
            
            const snapshot = await db.collection('startups')
                .where('status', 'in', ['active', 'graduated'])
                .get();

            allStartupsData = [];
            snapshot.forEach(doc => {
                allStartupsData.push({ id: doc.id, ...doc.data() });
            });

            filterAndRender();

        } catch (error) {
            console.error("Error fetching startups:", error);
            cardsGrid.innerHTML = '<p>Error loading data.</p>';
        }
    }

    // --- 3. Filter Logic ---
    function filterAndRender() {
        let filtered = [...allStartupsData];

        // A. Search (Name OR Industry)
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(s => 
                (s.name && s.name.toLowerCase().includes(searchTerm)) ||
                (s.industry && s.industry.toLowerCase().includes(searchTerm))
            );
        }

        // B. Category Filter
        const categoryValue = categorySelect.value;
        if (categoryValue) {
            // Check both 'industry' field and 'category' field just in case
            filtered = filtered.filter(s => 
                (s.industry === categoryValue) || (s.category === categoryValue)
            );
        }

        // C. SDG Multi-Filter
        // Show startup if it matches ANY of the selected SDGs
        if (selectedSDGs.length > 0) {
            filtered = filtered.filter(s => {
                if (!s.sdgs) return false; // If startup has no SDGs, hide it
                
                // Check if startup.sdgs (array) contains ANY of selectedSDGs
                // Assume s.sdgs is like ['SDG 1', 'SDG 5']
                // We check if there is intersection
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

        renderCards(filtered);
    }

    // --- 4. Render Cards ---
    function renderCards(startups) {
        cardsGrid.innerHTML = '';
        
        if (resultsCount) {
            resultsCount.textContent = `Showing ${startups.length} of ${allStartupsData.length} startups`;
        }

        if (startups.length === 0) {
            cardsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #777;">No startups match your search.</p>';
            return;
        }

        startups.forEach(startup => {
            const card = document.createElement('article');
            card.className = 'startup-card';

            // Logo
            let logoHTML;
            if (startup.imageUrls && startup.imageUrls[0] && (startup.imageUrls[0].startsWith('http') || startup.imageUrls[0].startsWith('data:'))) {
                logoHTML = `<img src="${startup.imageUrls[0]}" alt="logo" class="startup-logo">`;
            } else {
                logoHTML = `<div class="startup-logo-emoji">${startup.logo || '🚀'}</div>`;
            }

            // Tags Logic
            let tagsHTML = `<span class="tag">${startup.industry || startup.category || 'Startup'}</span>`;
            
            // Show first SDG if exists
            if (startup.sdgs && startup.sdgs.length > 0) {
                tagsHTML += `<span class="tag small">${startup.sdgs[0]}</span>`;
            }
            // Show +X more if multiple SDGs
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
    searchInput.addEventListener('input', filterAndRender);
    categorySelect.addEventListener('change', filterAndRender);
    sortSelect.addEventListener('change', filterAndRender);

    // Initialize
    fetchStartups();
});