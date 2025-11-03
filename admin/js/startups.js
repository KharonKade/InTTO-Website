document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'ucInttoStartupsData';

    // Default data includes a 'createdAt' date for sorting
    const defaultStartups = [
        { id: 1, createdAt: "2025-01-15", name: "AgroTech Solutions", logo: "🌱", category: "Agritech", trl: 7, status: "active", collab: true, website: "https://agrotech.example.com", description: "Smart farming solutions using IoT sensors for precision agriculture and crop monitoring.", tags: ["IoT", "Agriculture", "Sensors"] },
        { id: 2, createdAt: "2025-03-20", name: "HealthHub PH", logo: "🏥", category: "Healthtech", trl: 6, status: "active", collab: false, website: "https://healthhub.example.com", description: "Telemedicine platform connecting rural communities with healthcare professionals.", tags: ["Telemedicine", "Healthcare", "Mobile App"] },
        { id: 3, createdAt: "2025-05-10", name: "SafeCity Monitor", logo: "🚨", category: "CriminTech", trl: 5, status: "active", collab: true, website: "https://safecity.example.com", description: "AI-powered community safety monitoring system with real-time incident reporting.", tags: ["AI", "Safety", "Community"] },
        { id: 4, createdAt: "2024-11-05", name: "Cordillera Crafts", logo: "🎨", category: "Creative", trl: 8, status: "graduated", collab: false, website: "https://cordillera.example.com", description: "Digital marketplace showcasing indigenous Cordilleran arts and crafts.", tags: ["E-commerce", "Arts", "Culture"] },
        { id: 5, createdAt: "2025-08-01", name: "EduLearn Platform", logo: "📚", category: "Edtech", trl: 6, status: "active", collab: true, website: "https://edulearn.example.com", description: "Interactive learning management system for K-12 education in the Philippines.", tags: ["Education", "LMS", "K-12"] }
    ];

    const loadData = () => {
        const savedData = localStorage.getItem(STORAGE_KEY);
        return savedData ? JSON.parse(savedData) : defaultStartups;
    };
    const saveData = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(startupsData));
    };

    let startupsData = loadData();
    let editingStartupId = null;

    // --- DOM Elements ---
    const startupList = document.querySelector('.startup-list');
    const addStartupBtn = document.getElementById('add-startup-btn');
    const modalOverlay = document.getElementById('startup-modal-overlay');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const searchInput = document.getElementById('search-input');
    const filterBtns = document.querySelectorAll('.category-filters .filter-btn');
    const sortDropdown = document.getElementById('sort-startups');

    // Form elements
    const startupForm = document.getElementById('startup-form');
    const modalTitle = document.getElementById('modal-title');
    const modalSubtitle = document.getElementById('modal-subtitle');
    const submitBtn = document.getElementById('submit-btn');
    const startupNameInput = document.getElementById('startup-name');
    const startupLogoInput = document.getElementById('startup-logo');
    const startupCategorySelect = document.getElementById('startup-category');
    const startupTrlInput = document.getElementById('startup-trl');
    const startupStatusSelect = document.getElementById('startup-status');
    const startupWebsiteInput = document.getElementById('startup-website');
    const startupDescriptionTextarea = document.getElementById('startup-description');
    const startupTagsInput = document.getElementById('startup-tags');
    const startupCollabCheckbox = document.getElementById('startup-collab');

    const renderStartups = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const activeFilter = document.querySelector('.category-filters .filter-btn.active').dataset.filter;
        
        let filteredData = startupsData.filter(startup => {
            const matchesCategory = activeFilter === 'all' || startup.category === activeFilter;
            const matchesSearch = startup.name.toLowerCase().includes(searchTerm) ||
                                  startup.description.toLowerCase().includes(searchTerm) ||
                                  startup.tags.some(tag => tag.toLowerCase().includes(searchTerm));
            return matchesCategory && matchesSearch;
        });

        const sortValue = sortDropdown.value;
        if (sortValue === 'recent') {
            filteredData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sortValue === 'oldest') {
            filteredData.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else if (sortValue === 'a-z') {
            filteredData.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortValue === 'z-a') {
            filteredData.sort((a, b) => b.name.localeCompare(a.name));
        }

        startupList.innerHTML = '';
        if (filteredData.length === 0) {
            startupList.innerHTML = `<p style="text-align: center; color: var(--text-light);">No startups found.</p>`;
            return;
        }

        filteredData.forEach(startup => {
            const card = document.createElement('div');
            card.className = 'startup-card';
            card.dataset.id = startup.id;
            const tagsHTML = `
                <span class="tag tag-status-${startup.status}">${startup.status}</span>
                <span class="tag">${startup.category}</span>
                <span class="tag">TRL ${startup.trl}</span>
                ${startup.collab ? `<span class="tag tag-collab">Open for Collab</span>` : ''}
                ${startup.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            `;
            card.innerHTML = `
                <div class="startup-logo logo-${startup.category.toLowerCase()}">${startup.logo}</div>
                <div class="startup-details">
                    <h3>${startup.name}</h3>
                    <p>${startup.description}</p>
                    <div class="tags-container">${tagsHTML}</div>
                </div>
                <div class="startup-actions">
                    <button class="icon-btn edit-btn"><i class="fa-solid fa-pencil"></i></button>
                    <button class="icon-btn delete-btn"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            startupList.appendChild(card);
        });
        attachActionListeners();
    };

    const attachActionListeners = () => {
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', e => {
                const id = parseInt(e.target.closest('.startup-card').dataset.id);
                editStartup(id);
            });
        });
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', e => {
                const id = parseInt(e.target.closest('.startup-card').dataset.id);
                deleteStartup(id);
            });
        });
    };

    const openModal = () => modalOverlay.classList.add('active');
    const closeModal = () => {
        modalOverlay.classList.remove('active');
        startupForm.reset();
        editingStartupId = null;
    };

    const editStartup = (id) => {
        const startup = startupsData.find(s => s.id === id);
        if (!startup) return;
        editingStartupId = id;
        startupNameInput.value = startup.name;
        startupLogoInput.value = startup.logo;
        startupCategorySelect.value = startup.category;
        startupTrlInput.value = startup.trl;
        startupStatusSelect.value = startup.status;
        startupWebsiteInput.value = startup.website;
        startupDescriptionTextarea.value = startup.description;
        startupTagsInput.value = startup.tags.join(', ');
        startupCollabCheckbox.checked = startup.collab;
        modalTitle.textContent = 'Edit Startup';
        modalSubtitle.textContent = 'Update startup information';
        submitBtn.textContent = 'Update Startup';
        openModal();
    };

    const deleteStartup = (id) => {
        if (confirm('Are you sure you want to delete this startup?')) {
            startupsData = startupsData.filter(s => s.id !== id);
            saveData();
            renderStartups();
        }
    };

    addStartupBtn.addEventListener('click', () => {
        editingStartupId = null;
        startupForm.reset();
        modalTitle.textContent = 'Add New Startup';
        modalSubtitle.textContent = 'Add a new startup to the incubation program';
        submitBtn.textContent = 'Create Startup';
        openModal();
    });

    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

    startupForm.addEventListener('submit', e => {
        e.preventDefault();
        const formData = {
            name: startupNameInput.value,
            logo: startupLogoInput.value,
            category: startupCategorySelect.value,
            trl: parseInt(startupTrlInput.value),
            status: startupStatusSelect.value,
            website: startupWebsiteInput.value,
            description: startupDescriptionTextarea.value,
            tags: startupTagsInput.value.split(',').map(tag => tag.trim()).filter(Boolean),
            collab: startupCollabCheckbox.checked,
        };
        if (editingStartupId !== null) {
            const index = startupsData.findIndex(item => item.id === editingStartupId);
            if (index !== -1) {
                startupsData[index] = { ...startupsData[index], ...formData };
            }
        } else {
            formData.id = startupsData.length > 0 ? Math.max(...startupsData.map(item => item.id)) + 1 : 1;
            formData.createdAt = new Date().toISOString().split('T')[0]; // Add creation date
            startupsData.push(formData);
        }
        saveData();
        renderStartups();
        closeModal();
    });

    searchInput.addEventListener('input', renderStartups);
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderStartups();
        });
    });
    sortDropdown.addEventListener('change', renderStartups);

    renderStartups();
});