document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'ucInttoNewsEventsData';

    // Default data if nothing is in localStorage
    const defaultNewsEvents = [
        { id: 1, title: "InTTO Hosts Innovation Week 2024", type: "event", status: "published", date: "2024-11-01", tags: ["Innovation Week", "Event"], content: "Join us for a week-long celebration of innovation featuring startup pitches, workshops, and networking events.", sdgs: [9, 17] }, // Added example SDGs
        { id: 2, title: "New Partnership with DOST Region CAR", type: "news", status: "published", date: "2024-10-15", tags: ["Partnership", "DOST"], content: "UC InTTO announces strategic partnership with DOST CAR to accelerate technology transfer and commercialization.", sdgs: [17] }, // Added example SDGs
        { id: 3, title: "IP Protection Workshop", type: "event", status: "draft", date: "2024-11-15", tags: ["Workshop", "IP", "TTO"], content: "Learn about intellectual property protection strategies for your innovations. Open to all UC faculty and students.", sdgs: [4, 9] }, // Added example SDGs
        { id: 4, title: "Seed Funding Opportunity for UC Startups", type: "news", status: "published", date: "2024-09-20", tags: ["Funding", "Startup"], content: "Exciting new seed funding program launched for University of the Cordilleras-affiliated startups. Apply now!", sdgs: [8] } // Added example SDGs
    ];

    // --- Load/Save Data ---
    const loadData = () => {
        const savedData = localStorage.getItem(STORAGE_KEY);
        return savedData ? JSON.parse(savedData) : defaultNewsEvents;
    };

    const saveData = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newsEventsData));
    };

    let newsEventsData = loadData();
    let editingItemId = null;

    // --- DOM Elements ---
    const newsEventList = document.getElementById('news-event-list');
    const searchInput = document.getElementById('search-input');
    const typeFilters = document.getElementById('news-event-type-filters');
    const addNewsEventBtn = document.getElementById('add-news-event-btn');
    const sortDropdown = document.getElementById('sort-news');

    // Modal elements
    const newsEventModalOverlay = document.getElementById('news-event-modal-overlay');
    const closeNewsEventModalBtn = document.getElementById('close-news-event-modal-btn');
    const cancelNewsEventBtn = document.getElementById('cancel-news-event-btn');
    const newsEventForm = document.getElementById('news-event-form');
    const newsEventModalTitle = document.getElementById('news-event-modal-title');
    const newsEventModalSubtitle = document.getElementById('news-event-modal-subtitle');
    const submitNewsEventBtn = document.getElementById('submit-news-event-btn');

    // Form input elements
    const newsEventTitleInput = document.getElementById('news-event-title');
    const newsEventTypeSelect = document.getElementById('news-event-type');
    const newsEventStatusSelect = document.getElementById('news-event-status');
    const newsEventDateInput = document.getElementById('news-event-date');
    const newsEventTagsInput = document.getElementById('news-event-tags');
    const newsEventSdgsInput = document.getElementById('news-event-sdgs'); // <-- NEW
    const newsEventContentTextarea = document.getElementById('news-event-content');

    // --- Render News/Events ---
    const renderNewsEvents = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const activeTypeFilter = typeFilters.querySelector('.filter-btn.active').dataset.filter;

        let filteredData = newsEventsData.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(searchTerm) ||
                                item.content.toLowerCase().includes(searchTerm) ||
                                item.tags.some(tag => tag.toLowerCase().includes(searchTerm));
            const matchesType = activeTypeFilter === 'all' || item.type === activeTypeFilter;
            return matchesSearch && matchesType;
        });
        
        const sortValue = sortDropdown.value;
        if (sortValue === 'recent') {
            filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (sortValue === 'oldest') {
            filteredData.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else if (sortValue === 'a-z') {
            filteredData.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortValue === 'z-a') {
            filteredData.sort((a, b) => b.title.localeCompare(a.title));
        }

        newsEventList.innerHTML = '';
        if (filteredData.length === 0) {
            newsEventList.innerHTML = '<p style="text-align: center; color: var(--text-light); margin-top: 30px;">No news or events found.</p>';
            return;
        }

        filteredData.forEach(item => {
            const card = document.createElement('div');
            card.className = 'news-event-card';
            card.dataset.id = item.id;
            
            // --- NEW: Add SDG tags ---
            const sdgTagsHTML = (item.sdgs && Array.isArray(item.sdgs))
                ? item.sdgs.map(sdg => `<span class="tag tag-sdg">SDG ${sdg}</span>`).join('')
                : '';

            card.innerHTML = `
                <div class="card-content">
                    <h3>${item.title}</h3>
                    <p class="description">${item.content.substring(0, 150)}${item.content.length > 150 ? '...' : ''}</p>
                    <div class="meta-tags">
                        <span class="tag type-${item.type}">${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
                        <span class="tag status-${item.status}">${item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
                        <i class="fa-regular fa-calendar-alt date-icon"></i>
                        <span>${new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        ${item.tags.map(tag => `<span class="tag item-tag">${tag}</span>`).join('')}
                        ${sdgTagsHTML} </div>
                </div>
                <div class="card-actions">
                    <button class="action-btn edit-btn" title="Edit"><i class="fa-solid fa-pencil"></i></button>
                    <button class="action-btn delete-btn" title="Delete"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            `;
            newsEventList.appendChild(card);
        });
        attachActionListeners();
    };

    // --- Attach Listeners to Dynamic Buttons ---
    const attachActionListeners = () => {
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', e => {
                const id = parseInt(e.target.closest('.news-event-card').dataset.id);
                editNewsEvent(id);
            });
        });
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', e => {
                const id = parseInt(e.target.closest('.news-event-card').dataset.id);
                deleteNewsEvent(id);
            });
        });
    };

    // --- Modal Functions ---
    const openModal = () => newsEventModalOverlay.classList.add('active');
    const closeModal = () => {
        newsEventModalOverlay.classList.remove('active');
        newsEventForm.reset();
        editingItemId = null;
    };

    // --- CRUD Functions ---
    const editNewsEvent = (id) => {
        const item = newsEventsData.find(ne => ne.id === id);
        if (!item) return;
        editingItemId = id;
        newsEventTitleInput.value = item.title;
        newsEventTypeSelect.value = item.type;
        newsEventStatusSelect.value = item.status;
        newsEventDateInput.value = item.date;
        newsEventTagsInput.value = item.tags.join(', ');
        newsEventContentTextarea.value = item.content;
        
        // --- NEW: Load SDG data into form ---
        if (item.sdgs && Array.isArray(item.sdgs)) {
            newsEventSdgsInput.value = item.sdgs.join(', ');
        } else {
            newsEventSdgsInput.value = '';
        }
        // --- END NEW ---
        
        newsEventModalTitle.textContent = 'Edit Item';
        newsEventModalSubtitle.textContent = 'Update news or event information';
        submitNewsEventBtn.textContent = 'Update';
        openModal();
    };

    const deleteNewsEvent = (id) => {
        if (confirm('Are you sure you want to delete this news/event item?')) {
            newsEventsData = newsEventsData.filter(item => item.id !== id);
            saveData();
            renderNewsEvents();
        }
    };

    // --- Event Listeners ---
    addNewsEventBtn.addEventListener('click', () => {
        editingItemId = null;
        newsEventForm.reset();
        newsEventModalTitle.textContent = 'Add News/Event';
        newsEventModalSubtitle.textContent = 'Create a new news article or event';
        submitNewsEventBtn.textContent = 'Create';
        openModal();
    });

    closeNewsEventModalBtn.addEventListener('click', closeModal);
    cancelNewsEventBtn.addEventListener('click', closeModal);
    newsEventModalOverlay.addEventListener('click', e => { if (e.target === newsEventModalOverlay) closeModal(); });

    newsEventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // --- NEW: Process SDGs from text input to array ---
        const sdgString = newsEventSdgsInput.value || '';
        const sdgs = sdgString
            .split(',')
            .map(s => parseInt(s.trim()))
            .filter(n => !isNaN(n) && n >= 1 && n <= 17);
        // --- END NEW ---
        
        const formData = {
            title: newsEventTitleInput.value,
            type: newsEventTypeSelect.value,
            status: newsEventStatusSelect.value,
            date: newsEventDateInput.value,
            tags: newsEventTagsInput.value.split(',').map(tag => tag.trim()).filter(Boolean),
            content: newsEventContentTextarea.value,
            sdgs: sdgs // <-- NEW: Add the processed array
        };
        
        if (editingItemId !== null) {
            const index = newsEventsData.findIndex(item => item.id === editingItemId);
            if (index !== -1) {
                // Preserve existing data like ID
                newsEventsData[index] = { ...newsEventsData[index], ...formData };
            }
        } else {
            formData.id = newsEventsData.length > 0 ? Math.max(...newsEventsData.map(item => item.id)) + 1 : 1;
            newsEventsData.push(formData);
        }
        
        saveData();
        renderNewsEvents();
        closeModal();
    });

    searchInput.addEventListener('input', renderNewsEvents);
    typeFilters.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
            typeFilters.querySelector('.filter-btn.active').classList.remove('active');
            e.target.classList.add('active');
            renderNewsEvents();
        }
    });

    sortDropdown.addEventListener('change', renderNewsEvents);

    // --- Initial Render ---
    renderNewsEvents();
});