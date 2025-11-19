document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ Submit project script loaded");
    console.log("✅ CloudinaryUploader loaded:", typeof CloudinaryUploader !== 'undefined');
    
    // --- Global vars ---
    let uploadedImageUrls = ["", "", "", "", ""]; 
    let uploadingImages = [false, false, false, false, false]; 

    // --- 1. Authentication Check ---
    auth.onAuthStateChanged(function(user) {
        if (user) {
            const loggedInUser = user.displayName || user.email;
            updateHeader(user, loggedInUser);
            createRandomCircles();
            initializeImageUploaders();
            
            // Initialize custom dropdowns
            initializeCustomDropdown('college-dropdown-btn', 'college-checkbox-list', 'college-selected-pills', 'college-validation');
            initializeCustomDropdown('sdg-dropdown-btn', 'sdg-checkbox-list', 'sdg-selected-pills', 'sdg-validation'); // Added SDG
            
            initializeCharCounter();
            initializeFormSubmit(loggedInUser);
            initializeCancelButton();
        } else {
            alert("You must be signed in to submit a project.");
            window.location.href = 'index.html';
        }
    });

    function updateHeader(user, loggedInUser) {
        const userDisplayPill = document.getElementById('user-display');
        const signOutButton = document.getElementById('signout-btn-main');
        if (userDisplayPill) userDisplayPill.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> ${loggedInUser.split('@')[0]}`;
        if (signOutButton) signOutButton.addEventListener('click', (e) => { e.preventDefault(); auth.signOut().then(() => { alert("Signed out."); window.location.href = 'index.html'; }); });
        const founderEmailInput = document.getElementById('founder-email');
        if (founderEmailInput && user.email) { founderEmailInput.value = user.email; founderEmailInput.readOnly = true; }
        const founderFirstNameInput = document.getElementById('founder-first-name');
        const founderLastNameInput = document.getElementById('founder-last-name');
        if (founderFirstNameInput && founderLastNameInput && user.displayName) {
            const names = user.displayName.split(' ');
            founderFirstNameInput.value = names[0];
            founderLastNameInput.value = names.slice(1).join(' ');
        }
    }

    function createRandomCircles() { /* ... (circles logic unchanged) ... */ }

    // --- 4. REUSABLE Multi-Select Dropdown Logic ---
    function initializeCustomDropdown(btnId, listId, pillsId, validationId) {
        const dropdownBtn = document.getElementById(btnId);
        const checkboxList = document.getElementById(listId);
        const pillsContainer = document.getElementById(pillsId);
        const defaultText = document.querySelector(`#${btnId} .dropdown-button-text`);
        const validationInput = document.getElementById(validationId);

        if (!dropdownBtn || !checkboxList || !pillsContainer) return;

        const checkboxes = checkboxList.querySelectorAll('input[type="checkbox"]');

        function updatePills() {
            pillsContainer.innerHTML = '';
            let hasSelection = false;
            checkboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    hasSelection = true;
                    const pill = document.createElement('span');
                    pill.className = 'pill';
                    pill.textContent = checkbox.value;
                    const removeBtn = document.createElement('span');
                    removeBtn.className = 'pill-remove';
                    removeBtn.innerHTML = '&times;';
                    removeBtn.onclick = (e) => {
                        e.stopPropagation();
                        checkbox.checked = false;
                        updatePills();
                    };
                    pill.appendChild(removeBtn);
                    pillsContainer.appendChild(pill);
                }
            });

            if (hasSelection) {
                defaultText.style.display = 'none';
                pillsContainer.style.display = 'flex';
                if (validationInput) validationInput.value = 'selected';
            } else {
                defaultText.style.display = 'block';
                pillsContainer.style.display = 'none';
                if (validationInput) validationInput.value = '';
            }
        }

        dropdownBtn.addEventListener('click', () => {
            checkboxList.classList.toggle('visible');
            dropdownBtn.classList.toggle('open');
        });

        window.addEventListener('click', (e) => {
            if (!dropdownBtn.contains(e.target) && !checkboxList.contains(e.target)) {
                checkboxList.classList.remove('visible');
                dropdownBtn.classList.remove('open');
            }
        });

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', updatePills);
        });
        
        checkboxList.querySelectorAll('.checkbox-list-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.type !== 'checkbox') {
                    const checkbox = item.querySelector('input[type="checkbox"]');
                    checkbox.checked = !checkbox.checked;
                    updatePills();
                }
            });
        });
    }
    
    function initializeCharCounter() {
        const shortDescTextarea = document.getElementById('short-description');
        const counterElement = document.getElementById('short-desc-counter');
        if (shortDescTextarea && counterElement) {
            const updateCounter = () => { counterElement.textContent = `${shortDescTextarea.value.length} / 100`; };
            shortDescTextarea.addEventListener('input', updateCounter);
            updateCounter();
        }
    }

    function initializeImageUploaders() {
        async function handleImageUpload(fileInput, previewElement, index) {
            const file = fileInput.files[0];
            const slot = previewElement.closest('.image-upload-slot');
            const removeBtn = slot ? slot.querySelector('.remove-image-btn') : null;
            if (!slot || !previewElement || !removeBtn) return;
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewElement.src = e.target.result;
                    previewElement.classList.add('visible');
                    removeBtn.style.display = 'block';
                }
                reader.readAsDataURL(file);
                uploadingImages[index] = true;
                try {
                    const imageUrl = await CloudinaryUploader.uploadImage(file, index);
                    uploadedImageUrls[index] = imageUrl;
                } catch (error) {
                    alert(`Error uploading image ${index + 1}: ${error.message}`);
                } finally {
                    uploadingImages[index] = false;
                }
            }
        }
        for (let i = 1; i <= 5; i++) {
            const input = document.getElementById(`image-upload-${i}`);
            const preview = document.getElementById(`image-preview-${i}`);
            if (input && preview) {
                (function(currentIndex) {
                    input.addEventListener('change', () => handleImageUpload(input, preview, currentIndex - 1));
                })(i);
            }
        }
        const imageGrid = document.querySelector('.image-upload-grid');
        if (imageGrid) {
            imageGrid.addEventListener('click', function(event) {
                if (event.target.classList.contains('remove-image-btn')) {
                    const button = event.target;
                    const index = parseInt(button.dataset.index, 10);
                    const slot = button.closest('.image-upload-slot');
                    const preview = slot ? slot.querySelector('.image-preview') : null;
                    const fileInput = slot ? slot.querySelector('.hidden-file-input') : null;
                    if (isNaN(index) || !slot || !preview || !fileInput) return;
                    uploadedImageUrls[index] = "";
                    preview.src = "";
                    preview.classList.remove('visible');
                    fileInput.value = "";
                    button.style.display = 'none';
                }
            });
        }
    }

    // --- 7. FORM SUBMISSION HANDLING (Updated for Multi-Select) ---
    function initializeFormSubmit(loggedInUser) {
        const submitForm = document.querySelector('.submit-form');
        if (submitForm) {
            submitForm.addEventListener('submit', async function(event) {
                event.preventDefault();

                if (uploadingImages.some(status => status === true)) {
                    alert('Please wait for all images to finish uploading before submitting.');
                    return;
                }

                const finalImageUrls = uploadedImageUrls.filter(url => url !== "");
                const projectNameValue = document.getElementById('project-name')?.value || 'Project';
                if (finalImageUrls.length === 0) {
                    finalImageUrls.push(`https://via.placeholder.com/500x350.png?text=${projectNameValue.replace(/ /g, '+')}`);
                }
                
                // Collect College Values
                const selectedColleges = Array.from(document.querySelectorAll('#college-checkbox-list input[type="checkbox"]:checked')).map(cb => cb.value);
                if (selectedColleges.length === 0) { alert("Please select at least one college."); return; }

                // Collect SDG Values
                const selectedSdgs = Array.from(document.querySelectorAll('#sdg-checkbox-list input[type="checkbox"]:checked')).map(cb => cb.value);

                const founderFirstName = document.getElementById('founder-first-name')?.value;
                const founderLastName = document.getElementById('founder-last-name')?.value;
                const founderFullName = `${founderFirstName} ${founderLastName}`;

                const newProject = {
                    name: projectNameValue,
                    title: projectNameValue,
                    type: document.getElementById('project-type')?.value || 'N/A',
                    industry: document.getElementById('industry')?.value || 'N/A',
                    category: document.getElementById('industry')?.value || 'N/A',
                    college: selectedColleges,
                    trl: document.getElementById('trl-level')?.value || 'TRL ?',
                    sdgs: selectedSdgs,
                    shortDescription: document.getElementById('short-description')?.value || '',
                    description: document.getElementById('short-description')?.value || '',
                    detailedDescription: document.getElementById('detailed-description')?.value || '',
                    problemStatement: document.getElementById('problem-statement')?.value || '',
                    solution: document.getElementById('solution')?.value || '',
                    features: [
                        { title: document.getElementById('feature1-title')?.value, description: document.getElementById('feature1-desc')?.value },
                        { title: document.getElementById('feature2-title')?.value, description: document.getElementById('feature2-desc')?.value },
                        { title: document.getElementById('feature3-title')?.value, description: document.getElementById('feature3-desc')?.value },
                        { title: document.getElementById('feature4-title')?.value, description: document.getElementById('feature4-desc')?.value },
                    ].filter(f => f.title && f.description),
                    imageUrls: finalImageUrls,
                    startDate: document.getElementById('start-date')?.value || 'N/A',
                    teamSize: document.getElementById('team-size')?.value || 'N/A',
                    founderName: founderFullName,
                    founderRole: document.getElementById('founder-role')?.value,
                    founderAffiliation: document.getElementById('founder-affiliation')?.value,
                    founderEmail: document.getElementById('founder-email')?.value,
                    founderPhone: document.getElementById('founder-phone')?.value || '',
                    views: 0,
                    inquiries: 0,
                    userId: loggedInUser,
                    status: 'pending',
                    createdAt: firebase.firestore.Timestamp.now(),
                    updatedAt: firebase.firestore.Timestamp.now(),
                    logo: '🚀',
                    tags: [],
                    collab: false
                };

                try {
                    console.log('💾 Saving project to Firestore...');
                    const docRef = await db.collection('startups').add(newProject);
                    console.log('✅ Project saved with ID:', docRef.id);

                    try { if (window.opener && !window.opener.closed && window.opener.location) window.opener.location.reload(); } catch (e) {}

                    const formElement = document.querySelector('.submit-form');
                    const successContainer = document.getElementById('success-message');
                    if (formElement && successContainer) {
                        formElement.style.display = 'none';
                        document.querySelector('.submit-project-main h1').style.display = 'none';
                        document.querySelector('.submit-project-main .page-subtitle').style.display = 'none';
                        document.querySelector('.submit-project-main .back-link').style.display = 'none';
                        
                        document.getElementById('success-title').textContent = 'Project Submitted!';
                        document.getElementById('success-text').textContent = `Your project "${newProject.title}" has been submitted for admin approval.`;
                        document.getElementById('success-link-home').href = 'index.html';
                        document.getElementById('success-link-project').style.display = 'none'; 
                        successContainer.style.display = 'block';
                        document.getElementById('success-close-btn').addEventListener('click', () => window.close());
                    } else {
                        alert("Project submitted for approval!");
                        window.close();
                    }
                } catch (error) {
                    console.error("❌ Error saving project:", error);
                    alert("Error saving project: " + error.message);
                }
            });
        }
    }

    function initializeCancelButton() {
        const cancelButton = document.querySelector('.btn-cancel');
        if(cancelButton) {
            cancelButton.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm("Are you sure you want to cancel?")) window.close();
            });
        }
    }

});