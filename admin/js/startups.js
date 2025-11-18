document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'ucInttoStartupsData';

    // Default data includes a 'createdAt' date for sorting
    const defaultStartups = [
        { id: 1, createdAt: "2025-01-15", name: "AgroTech Solutions", logo: "🧑‍🌾", category: "Agritech", trl: 7, status: "active", collab: true, website: "https://agrotech.example.com", description: "Smart farming solutions using IoT sensors for precision agriculture and crop monitoring.", tags: ["IoT", "Agriculture", "Sensors"], sdgs: [2, 9, 13] }, // Added example SDGs
        { id: 2, createdAt: "2025-03-20", name: "HealthHub PH", logo: "❤️", category: "Healthtech", trl: 6, status: "active", collab: false, website: "https://healthhub.example.com", description: "Telemedicine platform connecting rural communities with healthcare professionals.", tags: ["Telemedicine", "Healthcare", "Mobile App"], sdgs: [3, 10] }, // Added example SDGs
        { id: 3, createdAt: "2025-05-10", name: "SafeCity Monitor", logo: "🛡️", category: "CriminTech", trl: 5, status: "active", collab: true, website: "https://safecity.example.com", description: "AI-powered community safety monitoring system with real-time incident reporting.", tags: ["AI", "Safety", "Community"], sdgs: [11, 16] }, // Added example SDGs
        { id: 4, createdAt: "2024-11-05", name: "Cordillera Crafts", logo: "🏺", category: "Creative", trl: 8, status: "graduated", collab: false, website: "https://cordillera.example.com", description: "Digital marketplace showcasing indigenous Cordilleran arts and crafts.", tags: ["E-commerce", "Arts", "Culture"], sdgs: [1, 8, 10] }, // Added example SDGs
        { id: 5, createdAt: "2025-08-01", name: "EduLearn Platform", logo: "📚", category: "Edtech", trl: 6, status: "active", collab: true, website: "https://edulearn.example.com", description: "Interactive learning management system for K-12 education in the Philippines.", tags: ["Education", "LMS", "K-12"], sdgs: [4] } // Added example SDGs
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
    const startupTypeInput = document.getElementById('startup-type');
    const startupTrlInput = document.getElementById('startup-trl');
    const startupStatusSelect = document.getElementById('startup-status');
    const startupWebsiteInput = document.getElementById('startup-website');
    const startupCollegeInput = document.getElementById('startup-college');
    const startupDescriptionTextarea = document.getElementById('startup-description');
    const startupDetailedDescriptionTextarea = document.getElementById('startup-detailed-description');
    const startupProblemTextarea = document.getElementById('startup-problem');
    const startupSolutionTextarea = document.getElementById('startup-solution');
    const startupImageLogoInput = document.getElementById('startup-image-logo');
    const startupImage1Input = document.getElementById('startup-image-1');
    const startupImage2Input = document.getElementById('startup-image-2');
    const startupImage3Input = document.getElementById('startup-image-3');
    const startupImage4Input = document.getElementById('startup-image-4');
    const startupStartDateInput = document.getElementById('startup-start-date');
    const startupTeamSizeInput = document.getElementById('startup-team-size');
    const startupFounderNameInput = document.getElementById('startup-founder-name');
    const startupFounderRoleInput = document.getElementById('startup-founder-role');
    const startupFounderEmailInput = document.getElementById('startup-founder-email');
    const startupFounderPhoneInput = document.getElementById('startup-founder-phone');
    const startupFounderAffiliationInput = document.getElementById('startup-founder-affiliation');
    const startupTagsInput = document.getElementById('startup-tags');
    const startupSdgsInput = document.getElementById('startup-sdgs');
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
            
            // --- MODIFIED: Add SDG tags and status badges ---
            const sdgTagsHTML = (startup.sdgs && Array.isArray(startup.sdgs))
                ? startup.sdgs.map(sdg => `<span class="tag tag-sdg">SDG ${sdg}</span>`).join('')
                : '';
            
            // Status-specific styling
            let statusClass = 'tag-status-' + startup.status;
            let statusText = startup.status;
            if (startup.status === 'pending') {
                statusClass = 'tag-status-pending';
                statusText = '⏳ Pending Review';
            } else if (startup.status === 'rejected') {
                statusClass = 'tag-status-rejected';
                statusText = '❌ Rejected';
            }
            
            const tagsHTML = `
                <span class="tag ${statusClass}">${statusText}</span>
                <span class="tag">${startup.category}</span>
                <span class="tag">TRL ${startup.trl}</span>
                ${startup.collab ? `<span class="tag tag-collab">Open for Collab</span>` : ''}
                ${startup.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                ${sdgTagsHTML}
            `;
            
            // Show approval buttons only for pending projects
            const approvalButtonsHTML = startup.status === 'pending' ? `
                <button class="icon-btn approve-btn" title="Approve"><i class="fa-solid fa-check"></i></button>
                <button class="icon-btn reject-btn" title="Reject"><i class="fa-solid fa-xmark"></i></button>
            ` : '';
            
            card.innerHTML = `
                <div class="startup-logo logo-${startup.category.toLowerCase()}">${startup.logo}</div>
                <div class="startup-details">
                    <h3>${startup.name}</h3>
                    <p>${startup.description}</p>
                    <div class="tags-container">${tagsHTML}</div>
                </div>
                <div class="startup-actions">
                    ${approvalButtonsHTML}
                    <button class="icon-btn edit-btn"><i class="fa-solid fa-pencil"></i></button>
                    <button class="icon-btn delete-btn"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            startupList.appendChild(card);
        });
        attachActionListeners();
    };

    const attachActionListeners = () => {
        document.querySelectorAll('.approve-btn').forEach(button => {
            button.addEventListener('click', e => {
                const id = parseInt(e.target.closest('.startup-card').dataset.id);
                approveStartup(id);
            });
        });
        document.querySelectorAll('.reject-btn').forEach(button => {
            button.addEventListener('click', e => {
                const id = parseInt(e.target.closest('.startup-card').dataset.id);
                rejectStartup(id);
            });
        });
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

    const approveStartup = (id) => {
        const startup = startupsData.find(s => s.id === id);
        if (!startup) return;
        
        if (confirm(`Approve "${startup.name}"? This will make it publicly visible.`)) {
            startup.status = 'active';
            saveData();
            renderStartups();
            console.log(`✅ Startup "${startup.name}" approved`);
        }
    };

    const rejectStartup = (id) => {
        const startup = startupsData.find(s => s.id === id);
        if (!startup) return;
        
        const reason = prompt(`Reject "${startup.name}"?\n\nOptionally provide a reason (will be logged):`);
        if (reason !== null) { // User clicked OK (even if empty)
            startup.status = 'rejected';
            startup.rejectionReason = reason || 'No reason provided';
            startup.rejectionDate = new Date().toISOString().split('T')[0];
            saveData();
            renderStartups();
            console.log(`❌ Startup "${startup.name}" rejected. Reason: ${startup.rejectionReason}`);
        }
    };

    const editStartup = (id) => {
        const startup = startupsData.find(s => s.id === id);
        if (!startup) return;
        editingStartupId = id;
        
        // Basic Info
        startupNameInput.value = startup.name || '';
        startupLogoInput.value = startup.logo || '🚀';
        startupCategorySelect.value = startup.category || startup.industry || 'Other';
        startupTypeInput.value = startup.type || '';
        startupTrlInput.value = startup.trl || 1;
        startupStatusSelect.value = startup.status || 'pending';
        startupWebsiteInput.value = startup.website || '';
        
        // College (array to comma-separated string)
        if (Array.isArray(startup.college)) {
            startupCollegeInput.value = startup.college.join(', ');
        } else {
            startupCollegeInput.value = startup.college || '';
        }
        
        // Descriptions
        startupDescriptionTextarea.value = startup.description || startup.shortDescription || '';
        startupDetailedDescriptionTextarea.value = startup.detailedDescription || '';
        startupProblemTextarea.value = startup.problemStatement || '';
        startupSolutionTextarea.value = startup.solution || '';
        
        // Images (5 separate fields)
        if (Array.isArray(startup.imageUrls) && startup.imageUrls.length > 0) {
            startupImageLogoInput.value = startup.imageUrls[0] || '';
            startupImage1Input.value = startup.imageUrls[1] || '';
            startupImage2Input.value = startup.imageUrls[2] || '';
            startupImage3Input.value = startup.imageUrls[3] || '';
            startupImage4Input.value = startup.imageUrls[4] || '';
        } else {
            startupImageLogoInput.value = '';
            startupImage1Input.value = '';
            startupImage2Input.value = '';
            startupImage3Input.value = '';
            startupImage4Input.value = '';
        }
        
        // Project Info
        startupStartDateInput.value = startup.startDate || '';
        startupTeamSizeInput.value = startup.teamSize || '';
        
        // Founder Info
        startupFounderNameInput.value = startup.founderName || '';
        startupFounderRoleInput.value = startup.founderRole || '';
        startupFounderEmailInput.value = startup.founderEmail || '';
        startupFounderPhoneInput.value = startup.founderPhone || '';
        startupFounderAffiliationInput.value = startup.founderAffiliation || '';
        
        // Tags
        if (Array.isArray(startup.tags)) {
            startupTagsInput.value = startup.tags.join(', ');
        } else {
            startupTagsInput.value = '';
        }
        
        // SDGs
        if (startup.sdgs && Array.isArray(startup.sdgs)) {
            startupSdgsInput.value = startup.sdgs.join(', ');
        } else {
            startupSdgsInput.value = '';
        }
        
        // Collaboration
        startupCollabCheckbox.checked = startup.collab || false;
        
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
        
        // Process SDGs from text input to array
        const sdgString = startupSdgsInput.value || '';
        const sdgs = sdgString
            .split(',')
            .map(s => parseInt(s.trim()))
            .filter(n => !isNaN(n) && n >= 1 && n <= 17);
        
        // Process college from comma-separated to array
        const collegeString = startupCollegeInput.value || '';
        const collegeArray = collegeString
            .split(',')
            .map(c => c.trim())
            .filter(Boolean);
        
        // Process image URLs into array
        const imageUrls = [
            startupImageLogoInput.value,
            startupImage1Input.value,
            startupImage2Input.value,
            startupImage3Input.value,
            startupImage4Input.value
        ].filter(url => url && url.trim() !== '');
        
        const formData = {
            name: startupNameInput.value,
            title: startupNameInput.value, // For compatibility
            logo: startupLogoInput.value || '🚀',
            category: startupCategorySelect.value,
            industry: startupCategorySelect.value, // Alias
            type: startupTypeInput.value || '',
            trl: parseInt(startupTrlInput.value),
            status: startupStatusSelect.value,
            website: startupWebsiteInput.value || '',
            college: collegeArray,
            description: startupDescriptionTextarea.value,
            shortDescription: startupDescriptionTextarea.value, // Alias
            detailedDescription: startupDetailedDescriptionTextarea.value || '',
            problemStatement: startupProblemTextarea.value || '',
            solution: startupSolutionTextarea.value || '',
            imageUrls: imageUrls,
            startDate: startupStartDateInput.value || '',
            teamSize: startupTeamSizeInput.value || '',
            founderName: startupFounderNameInput.value || '',
            founderRole: startupFounderRoleInput.value || '',
            founderEmail: startupFounderEmailInput.value || '',
            founderPhone: startupFounderPhoneInput.value || '',
            founderAffiliation: startupFounderAffiliationInput.value || '',
            tags: startupTagsInput.value.split(',').map(tag => tag.trim()).filter(Boolean),
            collab: startupCollabCheckbox.checked,
            sdgs: sdgs
        };
        
        if (editingStartupId !== null) {
            const index = startupsData.findIndex(item => item.id === editingStartupId);
            if (index !== -1) {
                // Preserve existing data like createdAt, features, etc.
                startupsData[index] = { ...startupsData[index], ...formData };
            }
        } else {
            formData.id = startupsData.length > 0 ? Math.max(...startupsData.map(item => item.id)) + 1 : 1;
            formData.createdAt = new Date().toISOString().split('T')[0];
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