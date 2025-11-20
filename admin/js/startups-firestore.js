document.addEventListener('DOMContentLoaded', async () => {
    // Firestore collections
    const STARTUPS_COLLECTION = 'startups';
    
    let startupsData = [];
    let currentEditingId = null;

    // --- DOM Elements ---
    const startupList = document.querySelector('.startup-list');
    const addStartupBtn = document.getElementById('add-startup-btn');
    const searchInput = document.getElementById('search-input');
    const filterBtns = document.querySelectorAll('.category-filters .filter-btn');
    const sortDropdown = document.getElementById('sort-startups');

    // --- Firestore Functions ---
    const loadStartupsFromFirestore = async () => {
        try {
            const snapshot = await db.collection(STARTUPS_COLLECTION).get();
            
            startupsData = [];
            snapshot.forEach(doc => {
                startupsData.push({
                    firestoreId: doc.id,
                    ...doc.data()
                });
            });
            
            return startupsData;
        } catch (error) {
            console.error('❌ Error loading startups:', error);
            alert('Error loading startups from database');
            return [];
        }
    };

    const saveStartupToFirestore = async (startupData) => {
        try {
            
            // Add timestamp
            startupData.createdAt = startupData.createdAt || firebase.firestore.Timestamp.now();
            startupData.updatedAt = firebase.firestore.Timestamp.now();
            
            const docRef = await db.collection(STARTUPS_COLLECTION).add(startupData);
            return docRef.id;
        } catch (error) {
            console.error('❌ Error saving startup:', error);
            throw error;
        }
    };

    const updateStartupInFirestore = async (firestoreId, updatedData) => {
        try {

            
            // Add update timestamp
            updatedData.updatedAt = firebase.firestore.Timestamp.now();
            
            await db.collection(STARTUPS_COLLECTION).doc(firestoreId).update(updatedData);
        } catch (error) {
            console.error('❌ Error updating startup:', error);
            throw error;
        }
    };

    const deleteStartupFromFirestore = async (firestoreId) => {
        try {
            await db.collection(STARTUPS_COLLECTION).doc(firestoreId).delete();
        } catch (error) {
            console.error('❌ Error deleting startup:', error);
            throw error;
        }
    };

    // --- Render Function ---
    const renderStartups = async () => {
        const searchTerm = searchInput.value.toLowerCase();
        const activeFilter = document.querySelector('.category-filters .filter-btn.active').dataset.filter;
        
        let filteredData = startupsData.filter(startup => {
            const matchesCategory = activeFilter === 'all' || startup.category === activeFilter;
            const matchesSearch = (startup.name && startup.name.toLowerCase().includes(searchTerm)) ||
                                  (startup.description && startup.description.toLowerCase().includes(searchTerm));
            return matchesCategory && matchesSearch;
        });

        // Sorting
        const sortValue = sortDropdown.value;
        if (sortValue === 'recent') {
            filteredData.sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                return dateB - dateA;
            });
        } else if (sortValue === 'oldest') {
            filteredData.sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                return dateA - dateB;
            });
        } else if (sortValue === 'a-z') {
            filteredData.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        } else if (sortValue === 'z-a') {
            filteredData.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        }

        startupList.innerHTML = '';
        if (filteredData.length === 0) {
            startupList.innerHTML = `<p style="text-align: center; color: var(--text-light);">No startups found.</p>`;
            return;
        }

        filteredData.forEach(startup => {
            const card = document.createElement('div');
            card.className = 'startup-card';
            card.dataset.firestoreId = startup.firestoreId;
            
            const sdgTagsHTML = (startup.sdgs && Array.isArray(startup.sdgs))
                ? startup.sdgs.map(sdg => `<span class="tag tag-sdg">${sdg}</span>`).join('')
                : '';
            
            // Determine Status Badge Style
            let statusClass = 'tag-status-' + (startup.status || 'pending');
            let statusText = startup.status || 'pending';
            
            if (startup.status === 'pending') {
                statusClass = 'tag-status-pending';
                statusText = '⏳ Pending Review';
            } else if (startup.status === 'rejected') {
                statusClass = 'tag-status-rejected';
                statusText = '❌ Rejected';
            } else if (startup.status === 'active') {
                statusClass = 'tag-status-active';
                statusText = '✅ Active';
            } else if (startup.status === 'graduated') {
                statusClass = 'tag-status-graduated';
                statusText = '🎓 Graduated';
            }

            // Only show Approve/Reject buttons for Pending items
            const approvalButtonsHTML = startup.status === 'pending' ? `
                <button class="icon-btn approve-btn" title="Approve & Publish"><i class="fa-solid fa-check"></i></button>
                <button class="icon-btn reject-btn" title="Reject"><i class="fa-solid fa-xmark"></i></button>
            ` : '';

            // Safe tag rendering
            const tagsArray = Array.isArray(startup.tags) ? startup.tags : [];
            
            const tagsHTML = `
                <span class="tag ${statusClass}">${statusText}</span>
                <span class="tag">${startup.category || 'Uncategorized'}</span>
                <span class="tag">TRL ${startup.trl || '?'}</span>
                ${startup.collab ? `<span class="tag tag-collab">Open for Collab</span>` : ''}
                ${tagsHTMLFromList(tagsArray)}
                ${sdgTagsHTML}
            `;
            
            // Generate a safe class for the logo background
            const logoClass = `logo-${(startup.category || 'other').toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

            card.innerHTML = `
                <div class="startup-logo ${logoClass}">${startup.logo || '🚀'}</div>
                <div class="startup-details">
                    <h3>${startup.name || 'Unnamed Startup'}</h3>
                    <p>${startup.description || 'No description provided.'}</p>
                    <div class="tags-container">${tagsHTML}</div>
                </div>
                <div class="startup-actions">
                    ${approvalButtonsHTML}
                    <button class="icon-btn edit-btn" title="Edit Startup"><i class="fa-solid fa-pencil"></i></button>
                    <button class="icon-btn delete-btn" title="Delete"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            startupList.appendChild(card);
        });
        
        attachActionListeners();
    };

    function tagsHTMLFromList(tags) {
        return tags.map(tag => `<span class="tag">${tag}</span>`).join('');
    }

    // --- Action Listeners ---
    const attachActionListeners = () => {
        document.querySelectorAll('.approve-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const firestoreId = e.target.closest('.startup-card').dataset.firestoreId;
                await approveStartup(firestoreId);
            });
        });
        
        document.querySelectorAll('.reject-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const firestoreId = e.target.closest('.startup-card').dataset.firestoreId;
                await rejectStartup(firestoreId);
            });
        });
        
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const firestoreId = e.target.closest('.startup-card').dataset.firestoreId;
                openViewEditModal(firestoreId);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const firestoreId = e.target.closest('.startup-card').dataset.firestoreId;
                await deleteStartup(firestoreId);
            });
        });
        
        // Make entire card clickable to view
        document.querySelectorAll('.startup-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.startup-actions')) {
                    const firestoreId = card.dataset.firestoreId;
                    openViewEditModal(firestoreId);
                }
            });
            card.style.cursor = 'pointer';
        });
    };

    // --- Actions ---
    const approveStartup = async (firestoreId) => {
        if (!confirm("Approve this project? It will become visible on the public website.")) return;
        
        try {
            await updateStartupInFirestore(firestoreId, { status: 'active' });
            await loadStartupsFromFirestore();
            await renderStartups();
            alert('Startup approved and published!');
        } catch (error) {
            alert('Error approving startup: ' + error.message);
        }
    };

    const rejectStartup = async (firestoreId) => {
        if (!confirm("Reject this project? Status will be changed to rejected.")) return;

        try {
            await updateStartupInFirestore(firestoreId, { status: 'rejected' });
            await loadStartupsFromFirestore();
            await renderStartups();
            alert('Startup rejected');
        } catch (error) {
            alert('Error rejecting startup: ' + error.message);
        }
    };

    const deleteStartup = async (firestoreId) => {
        if (!confirm('Are you sure you want to permanently delete this startup?')) return;

        try {
            await deleteStartupFromFirestore(firestoreId);
            await loadStartupsFromFirestore();
            await renderStartups();
            alert('Startup deleted successfully');
        } catch (error) {
            alert('Error deleting startup: ' + error.message);
        }
    };

    // --- View/Edit Modal Functions ---
    const openViewEditModal = (firestoreId) => {
        currentEditingId = firestoreId;
        
        const startup = startupsData.find(s => s.firestoreId === firestoreId);
        
        if (!startup) {
            console.error('❌ Startup not found');
            alert('Startup not found');
            return;
        }


        // Populate form
        document.getElementById('edit-name').value = startup.name || '';
        document.getElementById('edit-logo').value = startup.logo || '🚀';
        document.getElementById('edit-category').value = startup.category || '';
        document.getElementById('edit-trl').value = startup.trl || '';
        document.getElementById('edit-status').value = startup.status || 'pending';
        document.getElementById('edit-collab').checked = startup.collab || false;
        document.getElementById('edit-description').value = startup.description || '';
        document.getElementById('edit-detailed-description').value = startup.detailedDescription || '';
        document.getElementById('edit-problem-statement').value = startup.problemStatement || '';
        document.getElementById('edit-solution').value = startup.solution || '';
        document.getElementById('edit-start-date').value = startup.startDate || '';
        document.getElementById('edit-team-size').value = startup.teamSize || '';
        document.getElementById('edit-website').value = startup.website || '';
        document.getElementById('edit-founder-name').value = startup.founderName || '';
        document.getElementById('edit-founder-role').value = startup.founderRole || '';
        document.getElementById('edit-founder-email').value = startup.founderEmail || '';
        document.getElementById('edit-founder-phone').value = startup.founderPhone || '';
        document.getElementById('edit-founder-affiliation').value = startup.founderAffiliation || '';

        // Populate SDGs
        const sdgCheckboxes = document.querySelectorAll('#edit-sdgs-container input[type="checkbox"]');
        sdgCheckboxes.forEach(cb => cb.checked = false);
        if (startup.sdgs && Array.isArray(startup.sdgs)) {
            startup.sdgs.forEach(sdg => {
                const checkbox = document.querySelector(`#edit-sdgs-container input[value="${sdg}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }

        // Display images
        const imagesPreview = document.getElementById('edit-images-preview');
        imagesPreview.innerHTML = '';
        if (startup.imageUrls && Array.isArray(startup.imageUrls) && startup.imageUrls.length > 0) {
            startup.imageUrls.forEach((url, index) => {
                if (url) {
                    const imgDiv = document.createElement('div');
                    imgDiv.className = 'preview-image-item';
                    imgDiv.innerHTML = `
                        <img src="${url}" alt="Project image ${index + 1}">
                        <div class="preview-image-label">${index === 0 ? 'Cover Image' : `Image ${index + 1}`}</div>
                    `;
                    imagesPreview.appendChild(imgDiv);
                }
            });
        } else {
            imagesPreview.innerHTML = '<p style="color: var(--text-light); padding: 20px; text-align: center;">No images uploaded</p>';
        }

        // Show modal
        const modal = document.getElementById('startup-modal-overlay');
        if (modal) {
            modal.style.display = 'flex';
            document.getElementById('modal-title').textContent = `Edit Startup: ${startup.name}`;
        }
    };

    const closeModal = () => {
        const modal = document.getElementById('startup-modal-overlay');
        if (modal) {
            modal.style.display = 'none';
        }
        currentEditingId = null;
    };

    const saveStartupChanges = async (e) => {
        e.preventDefault();

        if (!currentEditingId) return;

        // Collect form data
        const updatedData = {
            name: document.getElementById('edit-name').value,
            logo: document.getElementById('edit-logo').value || '🚀',
            category: document.getElementById('edit-category').value,
            trl: parseInt(document.getElementById('edit-trl').value) || 0,
            status: document.getElementById('edit-status').value,
            collab: document.getElementById('edit-collab').checked,
            description: document.getElementById('edit-description').value,
            detailedDescription: document.getElementById('edit-detailed-description').value,
            problemStatement: document.getElementById('edit-problem-statement').value,
            solution: document.getElementById('edit-solution').value,
            startDate: document.getElementById('edit-start-date').value,
            teamSize: document.getElementById('edit-team-size').value,
            website: document.getElementById('edit-website').value,
            founderName: document.getElementById('edit-founder-name').value,
            founderRole: document.getElementById('edit-founder-role').value,
            founderEmail: document.getElementById('edit-founder-email').value,
            founderPhone: document.getElementById('edit-founder-phone').value,
            founderAffiliation: document.getElementById('edit-founder-affiliation').value,
        };

        // Collect SDGs
        const selectedSdgs = Array.from(document.querySelectorAll('#edit-sdgs-container input[type="checkbox"]:checked'))
            .map(cb => cb.value);
        updatedData.sdgs = selectedSdgs;

        try {
            await updateStartupInFirestore(currentEditingId, updatedData);
            closeModal();
            await loadStartupsFromFirestore();
            await renderStartups();
            alert('Startup updated successfully!');
        } catch (error) {
            alert('Error updating startup: ' + error.message);
        }
    };

    // --- Initialize Modal Event Listeners ---
    const initializeModalListeners = () => {
        const closeBtn = document.getElementById('close-modal-btn');
        const cancelBtn = document.getElementById('cancel-edit-btn');
        const form = document.getElementById('startup-form');
        const overlay = document.getElementById('startup-modal-overlay');

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
        if (form) form.addEventListener('submit', saveStartupChanges);
        
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target.id === 'startup-modal-overlay') closeModal();
            });
        }
    };

    // --- Add Startup Button ---
    addStartupBtn.addEventListener('click', () => {
        window.open('../ucolab/submit-project.html', '_blank');
    });

    // --- Search & Filter ---
    searchInput.addEventListener('input', renderStartups);
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderStartups();
        });
    });
    sortDropdown.addEventListener('change', renderStartups);

    // --- Initialize Everything ---
    initializeModalListeners();
    await loadStartupsFromFirestore();
    await renderStartups();
    
});
