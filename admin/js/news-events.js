document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'ucInttoNewsEventsData';

    // --- Global State for Images ---
    // Note: Image handling is mostly done in the form page now, 
    // but we initialize this array just in case needed for defaults.
    let uploadedImageUrls = ["", "", "", "", ""]; 

    // Default data
    const defaultNewsEvents = [
        { id: 1, title: "InTTO Hosts Innovation Week 2024", type: "event", status: "published", date: "2024-11-01", tags: ["Innovation Week", "Event"], content: "Join us for a week-long celebration...", sdgs: ["9", "17"], images: [] }, 
        { id: 2, title: "New Partnership with DOST Region CAR", type: "news", status: "published", date: "2024-10-15", tags: ["Partnership", "DOST"], content: "UC InTTO announces strategic partnership...", sdgs: ["17"], images: [] },
        { id: 3, title: "IP Protection Workshop", type: "event", status: "draft", date: "2024-11-15", tags: ["Workshop", "IP", "TTO"], content: "Learn about IP protection...", sdgs: ["4", "9"], images: [] }, 
        { id: 4, title: "Seed Funding Opportunity", type: "news", status: "published", date: "2024-09-20", tags: ["Funding", "Startup"], content: "New seed funding program...", sdgs: ["8"], images: [] } 
    ];

    const loadData = () => {
        const savedData = localStorage.getItem(STORAGE_KEY);
        return savedData ? JSON.parse(savedData) : defaultNewsEvents;
    };

    const saveData = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newsEventsData));
    };

    let newsEventsData = loadData();

    // --- DOM Elements ---
    const newsEventList = document.getElementById('news-event-list');
    const searchInput = document.getElementById('search-input');
    const typeFilters = document.getElementById('news-event-type-filters');
    const addNewsEventBtn = document.getElementById('add-news-event-btn');
    const sortDropdown = document.getElementById('sort-news');

    // --- Render List ---
    const renderNewsEvents = () => {
        // Reload data to catch updates from other tabs
        newsEventsData = loadData();

        const searchTerm = searchInput.value.toLowerCase();
        // Check if filter exists, default to 'all' if not found
        const activeBtn = document.querySelector('.type-filters .filter-btn.active');
        const activeTypeFilter = activeBtn ? activeBtn.dataset.filter : 'all';

        let filteredData = newsEventsData.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(searchTerm) ||
                                item.content.toLowerCase().includes(searchTerm);
            const matchesType = activeTypeFilter === 'all' || item.type === activeTypeFilter;
            return matchesSearch && matchesType;
        });
        
        const sortValue = sortDropdown.value;
        if (sortValue === 'recent') filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));
        else if (sortValue === 'oldest') filteredData.sort((a, b) => new Date(a.date) - new Date(b.date));
        else if (sortValue === 'a-z') filteredData.sort((a, b) => a.title.localeCompare(b.title));
        else if (sortValue === 'z-a') filteredData.sort((a, b) => b.title.localeCompare(a.title));

        newsEventList.innerHTML = '';
        if (filteredData.length === 0) {
            newsEventList.innerHTML = '<p style="text-align: center; color: var(--text-light); margin-top: 30px;">No news or events found.</p>';
            return;
        }

        filteredData.forEach(item => {
            const card = document.createElement('div');
            card.className = 'news-event-card';
            card.dataset.id = item.id;
            
            // Use uploaded image or fallback
            const imgUrl = (item.images && item.images.length > 0) ? item.images[0] : 'https://via.placeholder.com/150?text=No+Image';
            // Handle SDG tags safely (ensure it's an array)
            const sdgs = Array.isArray(item.sdgs) ? item.sdgs : [];
            const sdgTags = sdgs.map(s => `<span class="tag tag-sdg">SDG ${s}</span>`).join('');

            card.innerHTML = `
                <div class="card-img" style="width: 120px; height: 120px; border-radius: 8px; overflow: hidden; flex-shrink: 0;">
                    <img src="${imgUrl}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://via.placeholder.com/150?text=Error'">
                </div>
                <div class="card-content">
                    <h3>${item.title}</h3>
                    <p class="description">${item.content.substring(0, 120)}...</p>
                    <div class="meta-tags">
                        <span class="tag type-${item.type}">${item.type.toUpperCase()}</span>
                        <span class="tag status-${item.status}">${item.status}</span>
                        <span><i class="fa-regular fa-calendar"></i> ${item.date}</span>
                        ${sdgTags}
                    </div>
                </div>
                <div class="card-actions">
                    <button class="action-btn edit-btn" title="Edit"><i class="fa-solid fa-pencil"></i></button>
                    <button class="action-btn delete-btn" title="Delete"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            newsEventList.appendChild(card);
        });
        attachActionListeners();
    };

    const attachActionListeners = () => {
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', e => editNewsEvent(parseInt(e.target.closest('.news-event-card').dataset.id)));
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', e => deleteNewsEvent(parseInt(e.target.closest('.news-event-card').dataset.id)));
        });
    };

    // --- 5. NEW: Open New Tabs for Actions ---

    const editNewsEvent = (id) => {
        // Open the dedicated form page with the ID parameter
        window.open(`news-event-form.html?id=${id}`, '_blank'); 
    };

    const deleteNewsEvent = (id) => {
        if (confirm('Are you sure you want to delete this item?')) {
            newsEventsData = newsEventsData.filter(i => i.id !== id);
            saveData();
            renderNewsEvents();
        }
    };

    if (addNewsEventBtn) {
        addNewsEventBtn.addEventListener('click', () => {
            // Open the dedicated form page for a new entry
            window.open('news-event-form.html', '_blank');
        });
    }

    if (searchInput) searchInput.addEventListener('input', renderNewsEvents);
    
    if (typeFilters) {
        typeFilters.addEventListener('click', (e) => {
            if(e.target.classList.contains('filter-btn')) {
                const currentActive = document.querySelector('.type-filters .active');
                if(currentActive) currentActive.classList.remove('active');
                e.target.classList.add('active');
                renderNewsEvents();
            }
        });
    }
    
    if (sortDropdown) sortDropdown.addEventListener('change', renderNewsEvents);
    
    // Auto-refresh when tab comes back into focus
    // This ensures updates made in the form tab appear here immediately
    window.addEventListener('focus', () => {
        console.log("Window focused, refreshing list...");
        renderNewsEvents();
    });

    // Initial Render
    renderNewsEvents();
});