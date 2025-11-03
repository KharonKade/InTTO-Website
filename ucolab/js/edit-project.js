document.addEventListener('DOMContentLoaded', function() {
    console.log("Edit project script loaded.");

    // --- 1. Authentication & URL Check ---
    const loggedInUser = localStorage.getItem('loggedInUser');
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');
    let allProjects = [];
    let projectToEdit = null;
    let projectIndex = -1;
    let imageBase64Array = ["", "", "", "", ""];

    // --- 2. Get DOM elements ---
    const form = document.querySelector('.submit-form');
    const projectName = document.getElementById('project-name');
    const projectType = document.getElementById('project-type');
    const industry = document.getElementById('industry');
    const college = document.getElementById('college');
    const trlLevel = document.getElementById('trl-level');
    const shortDescription = document.getElementById('short-description');
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
    const founderName = document.getElementById('founder-name');
    const founderRole = document.getElementById('founder-role');
    const founderAffiliation = document.getElementById('founder-affiliation');
    const founderEmail = document.getElementById('founder-email');
    const founderPhone = document.getElementById('founder-phone');
    const userDisplayPill = document.getElementById('user-display');
    const signOutButton = document.getElementById('signout-btn');
    const cancelEditButton = document.getElementById('cancel-edit-btn');
    const backToHomeLink = document.getElementById('back-to-home');

    // --- 3. Load and Populate Form ---
    function loadAndPopulateData() {
        if (!loggedInUser) {
            alert("You must be signed in to edit a project.");
            window.location.href = 'index.html';
            return;
        }

        if (userDisplayPill) {
             userDisplayPill.innerHTML = `
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                 ${loggedInUser}
             `;
        }

        if (!projectId) {
            alert("No project ID specified. Cannot edit.");
            window.location.href = 'index.html';
            return;
        }

        try {
            allProjects = JSON.parse(localStorage.getItem('ucolabProjects') || '[]');
            projectIndex = allProjects.findIndex(p => String(p.id) === String(projectId));
            projectToEdit = allProjects[projectIndex];

            if (!projectToEdit || projectIndex === -1) {
                alert("Project not found.");
                window.location.href = 'index.html';
                return;
            }

            // Correct permission check: Allow if user matches OR if it's Demo User editing a default project
             if (projectToEdit.userId !== loggedInUser && !(loggedInUser === 'Demo User' && projectToEdit.userId === 'default')) {
                alert("You do not have permission to edit this project.");
                window.location.href = 'index.html';
                return;
            }

            console.log("Loading data for project:", projectToEdit);

            // Populate all text fields (added safety checks for elements)
            if(projectName) projectName.value = projectToEdit.title || '';
            if(projectType) projectType.value = projectToEdit.type || '';
            if(industry) industry.value = projectToEdit.industry || '';
            if(college) college.value = projectToEdit.college || '';
            if(trlLevel) trlLevel.value = projectToEdit.trl || '';
            if(shortDescription) shortDescription.value = projectToEdit.shortDescription || '';
            if(detailedDescription) detailedDescription.value = projectToEdit.detailedDescription || '';
            if(problemStatement) problemStatement.value = projectToEdit.problemStatement || '';
            if(solution) solution.value = projectToEdit.solution || '';
            if(startDate) startDate.value = projectToEdit.startDate || '';
            if(teamSize) teamSize.value = projectToEdit.teamSize || '';
            if(founderName) founderName.value = projectToEdit.founderName || '';
            if(founderRole) founderRole.value = projectToEdit.founderRole || '';
            if(founderAffiliation) founderAffiliation.value = projectToEdit.founderAffiliation || '';
            if(founderEmail) founderEmail.value = projectToEdit.founderEmail || '';
            if(founderPhone) founderPhone.value = projectToEdit.founderPhone || '';

            if (projectToEdit.features && Array.isArray(projectToEdit.features)) {
                if (projectToEdit.features[0] && feature1Title && feature1Desc) { feature1Title.value = projectToEdit.features[0].title; feature1Desc.value = projectToEdit.features[0].description; }
                if (projectToEdit.features[1] && feature2Title && feature2Desc) { feature2Title.value = projectToEdit.features[1].title; feature2Desc.value = projectToEdit.features[1].description; }
                if (projectToEdit.features[2] && feature3Title && feature3Desc) { feature3Title.value = projectToEdit.features[2].title; feature3Desc.value = projectToEdit.features[2].description; }
                if (projectToEdit.features[3] && feature4Title && feature4Desc) { feature4Title.value = projectToEdit.features[3].title; feature4Desc.value = projectToEdit.features[3].description; }
            }

            // ** Load existing images into previews **
            // Ensure projectToEdit.imageUrls is an array before looping
            const imageUrlsToLoad = Array.isArray(projectToEdit.imageUrls) ? projectToEdit.imageUrls : [];
            for (let i = 0; i < 5; i++) {
                // Find elements for the current slot
                const slot = document.querySelector(`#image-upload-${i + 1}`)?.closest('.image-upload-slot');
                if (slot) {
                    const preview = slot.querySelector('.image-preview');
                    const removeBtn = slot.querySelector('.remove-image-btn');

                    if (imageUrlsToLoad[i] && preview && removeBtn) { // Check image URL exists AND elements exist
                        preview.src = imageUrlsToLoad[i];
                        preview.classList.add('visible');
                        imageBase64Array[i] = imageUrlsToLoad[i]; // Store image data in our working array
                        removeBtn.style.display = 'block'; // <<< SHOW remove button
                    } else if (preview && removeBtn) {
                        // Ensure preview and button are reset if no image for this slot
                        preview.src = "";
                        preview.classList.remove('visible');
                        removeBtn.style.display = 'none'; // Ensure button is hidden
                    }
                } else {
                     console.warn(`Could not find slot elements for image index ${i}`);
                }
            }


        } catch (error) {
            console.error("Error loading or parsing data:", error);
            alert("An error occurred. Returning to homepage.");
            window.location.href = 'index.html';
        }
    }

    // --- 4. Image File Handling ---

    // --- REPLACED handleImageUpload function ---
    function handleImageUpload(fileInput, previewElement, index) {
        const file = fileInput.files[0];
        // Find the button within the same slot as the preview element
        const slot = previewElement.closest('.image-upload-slot');
        const removeBtn = slot ? slot.querySelector('.remove-image-btn') : null;

        // Safety check if elements weren't found
        if (!slot || !previewElement || !removeBtn) {
             console.error(`handleImageUpload: Could not find necessary elements for slot index ${index}`);
             // Hide button just in case it was somehow visible
             if(removeBtn) removeBtn.style.display = 'none';
             return;
        }

        if (file) {
            // --- Size Check ---
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                alert(`Image in Slot ${index + 1} is too large! Please select an image under 2MB.`);
                // Reset everything for this slot on error
                fileInput.value = ""; // Clear file input
                previewElement.src = ""; // Clear preview image source
                previewElement.classList.remove('visible'); // Hide preview
                imageBase64Array[index] = ""; // Clear data
                removeBtn.style.display = 'none'; // Hide button
                return; // Stop processing
            }

            // --- Read and Display Image ---
            const reader = new FileReader();
            reader.onload = function(e) {
                const base64String = e.target.result;
                previewElement.src = base64String;
                previewElement.classList.add('visible');
                imageBase64Array[index] = base64String;
                removeBtn.style.display = 'block'; // <<< SHOW the button
                console.log(`Image ${index + 1} stored/updated.`);
            }
            reader.onerror = function(e) { // Handle potential read errors
                console.error(`Error reading file for slot index ${index}:`, e);
                alert(`Error reading image for Slot ${index + 1}. Please try again or use a different image.`);
                // Reset on error
                fileInput.value = "";
                previewElement.src = "";
                previewElement.classList.remove('visible');
                imageBase64Array[index] = "";
                removeBtn.style.display = 'none';
            }
            reader.readAsDataURL(file);

        } else {
            // --- Handle File Cancellation/Clearing ---
            // This runs if the user cancels the file dialog or if fileInput.value is cleared
            previewElement.src = "";
            previewElement.classList.remove('visible');
            imageBase64Array[index] = "";
            removeBtn.style.display = 'none'; // <<< HIDE the button
            console.log(`Image ${index + 1} selection cancelled or cleared.`);
        }
    }


    // --- Set up initial listeners for file inputs ---
    for (let i = 1; i <= 5; i++) {
        const input = document.getElementById(`image-upload-${i}`);
        const preview = document.getElementById(`image-preview-${i}`);
        if (input && preview) {
            // Use an IIFE to capture the correct index 'i'
             (function(currentIndex) {
                 input.addEventListener('change', () => handleImageUpload(input, preview, currentIndex - 1));
            })(i);
        } else {
            console.warn(`Could not find input or preview elements for image slot ${i}`);
        }
    }

     // --- REPLACED Remove Button Listener Setup ---
    const imageGrid = document.querySelector('.image-upload-grid');
    if (imageGrid) {
        imageGrid.addEventListener('click', function(event) {
            // Check if the clicked element IS the remove button itself
            if (event.target.classList.contains('remove-image-btn')) {
                console.log("Remove button clicked"); // Debug log
                const button = event.target;
                const indexStr = button.dataset.index; // Get index as string first
                const index = parseInt(indexStr, 10);

                // Find elements relative to the clicked button
                const slot = button.closest('.image-upload-slot');
                const preview = slot ? slot.querySelector('.image-preview') : null;
                const fileInput = slot ? slot.querySelector('.hidden-file-input') : null;

                // Validate everything needed was found and index is a number
                if (isNaN(index) || !slot || !preview || !fileInput) {
                    console.error("Could not find required elements for removing image at index:", indexStr);
                    return; // Stop if something is missing
                }

                console.log(`Attempting to remove image at index: ${index}`); // Debug log

                // Clear data
                if (index >= 0 && index < imageBase64Array.length) {
                    imageBase64Array[index] = "";
                } else {
                     console.error(`Invalid index ${index} for imageBase64Array`);
                     return; // Stop if index is out of bounds
                }


                // Reset UI
                preview.src = ""; // Clear the image source
                preview.classList.remove('visible'); // Hide the image element
                fileInput.value = ""; // VERY IMPORTANT: Clear the actual file input value
                button.style.display = 'none'; // <<< HIDE the remove button

                console.log(`Image ${index + 1} removed.`);
            }
        });
    } else {
         console.error("Could not find the image upload grid container (.image-upload-grid)");
    }
    // --- End of Replace Block ---


    // --- 5. Handle Form Submission (Update) ---
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();

            if (projectIndex === -1) { alert("Error: Project data not loaded."); return; }

            // Filter out empty strings from the image array *before* saving
            const finalImageUrls = imageBase64Array.filter(url => url && url.trim() !== "");
            const projectNameValue = projectName?.value || 'Project'; // Get value once
            
            // Add placeholder only if the final array is truly empty
            if (finalImageUrls.length === 0) {
                finalImageUrls.push(`https://via.placeholder.com/500x350.png?text=${projectNameValue.replace(/ /g, '+')}`);
            }

            const updatedProject = {
                ...projectToEdit, // Keep old ID, views, inquiries if they exist
                title: projectNameValue, // Use variable
                type: projectType?.value || projectToEdit.type,
                industry: industry?.value || projectToEdit.industry,
                college: college?.value || projectToEdit.college,
                trl: trlLevel?.value || projectToEdit.trl,
                shortDescription: shortDescription?.value || projectToEdit.shortDescription,
                detailedDescription: detailedDescription?.value || projectToEdit.detailedDescription,
                problemStatement: problemStatement?.value || projectToEdit.problemStatement,
                solution: solution?.value || projectToEdit.solution,
                features: [ // Rebuild features array, filtering empty ones
                    { title: feature1Title?.value, description: feature1Desc?.value },
                    { title: feature2Title?.value, description: feature2Desc?.value },
                    { title: feature3Title?.value, description: feature3Desc?.value },
                    { title: feature4Title?.value, description: feature4Desc?.value },
                ].filter(f => f.title && f.description), // Filter stricter: only if BOTH title and desc exist
                imageUrls: finalImageUrls, // Save the filtered image array
                startDate: startDate?.value || projectToEdit.startDate,
                teamSize: teamSize?.value || projectToEdit.teamSize,
                founderName: founderName?.value || projectToEdit.founderName,
                founderRole: founderRole?.value || projectToEdit.founderRole,
                founderAffiliation: founderAffiliation?.value || projectToEdit.founderAffiliation,
                founderEmail: founderEmail?.value || projectToEdit.founderEmail,
                founderPhone: founderPhone?.value || projectToEdit.founderPhone,
                // Ensure userId is correctly maintained or updated if Demo user edits a default project
                userId: (loggedInUser === 'Demo User' && projectToEdit.userId === 'default') ? 'Demo User' : projectToEdit.userId
            };

            // --- Save updated project back to localStorage ---
            try {
                allProjects[projectIndex] = updatedProject; // Update the project in the array
                localStorage.setItem('ucolabProjects', JSON.stringify(allProjects));
                console.log("Project updated:", updatedProject);
                
                // --- MODIFICATION START ---

                // 1. Reload the opener tab
                try {
                    if (window.opener && !window.opener.closed && window.opener.location) { // Added !window.opener.closed check
                        window.opener.location.reload();
                    }
                } catch (openerError) {
                    console.warn("Could not reload opener tab (this is often a security block):", openerError);
                }

                // 2. Get DOM elements
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

                // 3. Check if all elements were found
                if (formElement && successContainer && successTitle && successText && successLinkHome && successLinkProject && successCloseBtn && pageTitle && pageSubtitle && backLink) {
                    
                    // 4. Hide the form and page titles using inline style
                    formElement.style.display = 'none';
                    pageTitle.style.display = 'none';
                    pageSubtitle.style.display = 'none';
                    backLink.style.display = 'none';

                    // 5. Customize and show the success message
                    successTitle.textContent = 'Project Updated!';
                    successText.textContent = `Your project "${updatedProject.title}" has been successfully updated.`;
                    successLinkHome.href = 'index.html';
                    successLinkProject.href = `project-detail.html?id=${updatedProject.id}`; // Link to the updated project
                    
                    // Show the success container by removing the inline style
                    successContainer.style.display = 'block'; // This reverts to the CSS 'display: block'
                    
                    // 6. Add listener for the close button
                    successCloseBtn.addEventListener('click', () => window.close());
                } else {
                    // Fallback if elements aren't found
                    console.error("Could not find success message elements. Falling back to alert.");
                    alert("Project updated successfully!");
                    window.close(); // Keep old behavior on error
                }
                
                // 7. Removed old alert() and window.close()

                // --- MODIFICATION END ---

            } catch (error) {
                console.error("Error updating project in localStorage:", error);
                if (error.name === 'QuotaExceededError') {
                    alert("Error: Could not save. Storage is full. This is likely due to large images (max ~5MB total). Please reduce image sizes or remove some.");
                } else {
                    alert("An error occurred while saving your changes.");
                }
            }
        });
    }

    // --- 6. Handle Cancel / Back Buttons ---
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
             // Ask confirmation before closing if changes might have been made
             if (confirm("Are you sure you want to go back? Any unsaved changes will be lost.")) {
                 window.close();
             }
         });
    }

    // --- 7. Handle Sign Out Button ---
    if (signOutButton) {
        signOutButton.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('loggedInUser');
            alert("You have been signed out.");
            window.location.href = 'index.html'; // Redirect to home after sign out
        });
    }

    // --- 8. Initial Call to Load Data ---
    loadAndPopulateData();

    // --- 9. DYNAMIC BACKGROUND CIRCLES ---
    // (Keep the createRandomCircles function as it was)
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
    createRandomCircles();

}); // End DOMContentLoaded