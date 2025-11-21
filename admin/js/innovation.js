/**
 * Innovation Applications Management
 * Manages incubation program applications with Firestore
 */
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const applicationsContainer = document.getElementById('applications-container');
    const searchInput = document.getElementById('search-input');
    const statusFilters = document.getElementById('status-filters');
    const sortSelect = document.getElementById('sort-select');
    const detailsModal = document.getElementById('details-modal');
    const confirmModal = document.getElementById('confirm-modal');
    
    // Stats counters
    const totalApplicationsEl = document.getElementById('total-applications');
    const pendingCountEl = document.getElementById('pending-count');
    const approvedCountEl = document.getElementById('approved-count');
    const rejectedCountEl = document.getElementById('rejected-count');
    
    // State
    let applications = [];
    let currentApplicationId = null;
    let currentAction = null;
    
    // Initialize
    loadApplications();
    setupEventListeners();
    
    /**
     * Load applications from Firestore
     */
    function loadApplications() {
        showLoading();
        
        db.collection('incubation_applications').onSnapshot((snapshot) => {
            applications = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                // Normalize status to lowercase
                let status = (data.status || 'pending').toLowerCase();
                
                applications.push({
                    id: doc.id,
                    ...data,
                    status: status
                });
            });
            
            updateStats();
            renderApplications();
        }, (error) => {
            showError('Failed to load applications: ' + error.message);
        });
    }
    
    /**
     * Update statistics counters
     */
    function updateStats() {
        const total = applications.length;
        const pending = applications.filter(app => {
            const status = (app.status || 'pending').toLowerCase();
            return status === 'pending';
        }).length;
        const approved = applications.filter(app => {
            const status = (app.status || 'pending').toLowerCase();
            return status === 'approved' || status === 'approve';
        }).length;
        const rejected = applications.filter(app => {
            const status = (app.status || 'pending').toLowerCase();
            return status === 'rejected' || status === 'reject';
        }).length;
        
        totalApplicationsEl.textContent = total;
        pendingCountEl.textContent = pending;
        approvedCountEl.textContent = approved;
        rejectedCountEl.textContent = rejected;
    }
    
    /**
     * Render applications list
     */
    function renderApplications() {
        const searchTerm = searchInput.value.toLowerCase();
        const activeFilterBtn = document.querySelector('.filter-btn.active');
        const activeStatus = activeFilterBtn ? activeFilterBtn.dataset.status : 'all';
        const sortValue = sortSelect.value;
        
        // Filter applications
        let filtered = applications.filter(app => {
            // Normalize status to lowercase
            const appStatus = (app.status || 'pending').toLowerCase();
            
            // Search filter
            const matchesSearch = 
                (app.fullName || '').toLowerCase().includes(searchTerm) ||
                (app.email || '').toLowerCase().includes(searchTerm) ||
                (app.startupName || '').toLowerCase().includes(searchTerm);
            
            // Status filter - handle both 'approved'/'approve' and 'rejected'/'reject'
            let matchesStatus = false;
            if (activeStatus === 'all') {
                matchesStatus = true;
            } else if (activeStatus === 'pending') {
                matchesStatus = appStatus === 'pending';
            } else if (activeStatus === 'approved') {
                matchesStatus = appStatus === 'approved' || appStatus === 'approve';
            } else if (activeStatus === 'rejected') {
                matchesStatus = appStatus === 'rejected' || appStatus === 'reject';
            }
            
            return matchesSearch && matchesStatus;
        });
        
        // Sort applications
        filtered.sort((a, b) => {
            switch (sortValue) {
                case 'recent':
                    return (b.submittedAt?.toDate() || new Date()) - (a.submittedAt?.toDate() || new Date());
                case 'oldest':
                    return (a.submittedAt?.toDate() || new Date()) - (b.submittedAt?.toDate() || new Date());
                case 'name-asc':
                    return (a.fullName || '').localeCompare(b.fullName || '');
                case 'name-desc':
                    return (b.fullName || '').localeCompare(a.fullName || '');
                default:
                    return 0;
            }
        });
        
        // Render
        if (filtered.length === 0) {
            showEmptyState();
        } else {
            applicationsContainer.innerHTML = filtered.map(app => createApplicationCard(app)).join('');
            attachCardEventListeners();
        }
    }
    
    /**
     * Create application card HTML
     */
    function createApplicationCard(app) {
        const status = (app.status || 'pending').toLowerCase();
        const submittedAt = app.submittedAt?.toDate() || new Date();
        const formattedDate = submittedAt.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Normalize status for display
        let statusDisplay = '';
        let statusClass = '';
        if (status === 'approved' || status === 'approve') {
            statusDisplay = 'Approved';
            statusClass = 'approved';
        } else if (status === 'rejected' || status === 'reject') {
            statusDisplay = 'Rejected';
            statusClass = 'rejected';
        } else {
            statusDisplay = 'Pending';
            statusClass = 'pending';
        }
        
        return `
            <div class="application-card" data-id="${app.id}">
                <div class="card-header">
                    <div class="card-title-section">
                        <h3 class="card-title">${app.fullName || 'N/A'}</h3>
                        <p class="card-subtitle">${app.email || 'N/A'}</p>
                        <div class="card-startup-name">
                            <i class="fas fa-rocket"></i>
                            ${app.startupName || 'No startup name'}
                        </div>
                    </div>
                    <div class="card-status-section">
                        <span class="status-badge ${statusClass}">${statusDisplay}</span>
                        <span class="card-date">${formattedDate}</span>
                    </div>
                </div>
                
                <div class="card-body">
                    <div class="card-info-grid">
                        <div class="info-item">
                            <span class="info-label">Phone</span>
                            <span class="info-value">${app.phone || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Department</span>
                            <span class="info-value">${app.deptCollege || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Industry</span>
                            <span class="info-value">${app.industry || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Team Size</span>
                            <span class="info-value">${app.teamSize || 'N/A'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="card-footer">
                    <div class="card-actions">
                        <button class="action-btn btn-view" data-id="${app.id}">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                    </div>
                    <div class="card-actions">
                        ${statusClass !== 'approved' ? `
                            <button class="action-btn btn-approve" data-id="${app.id}" data-action="approve">
                                <i class="fas fa-check"></i> Approve
                            </button>
                        ` : ''}
                        ${statusClass !== 'rejected' ? `
                            <button class="action-btn btn-reject" data-id="${app.id}" data-action="reject">
                                <i class="fas fa-times"></i> Reject
                            </button>
                        ` : ''}
                        <button class="action-btn btn-delete" data-id="${app.id}" data-action="delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Attach event listeners to cards
     */
    function attachCardEventListeners() {
        // View details buttons
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                showApplicationDetails(id);
            });
        });
        
        // Quick action buttons
        document.querySelectorAll('.btn-approve, .btn-reject, .btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                const action = e.currentTarget.dataset.action;
                confirmAction(id, action);
            });
        });
    }
    
    /**
     * Show application details in modal
     */
    function showApplicationDetails(id) {
        const app = applications.find(a => a.id === id);
        if (!app) return;
        
        currentApplicationId = id;
        
        // Personal Information
        document.getElementById('detail-fullName').textContent = app.fullName || 'N/A';
        document.getElementById('detail-email').textContent = app.email || 'N/A';
        document.getElementById('detail-phone').textContent = app.phone || 'N/A';
        document.getElementById('detail-studentId').textContent = app.studentId || 'N/A';
        document.getElementById('detail-deptCollege').textContent = app.deptCollege || 'N/A';
        document.getElementById('detail-yearLevel').textContent = app.yearLevel ? `${app.yearLevel} Year` : 'N/A';
        
        // Startup Information
        document.getElementById('detail-startupName').textContent = app.startupName || 'N/A';
        document.getElementById('detail-industry').textContent = app.industry || 'N/A';
        document.getElementById('detail-developmentStage').textContent = app.developmentStage || 'N/A';
        document.getElementById('detail-problemStatement').textContent = app.problemStatement || 'N/A';
        document.getElementById('detail-solution').textContent = app.solution || 'N/A';
        document.getElementById('detail-targetMarket').textContent = app.targetMarket || 'N/A';
        
        const websiteEl = document.getElementById('detail-websiteSocial');
        if (app.websiteSocial) {
            websiteEl.innerHTML = `<a href="${app.websiteSocial}" target="_blank" style="color: var(--secondary-color);">${app.websiteSocial}</a>`;
        } else {
            websiteEl.textContent = 'N/A';
        }
        
        // Team Information
        document.getElementById('detail-teamSize').textContent = app.teamSize || 'N/A';
        document.getElementById('detail-coFounders').textContent = app.coFounders || 'N/A';
        document.getElementById('detail-teamExperience').textContent = app.teamExperience || 'N/A';
        
        // Program Expectations
        const supportNeededEl = document.getElementById('detail-supportNeeded');
        if (app.supportNeeded && app.supportNeeded.length > 0) {
            supportNeededEl.innerHTML = app.supportNeeded.map(support => 
                `<span class="tag">${support}</span>`
            ).join('');
        } else {
            supportNeededEl.textContent = 'N/A';
        }
        
        document.getElementById('detail-goals').textContent = app.goals || 'N/A';
        
        // Submission Info
        document.getElementById('detail-applicationId').textContent = id;
        const submittedAt = app.submittedAt?.toDate() || new Date();
        document.getElementById('detail-submittedAt').textContent = submittedAt.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        
        const status = (app.status || 'pending').toLowerCase();
        const statusEl = document.getElementById('detail-status');
        
        // Normalize status for display
        let statusDisplay = '';
        let statusClass = '';
        if (status === 'approved' || status === 'approve') {
            statusDisplay = 'Approved';
            statusClass = 'approved';
        } else if (status === 'rejected' || status === 'reject') {
            statusDisplay = 'Rejected';
            statusClass = 'rejected';
        } else {
            statusDisplay = 'Pending';
            statusClass = 'pending';
        }
        
        statusEl.textContent = statusDisplay;
        statusEl.className = `status-badge ${statusClass}`;
        
        // Show modal
        detailsModal.classList.add('active');
    }
    
    /**
     * Confirm action before executing
     */
    function confirmAction(id, action) {
        currentApplicationId = id;
        currentAction = action;
        
        const messages = {
            approve: 'Are you sure you want to approve this application?',
            reject: 'Are you sure you want to reject this application?',
            pending: 'Set this application back to pending status?',
            delete: 'Are you sure you want to delete this application? This action cannot be undone.'
        };
        
        const titles = {
            approve: 'Approve Application',
            reject: 'Reject Application',
            pending: 'Set Pending',
            delete: 'Delete Application'
        };
        
        document.getElementById('confirm-title').textContent = titles[action];
        document.getElementById('confirm-message').textContent = messages[action];
        
        confirmModal.classList.add('active');
    }
    
    /**
     * Execute confirmed action
     */
    function executeAction() {
        if (!currentApplicationId || !currentAction) return;
        
        if (currentAction === 'delete') {
            deleteApplication(currentApplicationId);
        } else {
            updateApplicationStatus(currentApplicationId, currentAction);
        }
        
        confirmModal.classList.remove('active');
        detailsModal.classList.remove('active');
        currentApplicationId = null;
        currentAction = null;
    }
    
    /**
     * Update application status
     */
    function updateApplicationStatus(id, status) {
        // Normalize status to lowercase
        const normalizedStatus = status.toLowerCase();
        
        // Get the application data before updating
        const app = applications.find(a => a.id === id);
        
        // Show loading or disable buttons while updating
        db.collection('incubation_applications').doc(id).update({
            status: normalizedStatus,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            const statusText = normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);
            showSuccess(`Application ${statusText} successfully`);
            
            // Update local applications array immediately for instant UI update
            const appIndex = applications.findIndex(app => app.id === id);
            if (appIndex !== -1) {
                applications[appIndex].status = normalizedStatus;
            }
            
            // Force re-render
            updateStats();
            renderApplications();
            
            // If approved, open Gmail to send notification email
            if (normalizedStatus === 'approve' || normalizedStatus === 'approved') {
                if (app && app.email) {
                    sendApprovalEmail(app);
                }
            }
        }).catch((error) => {
            showError('Failed to update status: ' + error.message);
        });
    }
    
    /**
     * Open Gmail to send approval email
     */
    function sendApprovalEmail(app) {
        const recipientEmail = app.email;
        const applicantName = app.fullName || 'Applicant';
        const startupName = app.startupName || 'your startup';
        
        // Email template
        const subject = encodeURIComponent(`Congratulations! Your Innovation Program Application has been Approved`);
        const body = encodeURIComponent(
`Dear ${applicantName},

Congratulations! We are pleased to inform you that your application for the UC InTTO Innovation Program has been APPROVED.

Application Details:
- Startup Name: ${startupName}
- Application ID: ${app.id || 'N/A'}
- Date Applied: ${app.submittedAt ? app.submittedAt.toDate().toLocaleDateString() : 'N/A'}

Next Steps:
1. We will contact you shortly to discuss the onboarding process
2. Please prepare any additional documentation that may be required
3. Join our orientation session (details to follow)

If you have any questions or need immediate assistance, please don't hesitate to reach out to us.

We look forward to working with you and supporting your innovation journey!

Best regards,
UC InTTO Team
University of Cebu - Innovation, Technology Transfer Office`
        );
        
        // Open Gmail compose with pre-filled content
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipientEmail}&su=${subject}&body=${body}`;
        
        // Open in new tab
        window.open(gmailUrl, '_blank');
    }
    
    /**
     * Delete application
     */
    function deleteApplication(id) {
        db.collection('incubation_applications').doc(id).delete()
        .then(() => {
            showSuccess('Application deleted successfully');
            // Re-render to update the UI immediately
            renderApplications();
        }).catch((error) => {
            showError('Failed to delete application: ' + error.message);
        });
    }
    
    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        // Search
        searchInput.addEventListener('input', renderApplications);
        
        // Status filters
        statusFilters.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                renderApplications();
            }
        });
        
        // Sort
        sortSelect.addEventListener('change', renderApplications);
        
        // Modal actions from details modal
        document.getElementById('approve-btn').addEventListener('click', () => {
            confirmAction(currentApplicationId, 'approve');
        });
        
        document.getElementById('pending-btn').addEventListener('click', () => {
            confirmAction(currentApplicationId, 'pending');
        });
        
        document.getElementById('reject-btn').addEventListener('click', () => {
            confirmAction(currentApplicationId, 'reject');
        });
        
        document.getElementById('delete-btn').addEventListener('click', () => {
            confirmAction(currentApplicationId, 'delete');
        });
        
        // Close modals
        document.getElementById('close-details-modal').addEventListener('click', () => {
            detailsModal.classList.remove('active');
        });
        
        document.getElementById('close-confirm-modal').addEventListener('click', () => {
            confirmModal.classList.remove('active');
        });
        
        // Confirm modal buttons
        document.getElementById('cancel-confirm').addEventListener('click', () => {
            confirmModal.classList.remove('active');
        });
        
        document.getElementById('proceed-confirm').addEventListener('click', executeAction);
        
        // Close modal on overlay click
        detailsModal.addEventListener('click', (e) => {
            if (e.target === detailsModal) {
                detailsModal.classList.remove('active');
            }
        });
        
        confirmModal.addEventListener('click', (e) => {
            if (e.target === confirmModal) {
                confirmModal.classList.remove('active');
            }
        });
    }
    
    /**
     * Show loading state
     */
    function showLoading() {
        applicationsContainer.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading applications...</p>
            </div>
        `;
    }
    
    /**
     * Show empty state
     */
    function showEmptyState() {
        applicationsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>No Applications Found</h3>
                <p>No applications match your current filters</p>
            </div>
        `;
    }
    
    /**
     * Show success message
     */
    function showSuccess(message) {
        // You can implement a toast notification here
        alert(message);
    }
    
    /**
     * Show error message
     */
    function showError(message) {
        // You can implement a toast notification here
        alert(message);
    }
});
