document.addEventListener('DOMContentLoaded', function() {
    console.log("Submit project script loaded.");

    // --- Global var for multi-select ---
    let imageBase64Array = ["", "", "", "", ""]; // Array to hold 5 image strings

    // --- 1. Authentication Check (Firebase) ---
    auth.onAuthStateChanged(function(user) {
        if (user) {
            // --- USER IS LOGGED IN ---
            const loggedInUser = user.displayName || user.email;
            console.log("User is logged in:", loggedInUser);
            
            // --- 2. Update Header User Info ---
            updateHeader(user, loggedInUser);
            
            // --- 3. Initialize Page Functions ---
            createRandomCircles();
            initializeImageUploaders();
            initializeCollegeDropdown(); // <-- NEW
            initializeFormSubmit(loggedInUser);
            initializeCancelButton();

        } else {
            // --- USER IS LOGGED OUT ---
            console.log("User is not logged in. Redirecting.");
            alert("You must be signed in to submit a project.");
            window.location.href = 'index.html';
        }
    });

    // --- 2. Update Header Function ---
    function updateHeader(user, loggedInUser) {
        const userDisplayPill = document.getElementById('user-display');
        const signOutButton = document.getElementById('signout-btn');
        if (userDisplayPill) {
            userDisplayPill.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                ${loggedInUser.split('@')[0]}
            `;
            const founderEmailInput = document.getElementById('founder-email');
            if (founderEmailInput && user.email) {
                founderEmailInput.value = user.email;
            }
            const founderNameInput = document.getElementById('founder-name');
            if(founderNameInput && user.displayName) {
                founderNameInput.value = user.displayName;
            }
        }
        if (signOutButton) {
            signOutButton.addEventListener('click', (e) => {
                e.preventDefault();
                auth.signOut().then(() => {
                    alert("You have been signed out.");
                    window.location.href = 'index.html';
                });
            });
        }
    }

    // --- 3. DYNAMIC BACKGROUND CIRCLES ---
    function createRandomCircles() {
         const body = document.body; if (!body) return;
         const circleCount = Math.floor(Math.random() * 6) + 5;
         const colors = ['#B9F8CF', '#cff8b9', '#b9eef8', '#f8b9d4', '#f8e0b9'];
         for (let i = 0; i < circleCount; i++) {
             const circle = document.createElement('div'); circle.classList.add('blur-circle');
             const size = Math.floor(Math.random() * 401) + 200;
             circle.style.width = `${size}px`; circle.style.height = `${size}px`;
             circle.style.top = `${Math.random() * 140 - 20}vh`; circle.style.left = `${Math.random() * 140 - 20}vw`;
             circle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
             circle.style.filter = `blur(${Math.floor(Math.random() * 101) + 100}px)`;
             circle.style.opacity = Math.random() * 0.4 + 0.3;
             body.prepend(circle);
         }
    }

    // --- 4. NEW: College Multi-Select Dropdown Logic ---
    function initializeCollegeDropdown() {
        const dropdownBtn = document.getElementById('college-dropdown-btn');
        const checkboxList = document.getElementById('college-checkbox-list');
        const pillsContainer = document.getElementById('college-selected-pills');
        const defaultText = document.querySelector('#college-dropdown-btn .dropdown-button-text');
        const validationInput = document.getElementById('college-validation');

        if (!dropdownBtn || !checkboxList || !pillsContainer || !defaultText || !validationInput) {
            console.error("College dropdown elements not found!");
            return;
        }

        const checkboxes = checkboxList.querySelectorAll('input[type="checkbox"]');

        // Function to update the pills and validation
        function updateCollegePills() {
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
                        e.stopPropagation(); // Prevent dropdown from closing
                        checkbox.checked = false;
                        updateCollegePills();
                    };
                    pill.appendChild(removeBtn);
                    pillsContainer.appendChild(pill);
                }
            });

            // Update placeholder text
            if (hasSelection) {
                defaultText.style.display = 'none';
                pillsContainer.style.display = 'flex';
                validationInput.value = 'selected'; // Mark as valid
            } else {
                defaultText.style.display = 'block';
                pillsContainer.style.display = 'none';
                validationInput.value = ''; // Mark as invalid
            }
        }

        // Toggle dropdown list
        dropdownBtn.addEventListener('click', () => {
            checkboxList.classList.toggle('visible');
            dropdownBtn.classList.toggle('open');
        });

        // Close dropdown when clicking outside
        window.addEventListener('click', (e) => {
            if (!document.getElementById('college-multi-select').contains(e.target)) {
                checkboxList.classList.remove('visible');
                dropdownBtn.classList.remove('open');
            }
        });

        // Update pills when a checkbox is changed
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', updateCollegePills);
        });
        
        // Ensure list items also toggle checkbox
        checkboxList.querySelectorAll('.checkbox-list-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.type !== 'checkbox') {
                    const checkbox = item.querySelector('input[type="checkbox"]');
                    checkbox.checked = !checkbox.checked;
                    updateCollegePills();
                }
            });
        });
    }

    // --- 5. Multi-Image File Handling ---
    function initializeImageUploaders() {
        function handleImageUpload(fileInput, previewElement, index) {
            const file = fileInput.files[0];
            const slot = previewElement.closest('.image-upload-slot');
            const removeBtn = slot ? slot.querySelector('.remove-image-btn') : null;
            if (!slot || !previewElement || !removeBtn) {
                console.error(`handleImageUpload: Could not find elements for slot ${index}`);
                return;
            }
            if (file) {
                if (file.size > 2 * 1024 * 1024) { // 2MB limit
                    alert(`Image in Slot ${index + 1} is too large! Max 2MB.`);
                    fileInput.value = "";
                    previewElement.src = "";
                    previewElement.classList.remove('visible');
                    imageBase64Array[index] = "";
                    removeBtn.style.display = 'none';
                    return;
                }
                const reader = new FileReader();
                reader.onload = function(e) {
                    const base64String = e.target.result;
                    previewElement.src = base64String;
                    previewElement.classList.add('visible');
                    imageBase64Array[index] = base64String;
                    removeBtn.style.display = 'block';
                }
                reader.readAsDataURL(file);
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
                    
                    imageBase64Array[index] = "";
                    preview.src = "";
                    preview.classList.remove('visible');
                    fileInput.value = "";
                    button.style.display = 'none';
                }
            });
        }
    }

    // --- 6. FORM SUBMISSION HANDLING (Updated) ---
    function initializeFormSubmit(loggedInUser) {
        const submitForm = document.querySelector('.submit-form');
        if (submitForm) {
            submitForm.addEventListener('submit', function(event) {
                event.preventDefault();

                const finalImageUrls = imageBase64Array.filter(url => url !== "");
                const projectNameValue = document.getElementById('project-name')?.value || 'Project';
                if (finalImageUrls.length === 0) {
                    finalImageUrls.push(`https://via.placeholder.com/500x350.png?text=${projectNameValue.replace(/ /g, '+')}`);
                }
                
                // --- MODIFICATION: Read selected colleges ---
                const selectedColleges = Array.from(document.querySelectorAll('input[name="college-option"]:checked'))
                                              .map(cb => cb.value);
                
                // Basic validation check
                if (selectedColleges.length === 0) {
                    alert("Please select at least one college.");
                    return; // Stop submission
                }
                // --- End Modification ---

                const newProject = {
                    id: Date.now(),
                    title: projectNameValue,
                    type: document.getElementById('project-type')?.value || 'N/A',
                    industry: document.getElementById('industry')?.value || 'N/A',
                    college: selectedColleges, // <-- SAVE AS ARRAY
                    trl: document.getElementById('trl-level')?.value || 'TRL ?',
                    shortDescription: document.getElementById('short-description')?.value || '',
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
                    founderName: document.getElementById('founder-name')?.value,
                    founderRole: document.getElementById('founder-role')?.value,
                    founderAffiliation: document.getElementById('founder-affiliation')?.value,
                    founderEmail: document.getElementById('founder-email')?.value,
                    founderPhone: document.getElementById('founder-phone')?.value || '',
                    views: 0,
                    inquiries: 0,
                    userId: loggedInUser
                };

                try {
                    // Save to pendingProjects
                    const existingProjects = JSON.parse(localStorage.getItem('pendingProjects') || '[]');
                    existingProjects.push(newProject);
                    localStorage.setItem('pendingProjects', JSON.stringify(existingProjects));
                    console.log("Project saved to pending list.");

                    // Reload opener tab
                    try {
                        if (window.opener && !window.opener.closed && window.opener.location) {
                            window.opener.location.reload();
                        }
                    } catch (openerError) {
                        console.warn("Could not reload opener tab:", openerError);
                    }

                    // Show success message
                    const formElement = document.querySelector('.submit-form');
                    const successContainer = document.getElementById('success-message');
                    const successTitle = document.getElementById('success-title');
                    const successText = document.getElementById('success-text');
                    const successLinkHome = document.getElementById('success-link-home');
                    const successLinkProject = document.getElementById('success-link-project');
                    const successCloseBtn = document.getElementById('success-close-btn');
                    const pageTitle = document.querySelector('.submit-project-main h1');
                    const pageSubtitle = document.querySelector('.submit-project-main .page-subtitle');
                    const backLink = document.querySelector('.submit-project-main .back-link');

                    if (formElement && successContainer && successTitle && successText) {
                        formElement.style.display = 'none';
                        pageTitle.style.display = 'none';
                        pageSubtitle.style.display = 'none';
                        backLink.style.display = 'none';
                        successTitle.textContent = 'Project Submitted!';
                        // --- MODIFIED Success Text ---
                        successText.textContent = `Your project "${newProject.title}" has been submitted for admin approval.`;
                        successLinkHome.href = 'index.html';
                        // Hide the "View Project" button as it's not public yet
                        successLinkProject.style.display = 'none'; 
                        successContainer.style.display = 'block';
                        successCloseBtn.addEventListener('click', () => window.close());
                    } else {
                        alert("Project submitted for approval!");
                        window.close();
                    }
                } catch (error) {
                    console.error("Error saving project to localStorage:", error);
                    if (error.name === 'QuotaExceededError') {
                        alert("Error: Could not save project. Storage is full. This is likely due to large images (max ~5MB total). Please reduce image sizes or remove some.");
                    } else {
                        alert("There was an error saving your project.");
                    }
                }
            });
        }
    }

    // --- 7. Cancel Button Logic ---
    function initializeCancelButton() {
        const cancelButton = document.querySelector('.btn-cancel');
        if(cancelButton) {
            cancelButton.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm("Are you sure you want to cancel? Any unsaved changes will be lost.")) {
                    window.close();
                }
            });
        }
    }

}); // End DOMContentLoaded