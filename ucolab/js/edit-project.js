document.addEventListener('DOMContentLoaded', function() {
    console.log("Edit project script loaded.");

    // --- 1. Get DOM elements ---
    const form = document.querySelector('.submit-form');
    const projectName = document.getElementById('project-name');
    const projectType = document.getElementById('project-type');
    const industry = document.getElementById('industry');
    const trlLevel = document.getElementById('trl-level');
    const projectSdg = document.getElementById('project-sdg');
    const shortDescription = document.getElementById('short-description');
    const shortDescCounter = document.getElementById('short-desc-counter'); 
    const detailedDescription = document.getElementById('detailed-description');
    const problemStatement = document.getElementById('problem-statement');
    const solution = document.getElementById('solution');
    const feature1Title = document.getElementById('feature1-title');
    const feature1Desc = document.getElementById('feature1-desc');
    const feature2Title = document.getElementById('feature2-title');
    const feature2Desc = document.getElementById('feature2-desc');
    const feature3Title = document.getElementById('feature3-title');
    const feature3Desc = document.getElementById('feature3-desc');
    const feature4Title = document.getElementById('feature4-title');
    const feature4Desc = document.getElementById('feature4-desc');
    const startDate = document.getElementById('start-date');
    const teamSize = document.getElementById('team-size');
    const founderFirstName = document.getElementById('founder-first-name'); 
    const founderLastName = document.getElementById('founder-last-name'); 
    const founderRole = document.getElementById('founder-role');
    const founderAffiliation = document.getElementById('founder-affiliation');
    const founderEmail = document.getElementById('founder-email');
    const founderPhone = document.getElementById('founder-phone');
    const userDisplayPill = document.getElementById('user-display');
    const signOutButton = document.getElementById('signout-btn');
    const cancelEditButton = document.getElementById('cancel-edit-btn');
    const backToHomeLink = document.getElementById('back-to-home');

    // --- Global Vars ---
    let imageBase64Array = ["", "", "", "", ""];
    let allProjects = [];
    let projectToEdit = null;
    let projectIndex = -1;
    let sourceList = ''; // NEW: Tracks if project is in 'ucolabProjects' or 'pendingProjects'

    // --- 2. Authentication Check (Firebase) ---
    auth.onAuthStateChanged(async function(user) {
        if (user) {
            const loggedInUser = user.displayName || user.email;
            console.log("User is logged in:", loggedInUser);

            if (userDisplayPill) {
                userDisplayPill.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    ${loggedInUser.split('@')[0]}
                `;
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
            
            // --- Check Admin Status ---
            let isAdmin = false;
            try {
                const userDocRef = db.collection('Registered Accounts').doc(user.uid);
                const docSnap = await userDocRef.get();
                if (docSnap.exists) {
                    isAdmin = docSnap.data().isAdmin === true;
                }
            } catch (e) {
                console.error("Error checking admin status:", e);
            }

            // --- Load and Populate Form ---
            loadAndPopulateData(loggedInUser, isAdmin);

            // --- Initialize Page Functions ---
            initializeImageUploaders();
            initializeCollegeDropdown();
            initializeCharCounter(); 
            initializeFormSubmit(loggedInUser);
            setupActionButtons();
            createRandomCircles();

        } else {
            console.log("User is not logged in. Redirecting.");
            alert("You must be signed in to edit a project.");
            window.location.href = 'index.html';
        }
    });

    // --- 5. Load and Populate Form (UPDATED) ---
    function loadAndPopulateData(loggedInUser, isAdmin) {
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');

        if (!projectId) {
            alert("No project ID specified. Cannot edit.");
            window.location.href = 'index.html';
            return;
        }

        try {
            // 1. Try searching Active Projects
            const activeProjects = JSON.parse(localStorage.getItem('ucolabProjects') || '[]');
            let foundIndex = activeProjects.findIndex(p => String(p.id) === String(projectId));
            
            if (foundIndex !== -1) {
                allProjects = activeProjects;
                projectIndex = foundIndex;
                projectToEdit = activeProjects[foundIndex];
                sourceList = 'ucolabProjects';
            } else {
                // 2. If not found, try Searching Pending Projects
                const pendingProjects = JSON.parse(localStorage.getItem('pendingProjects') || '[]');
                foundIndex = pendingProjects.findIndex(p => String(p.id) === String(projectId));
                
                if (foundIndex !== -1) {
                    allProjects = pendingProjects;
                    projectIndex = foundIndex;
                    projectToEdit = pendingProjects[foundIndex];
                    sourceList = 'pendingProjects';
                }
            }

            if (!projectToEdit || projectIndex === -1) {
                alert("Project not found in Active or Pending lists.");
                window.location.href = 'index.html';
                return;
            }

            // --- PERMISSION CHECK ---
            const userIsDemo = (loggedInUser === 'Demo User' || loggedInUser.includes('demo'));
            const projectIsDefault = (projectToEdit.userId === 'default');
            const userIsOwner = (projectToEdit.userId === loggedInUser);
            
            // Allow if: Owner OR (Demo & Default) OR Admin
            if (!userIsOwner && !(userIsDemo && projectIsDefault) && !isAdmin) {
                 alert("You do not have permission to edit this project.");
                 window.location.href = 'index.html';
                 return;
            }

            console.log(`Loading data from ${sourceList} for project:`, projectToEdit);

            // Populate all text/select fields
            if(projectName) projectName.value = projectToEdit.title || '';
            if(projectType) projectType.value = projectToEdit.type || '';
            if(industry) industry.value = projectToEdit.industry || '';
            if(trlLevel) trlLevel.value = projectToEdit.trl || '';
            if(projectSdg) projectSdg.value = projectToEdit.sdg || 'N/A';
            
            if(shortDescription) shortDescription.value = projectToEdit.shortDescription || '';
            if(shortDescCounter) shortDescCounter.textContent = `${(projectToEdit.shortDescription || '').length} / 100`;
            
            if (Array.isArray(projectToEdit.college)) {
                projectToEdit.college.forEach(collegeName => {
                    const checkbox = document.querySelector(`input[name="college-option"][value="${collegeName}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                });
                initializeCollegeDropdown(); 
            }
            
            if(detailedDescription) detailedDescription.value = projectToEdit.detailedDescription || '';
            if(problemStatement) problemStatement.value = projectToEdit.problemStatement || '';
            if(solution) solution.value = projectToEdit.solution || '';
            if(startDate) startDate.value = projectToEdit.startDate || '';
            if(teamSize) teamSize.value = projectToEdit.teamSize || '';
            
            if (founderFirstName && founderLastName && projectToEdit.founderName) {
                const names = projectToEdit.founderName.split(' ');
                const firstName = names[0];
                const lastName = names.slice(1).join(' ');
                if(founderFirstName) founderFirstName.value = firstName;
                if(founderLastName) founderLastName.value = lastName;
            }

            if(founderRole) founderRole.value = projectToEdit.founderRole || '';
            if(founderAffiliation) founderAffiliation.value = projectToEdit.founderAffiliation || '';
            
            if(founderEmail) {
                founderEmail.value = projectToEdit.founderEmail || '';
                founderEmail.readOnly = true; 
            }

            if(founderPhone) founderPhone.value = projectToEdit.founderPhone || '';

            if (projectToEdit.features && Array.isArray(projectToEdit.features)) {
                if (projectToEdit.features[0] && feature1Title && feature1Desc) { feature1Title.value = projectToEdit.features[0].title; feature1Desc.value = projectToEdit.features[0].description; }
                if (projectToEdit.features[1] && feature2Title && feature2Desc) { feature2Title.value = projectToEdit.features[1].title; feature2Desc.value = projectToEdit.features[1].description; }
                if (projectToEdit.features[2] && feature3Title && feature3Desc) { feature3Title.value = projectToEdit.features[2].title; feature3Desc.value = projectToEdit.features[2].description; }
                if (projectToEdit.features[3] && feature4Title && feature4Desc) { feature4Title.value = projectToEdit.features[3].title; feature4Desc.value = projectToEdit.features[3].description; }
            }

            const imageUrlsToLoad = Array.isArray(projectToEdit.imageUrls) ? projectToEdit.imageUrls : [];
            for (let i = 0; i < 5; i++) {
                const slot = document.querySelector(`#image-upload-${i + 1}`)?.closest('.image-upload-slot');
                if (slot) {
                    const preview = slot.querySelector('.image-preview');
                    const removeBtn = slot.querySelector('.remove-image-btn');
                    if (imageUrlsToLoad[i] && preview && removeBtn) {
                        preview.src = imageUrlsToLoad[i];
                        preview.classList.add('visible');
                        imageBase64Array[i] = imageUrlsToLoad[i];
                        removeBtn.style.display = 'block';
                    } else if (preview && removeBtn) {
                        preview.src = "";
                        preview.classList.remove('visible');
                        removeBtn.style.display = 'none';
                    }
                }
            }
        } catch (error) {
            console.error("Error loading or parsing data:", error);
            alert("An error occurred. Returning to homepage.");
            window.location.href = 'index.html';
        }
    }

    // --- 6. Image File Handling ---
    function initializeImageUploaders() {
        function handleImageUpload(fileInput, previewElement, index) {
            const file = fileInput.files[0];
            const slot = previewElement.closest('.image-upload-slot');
            const removeBtn = slot ? slot.querySelector('.remove-image-btn') : null;
            if (!slot || !previewElement || !removeBtn) return;

            if (file) {
                if (file.size > 2 * 1024 * 1024) { // 2MB limit
                    alert(`Image in Slot ${index + 1} is too large! Please select an image under 2MB.`);
                    fileInput.value = "";
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
    
    // --- 7. Character Counter Logic ---
    function initializeCharCounter() {
        const shortDescTextarea = document.getElementById('short-description');
        const counterElement = document.getElementById('short-desc-counter');

        if (shortDescTextarea && counterElement) {
            const updateCounter = () => {
                const currentLength = shortDescTextarea.value.length;
                counterElement.textContent = `${currentLength} / 100`;
            };
            shortDescTextarea.addEventListener('input', updateCounter);
        }
    }

    // --- 8. Handle Form Submission (Update) ---
    function initializeFormSubmit(loggedInUser) {
        if (form) {
            form.addEventListener('submit', function(event) {
                event.preventDefault();
                if (projectIndex === -1 || !sourceList) { alert("Error: Project data not loaded."); return; }

                const finalImageUrls = imageBase64Array.filter(url => url && url.trim() !== "");
                const projectNameValue = projectName?.value || 'Project';
                if (finalImageUrls.length === 0) {
                    finalImageUrls.push(`https://via.placeholder.com/500x350.png?text=${projectNameValue.replace(/ /g, '+')}`);
                }

                const selectedColleges = Array.from(document.querySelectorAll('input[name="college-option"]:checked'))
                                              .map(cb => cb.value);
                
                if (selectedColleges.length === 0) {
                    alert("Please select at least one college.");
                    return;
                }

                const founderFirstNameValue = document.getElementById('founder-first-name')?.value;
                const founderLastNameValue = document.getElementById('founder-last-name')?.value;
                const founderFullName = `${founderFirstNameValue} ${founderLastNameValue}`;
                
                const updatedProject = {
                    ...projectToEdit,
                    title: projectNameValue,
                    type: projectType?.value || projectToEdit.type,
                    industry: industry?.value || projectToEdit.industry,
                    college: selectedColleges,
                    trl: trlLevel?.value || projectToEdit.trl,
                    sdg: projectSdg?.value || 'N/A',
                    shortDescription: shortDescription?.value || projectToEdit.shortDescription,
                    detailedDescription: detailedDescription?.value || projectToEdit.detailedDescription,
                    problemStatement: problemStatement?.value || projectToEdit.problemStatement,
                    solution: solution?.value || projectToEdit.solution,
                    features: [
                        { title: feature1Title?.value, description: feature1Desc?.value },
                        { title: feature2Title?.value, description: feature2Desc?.value },
                        { title: feature3Title?.value, description: feature3Desc?.value },
                        { title: feature4Title?.value, description: feature4Desc?.value },
                    ].filter(f => f.title && f.description),
                    imageUrls: finalImageUrls,
                    startDate: startDate?.value || projectToEdit.startDate,
                    teamSize: teamSize?.value || projectToEdit.teamSize,
                    founderName: founderFullName, 
                    founderRole: founderRole?.value || projectToEdit.founderRole,
                    founderAffiliation: founderAffiliation?.value || projectToEdit.founderAffiliation,
                    founderEmail: founderEmail?.value || projectToEdit.founderEmail,
                    founderPhone: founderPhone?.value || projectToEdit.founderPhone,
                };

                try {
                    // Update the list it came from (active or pending)
                    allProjects[projectIndex] = updatedProject;
                    localStorage.setItem(sourceList, JSON.stringify(allProjects));
                    console.log(`Project updated in ${sourceList}:`, updatedProject);

                    try {
                        if (window.opener && !window.opener.closed) {
                            // Reload the admin dashboard or main page
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

                    if (formElement && successContainer) {
                        formElement.style.display = 'none';
                        if(pageTitle) pageTitle.style.display = 'none';
                        if(pageSubtitle) pageSubtitle.style.display = 'none';
                        if(backLink) backLink.style.display = 'none';
                        
                        successTitle.textContent = 'Project Updated!';
                        successText.textContent = `Your project "${updatedProject.title}" has been successfully updated.`;
                        successLinkHome.href = 'index.html';
                        successLinkProject.href = `project-detail.html?id=${updatedProject.id}`;
                        successContainer.style.display = 'block';
                        successCloseBtn.addEventListener('click', () => window.close());
                    } else {
                        alert("Project updated successfully!");
                        window.close();
                    }
                } catch (error) {
                    console.error("Error updating project in localStorage:", error);
                    if (error.name === 'QuotaExceededError') {
                        alert("Error: Could not save. Storage is full. Reduce image sizes.");
                    } else {
                        alert("An error occurred while saving your changes.");
                    }
                }
            });
        }
    }

    // --- 9. Handle Cancel / Back Buttons ---
    function setupActionButtons() {
        if (cancelEditButton) {
            cancelEditButton.addEventListener('click', () => {
                if (confirm("Are you sure you want to cancel? Any unsaved changes will be lost.")) {
                    window.close();
                }
            });
        }
        if (backToHomeLink) {
            backToHomeLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm("Are you sure you want to go back? Any unsaved changes will be lost.")) {
                    window.close();
                }
            });
        }
    }

    // --- 10. DYNAMIC BACKGROUND CIRCLES ---
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

    // --- 11. College Dropdown ---
    function initializeCollegeDropdown() {
        const dropdownBtn = document.getElementById('college-dropdown-btn');
        const checkboxList = document.getElementById('college-checkbox-list');
        const pillsContainer = document.getElementById('college-selected-pills');
        const defaultText = document.querySelector('#college-dropdown-btn .dropdown-button-text');
        const validationInput = document.getElementById('college-validation');

        if (!dropdownBtn || !checkboxList) return;

        const checkboxes = checkboxList.querySelectorAll('input[type="checkbox"]');

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
                        e.stopPropagation();
                        checkbox.checked = false;
                        updateCollegePills();
                    };
                    pill.appendChild(removeBtn);
                    pillsContainer.appendChild(pill);
                }
            });

            if (hasSelection) {
                defaultText.style.display = 'none';
                pillsContainer.style.display = 'flex';
                validationInput.value = 'selected';
            } else {
                defaultText.style.display = 'block';
                pillsContainer.style.display = 'none';
                validationInput.value = '';
            }
        }
        
        updateCollegePills(); 

        dropdownBtn.addEventListener('click', () => {
            checkboxList.classList.toggle('visible');
            dropdownBtn.classList.toggle('open');
        });

        window.addEventListener('click', (e) => {
            if (!document.getElementById('college-multi-select').contains(e.target)) {
                checkboxList.classList.remove('visible');
                dropdownBtn.classList.remove('open');
            }
        });

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', updateCollegePills);
        });
        
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

}); // End DOMContentLoaded