document.addEventListener('DOMContentLoaded', function() {
    console.log("Submit project script loaded.");

    // --- 1. Authentication Check ---
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        alert("You must be signed in to submit a project.");
        window.location.href = 'index.html';
        return;
    }

    // --- 2. Update Header User Info ---
    const userDisplayPill = document.getElementById('user-display');
    const signOutButton = document.getElementById('signout-btn');
    if (userDisplayPill) {
         userDisplayPill.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              ${loggedInUser}
         `;
         const founderEmailInput = document.getElementById('founder-email');
         if (founderEmailInput && loggedInUser.includes('@')) {
             founderEmailInput.value = loggedInUser;
         }
         const founderNameInput = document.getElementById('founder-name');
         if(founderNameInput && loggedInUser === 'Demo User') {
             founderNameInput.value = 'Demo User';
         }
    }
    if (signOutButton) {
        signOutButton.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('loggedInUser');
            alert("You have been signed out.");
            window.location.href = 'index.html';
        });
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
    createRandomCircles();


    // --- 4. Multi-Image File Handling ---
    let imageBase64Array = ["", "", "", "", ""]; // Array to hold 5 image strings

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
            // Use an IIFE (Immediately Invoked Function Expression) to capture the correct index 'i'
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


    // --- 5. FORM SUBMISSION HANDLING (Updated) ---
    const submitForm = document.querySelector('.submit-form');
    if (submitForm) {
        submitForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const finalImageUrls = imageBase64Array.filter(url => url !== "");
            const projectNameValue = document.getElementById('project-name')?.value || 'Project';
            if (finalImageUrls.length === 0) {
                finalImageUrls.push(`https://via.placeholder.com/500x350.png?text=${projectNameValue.replace(/ /g, '+')}`);
            }

            const newProject = {
                id: Date.now(),
                title: projectNameValue,
                type: document.getElementById('project-type')?.value || 'N/A',
                industry: document.getElementById('industry')?.value || 'N/A',
                college: document.getElementById('college')?.value || 'N/A',
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
                ].filter(f => f.title && f.description), // Only include features with both title and description
                imageUrls: finalImageUrls, // Save the array of base64 strings
                startDate: document.getElementById('start-date')?.value || 'N/A',
                teamSize: document.getElementById('team-size')?.value || 'N/A',
                founderName: document.getElementById('founder-name')?.value,
                founderRole: document.getElementById('founder-role')?.value,
                founderAffiliation: document.getElementById('founder-affiliation')?.value,
                founderEmail: document.getElementById('founder-email')?.value,
                founderPhone: document.getElementById('founder-phone')?.value || '',
                views: 0,
                inquiries: 0,
                userId: loggedInUser // Assign the currently logged-in user
            };

            // --- Save to localStorage ---
            try {
                const existingProjects = JSON.parse(localStorage.getItem('ucolabProjects') || '[]');
                existingProjects.push(newProject);
                localStorage.setItem('ucolabProjects', JSON.stringify(existingProjects));
                console.log("Project saved to localStorage.");

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
                    successTitle.textContent = 'Project Submitted!';
                    successText.textContent = `Your project "${newProject.title}" has been successfully added to the UCoLab portal.`;
                    successLinkHome.href = 'index.html'; // This is already correct
                    successLinkProject.href = `project-detail.html?id=${newProject.id}`;
                    
                    // Show the success container by removing the inline style
                    successContainer.style.display = 'block';
                    // 6. Add listener for the new close button
                    successCloseBtn.addEventListener('click', () => window.close());
                } else {
                    // Fallback if elements aren't found
                    console.error("Could not find success message elements. Falling back to alert.");
                    alert("Project submitted successfully!");
                    window.close(); // Keep old behavior on error
                }
                
                // 7. Removed old alert() and window.close()
                
                // --- MODIFICATION END ---

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

    // --- 6. Cancel Button Logic ---
    const cancelButton = document.querySelector('.btn-cancel');
    if(cancelButton) {
        cancelButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm("Are you sure you want to cancel? Any unsaved changes will be lost.")) {
                window.close();
            }
        });
    }

}); // End DOMContentLoaded