document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'ucInttoTeamData';

    // Default data if nothing is in localStorage
    const defaultTeamMembers = [
        { id: 1, fullName: "Dr. Maria Santos", position: "Director", email: "maria.santos@uc.edu.ph", avatar: "👩‍🎓", displayOrder: 1, roleDescription: "Overall leadership and strategic direction for the InTTO." },
        { id: 2, fullName: "John dela Cruz", position: "TBI Coordinator", email: "john.delacruz@uc.edu.ph", avatar: "🧑‍💻", displayOrder: 2, roleDescription: "Manages startup incubation programs, mentorship, and operations." },
        { id: 3, fullName: "Sarah Bautista", position: "KTTO Manager", email: "sarah.bautista@uc.edu.ph", avatar: "👩‍💼", displayOrder: 3, roleDescription: "Handles IP protection and tech transfer activities, including patent filings." },
        { id: 4, fullName: "Engr. Pedro Reyes", position: "Innovation Specialist", email: "pedro.reyes@uc.edu.ph", avatar: "👷", displayOrder: 4, roleDescription: "Provides technical expertise and support for innovation projects and research." }
    ];

    // --- Load/Save Data ---
    const loadData = () => {
        const savedData = localStorage.getItem(STORAGE_KEY);
        return savedData ? JSON.parse(savedData) : defaultTeamMembers;
    };

    const saveData = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(teamData));
    };

    let teamData = loadData();
    let editingMemberId = null;

    // --- DOM Elements ---
    const teamGrid = document.getElementById('team-grid');
    const searchInput = document.getElementById('search-input');
    const addMemberBtn = document.getElementById('add-member-btn');

    // Modal elements
    const teamMemberModalOverlay = document.getElementById('team-member-modal-overlay');
    const closeTeamMemberModalBtn = document.getElementById('close-team-member-modal-btn');
    const cancelMemberBtn = document.getElementById('cancel-member-btn');
    const teamMemberForm = document.getElementById('team-member-form');
    const teamMemberModalTitle = document.getElementById('team-member-modal-title');
    const teamMemberModalSubtitle = document.getElementById('team-member-modal-subtitle');
    const submitMemberBtn = document.getElementById('submit-member-btn');

    // Form input elements
    const memberFullNameInput = document.getElementById('member-full-name');
    const memberPositionInput = document.getElementById('member-position');
    const memberEmailInput = document.getElementById('member-email');
    const memberAvatarInput = document.getElementById('member-avatar');
    const memberDisplayOrderInput = document.getElementById('member-display-order');
    const memberRoleDescriptionTextarea = document.getElementById('member-role-description');

    // --- Render Team Members ---
    const renderTeamMembers = () => {
        const searchTerm = searchInput.value.toLowerCase();

        const filteredData = teamData.filter(member => {
            return member.fullName.toLowerCase().includes(searchTerm) ||
                   member.position.toLowerCase().includes(searchTerm) ||
                   member.email.toLowerCase().includes(searchTerm) ||
                   member.roleDescription.toLowerCase().includes(searchTerm);
        }).sort((a, b) => a.displayOrder - b.displayOrder); // Sort by display order

        teamGrid.innerHTML = '';
        if (filteredData.length === 0) {
            teamGrid.innerHTML = '<p style="text-align: center; color: var(--text-light); margin-top: 30px;">No team members found.</p>';
            return;
        }

        filteredData.forEach(member => {
            const card = document.createElement('div');
            card.className = 'team-member-card';
            card.dataset.id = member.id;

            // Determine if avatar is an emoji or a Font Awesome icon class
            let avatarContent;
            if (member.avatar && member.avatar.length === 1 || /\p{Emoji}/u.test(member.avatar)) { // Simple check for single emoji or general emoji property
                avatarContent = member.avatar;
            } else {
                avatarContent = `<i class="${member.avatar}"></i>`; // Assume it's a FA class
            }

            card.innerHTML = `
                <div class="avatar">${avatarContent}</div>
                <h3>${member.fullName}</h3>
                <p class="position">${member.position}</p>
                <p class="description">${member.roleDescription}</p>
                <a href="mailto:${member.email}" class="contact-email"><i class="fa-solid fa-envelope"></i> ${member.email}</a>
                <div class="card-actions">
                    <button class="action-btn edit-btn" title="Edit"><i class="fa-solid fa-pencil"></i> Edit</button>
                    <button class="action-btn remove-btn" title="Remove"><i class="fa-solid fa-trash-can"></i> Remove</button>
                </div>
            `;
            teamGrid.appendChild(card);
        });
        attachActionListeners();
    };

    // --- Attach Listeners to Dynamic Buttons ---
    const attachActionListeners = () => {
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', e => {
                const id = parseInt(e.target.closest('.team-member-card').dataset.id);
                editMember(id);
            });
        });
        document.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', e => {
                const id = parseInt(e.target.closest('.team-member-card').dataset.id);
                deleteMember(id);
            });
        });
    };

    // --- Modal Functions ---
    const openModal = () => teamMemberModalOverlay.classList.add('active');
    
    const closeModal = () => {
        teamMemberModalOverlay.classList.remove('active');
        teamMemberForm.reset();
        editingMemberId = null;
        memberDisplayOrderInput.value = teamData.length + 1; // Suggest next order
    };

    // --- CRUD Functions ---
    const editMember = (id) => {
        const member = teamData.find(m => m.id === id);
        if (!member) return;

        editingMemberId = id;

        memberFullNameInput.value = member.fullName;
        memberPositionInput.value = member.position;
        memberEmailInput.value = member.email;
        memberAvatarInput.value = member.avatar;
        memberDisplayOrderInput.value = member.displayOrder;
        memberRoleDescriptionTextarea.value = member.roleDescription;

        teamMemberModalTitle.textContent = 'Edit Team Member';
        teamMemberModalSubtitle.textContent = 'Update team member information';
        submitMemberBtn.textContent = 'Update Member';
        openModal();
    };

    const deleteMember = (id) => {
        if (confirm('Are you sure you want to remove this team member?')) {
            teamData = teamData.filter(member => member.id !== id);
            saveData();
            renderTeamMembers();
        }
    };

    // --- Event Listeners ---
    addMemberBtn.addEventListener('click', () => {
        editingMemberId = null;
        teamMemberForm.reset();
        memberDisplayOrderInput.value = teamData.length > 0 ? Math.max(...teamData.map(m => m.displayOrder)) + 1 : 1; // Suggest next display order
        teamMemberModalTitle.textContent = 'Add Team Member';
        teamMemberModalSubtitle.textContent = 'Add a new member to the InTTO team';
        submitMemberBtn.textContent = 'Add Member';
        openModal();
    });

    closeTeamMemberModalBtn.addEventListener('click', closeModal);
    cancelMemberBtn.addEventListener('click', closeModal);
    teamMemberModalOverlay.addEventListener('click', (e) => {
        if (e.target === teamMemberModalOverlay) closeModal();
    });

    teamMemberForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = {
            fullName: memberFullNameInput.value,
            position: memberPositionInput.value,
            email: memberEmailInput.value,
            avatar: memberAvatarInput.value,
            displayOrder: parseInt(memberDisplayOrderInput.value),
            roleDescription: memberRoleDescriptionTextarea.value,
        };

        if (editingMemberId !== null) {
            const index = teamData.findIndex(item => item.id === editingMemberId);
            if (index !== -1) {
                teamData[index] = { ...teamData[index], ...formData };
            }
        } else {
            formData.id = teamData.length > 0 ? Math.max(...teamData.map(item => item.id)) + 1 : 1;
            teamData.push(formData);
        }

        saveData();
        renderTeamMembers();
        closeModal();
    });

    searchInput.addEventListener('input', renderTeamMembers);

    // --- Initial Render ---
    renderTeamMembers();
});