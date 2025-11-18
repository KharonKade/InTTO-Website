document.addEventListener('DOMContentLoaded', function() {
    console.log("Submit project script loaded.");

    // --- Cloudinary Configuration ---
    const CLOUDINARY_CLOUD_NAME = 'dy9tykp58u';
    const CLOUDINARY_UPLOAD_PRESET = 'ucolab_project'; // Create this in Cloudinary dashboard
    const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    
    // --- EmailJS Configuration ---
    const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID'; // Replace with your EmailJS service ID
    const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID'; // Replace with your EmailJS template ID
    const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // Replace with your EmailJS public key

    // --- Global vars ---
    let uploadedImageUrls = ["", "", "", "", ""]; // Array to hold 5 Cloudinary URLs
    let uploadingImages = [false, false, false, false, false]; // Track upload status

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
            initializeCollegeDropdown();
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
        const signOutButton = document.getElementById('signout-btn-main'); // <-- Corrected ID from submit-project.html
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
        // Upload image to Cloudinary
        async function uploadToCloudinary(file, index) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
            formData.append('folder', 'ucolab_projects'); // Organize in folder

            try {
                uploadingImages[index] = true;
                console.log(`🔄 Uploading image ${index + 1} to Cloudinary...`);
                
                const response = await fetch(CLOUDINARY_URL, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.error('❌ Cloudinary error:', errorData);
                    throw new Error(`Upload failed: ${errorData.error?.message || response.status}`);
                }

                const data = await response.json();
                console.log(`✅ Image ${index + 1} uploaded:`, data.secure_url);
                
                uploadingImages[index] = false;
                return data.secure_url;
                
            } catch (error) {
                uploadingImages[index] = false;
                console.error(`❌ Error uploading image ${index + 1}:`, error);
                throw error;
            }
        }

        // Fallback: Convert to base64 if Cloudinary fails
        function convertToBase64(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
            });
        }

        function handleImageUpload(fileInput, previewElement, index) {
            const file = fileInput.files[0];
            const slot = previewElement.closest('.image-upload-slot');
            const removeBtn = slot ? slot.querySelector('.remove-image-btn') : null;
            const uploadLabel = slot ? slot.querySelector('.upload-label') : null;
            
            if (!slot || !previewElement || !removeBtn) {
                console.error(`handleImageUpload: Could not find elements for slot ${index}`);
                return;
            }
            
            if (file) {
                // Validate file size (2MB limit)
                if (file.size > 2 * 1024 * 1024) {
                    alert(`Image in Slot ${index + 1} is too large! Max 2MB.`);
                    fileInput.value = "";
                    previewElement.src = "";
                    previewElement.classList.remove('visible');
                    uploadedImageUrls[index] = "";
                    removeBtn.style.display = 'none';
                    return;
                }

                // Show loading state
                if (uploadLabel) {
                    uploadLabel.innerHTML = `
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                        </svg>
                        <div>Uploading...</div>
                    `;
                    uploadLabel.style.opacity = '0.6';
                }

                // Try Cloudinary first, fallback to base64
                uploadToCloudinary(file, index)
                    .then(cloudinaryUrl => {
                        uploadedImageUrls[index] = cloudinaryUrl;
                        previewElement.src = cloudinaryUrl;
                        previewElement.classList.add('visible');
                        removeBtn.style.display = 'block';
                        console.log(`✅ Image ${index + 1} uploaded to Cloudinary`);
                        
                        // Reset label
                        if (uploadLabel) {
                            const labelText = index === 0 ? 'Project Logo(1mb)' : `Image ${index}`;
                            uploadLabel.innerHTML = `
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                <div>${labelText}</div>
                            `;
                            uploadLabel.style.opacity = '1';
                        }
                    })
                    .catch(cloudinaryError => {
                        console.warn('⚠️ Cloudinary failed, using base64 fallback:', cloudinaryError);
                        // Fallback to base64
                        return convertToBase64(file)
                            .then(base64String => {
                                uploadedImageUrls[index] = base64String;
                                previewElement.src = base64String;
                                previewElement.classList.add('visible');
                                removeBtn.style.display = 'block';
                                console.log(`✅ Image ${index + 1} stored as base64`);
                                
                                // Reset label
                                if (uploadLabel) {
                                    const labelText = index === 0 ? 'Project Logo(1mb)' : `Image ${index}`;
                                    uploadLabel.innerHTML = `
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                        <div>${labelText}</div>
                                    `;
                                    uploadLabel.style.opacity = '1';
                                }
                            });
                    })
                    .catch(error => {
                        console.error(`Error processing image ${index + 1}:`, error);
                        alert(`Failed to process image ${index + 1}. Please try again.`);
                        previewElement.src = "";
                        previewElement.classList.remove('visible');
                        uploadedImageUrls[index] = "";
                        fileInput.value = "";
                        
                        // Reset label
                        if (uploadLabel) {
                            const labelText = index === 0 ? 'Project Logo(1mb)' : `Image ${index}`;
                            uploadLabel.innerHTML = `
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                <div>${labelText}</div>
                            `;
                            uploadLabel.style.opacity = '1';
                        }
                    });
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
                    
                    // Clear the Cloudinary URL
                    uploadedImageUrls[index] = "";
                    preview.src = "";
                    preview.classList.remove('visible');
                    fileInput.value = "";
                    button.style.display = 'none';
                    
                    console.log(`🗑️ Removed image from slot ${index + 1}`);
                }
            });
        }
    }

    // --- 6. FORM SUBMISSION HANDLING (Updated) ---
    function initializeFormSubmit(loggedInUser) {
        const submitForm = document.querySelector('.submit-form');
        if (submitForm) {
            submitForm.addEventListener('submit', async function(event) {
                event.preventDefault();

                // Check if any images are still uploading
                if (uploadingImages.some(status => status === true)) {
                    alert('Please wait for all images to finish uploading before submitting.');
                    return;
                }

                // Get uploaded image URLs (filter out empty strings)
                const finalImageUrls = uploadedImageUrls.filter(url => url !== "");
                const projectNameValue = document.getElementById('project-name')?.value || 'Project';
                
                // If no images uploaded, use placeholder
                if (finalImageUrls.length === 0) {
                    finalImageUrls.push(`https://via.placeholder.com/500x350.png?text=${projectNameValue.replace(/ /g, '+')}`);
                }
                
                console.log('📸 Final image URLs:', finalImageUrls);
                
                // --- Read selected colleges ---
                const selectedColleges = Array.from(document.querySelectorAll('input[name="college-option"]:checked'))
                                              .map(cb => cb.value);
                
                // Basic validation check
                if (selectedColleges.length === 0) {
                    alert("Please select at least one college.");
                    return;
                }

                // Extract SDG number from "SDG X: Name" format
                const sdgValue = document.getElementById('project-sdg')?.value || 'N/A';
                const sdgNumber = sdgValue.match(/SDG (\d+)/) ? parseInt(sdgValue.match(/SDG (\d+)/)[1]) : null;
                const sdgsArray = sdgNumber ? [sdgNumber] : [];

                const newProject = {
                    id: Date.now(),
                    createdAt: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
                    name: projectNameValue, // Changed from 'title' to 'name' for admin compatibility
                    title: projectNameValue, // Keep for backward compatibility
                    logo: finalImageUrls[0].startsWith('http') ? '🚀' : '🚀', // Emoji logo for admin view
                    type: document.getElementById('project-type')?.value || 'N/A',
                    industry: document.getElementById('industry')?.value || 'N/A',
                    category: document.getElementById('industry')?.value || 'N/A', // Alias for admin
                    college: selectedColleges,
                    trl: parseInt(document.getElementById('trl-level')?.value.match(/\d+/)?.[0]) || 1, // Extract number
                    trlFull: document.getElementById('trl-level')?.value || 'TRL 1',
                    sdg: sdgValue,
                    sdgs: sdgsArray, // Array format for admin
                    shortDescription: document.getElementById('short-description')?.value || '',
                    description: document.getElementById('short-description')?.value || '', // For admin card
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
                    userId: loggedInUser,
                    status: 'pending', // Admin approval status: pending, active, graduated, rejected
                    collab: false, // Default to not open for collaboration
                    tags: [document.getElementById('project-type')?.value || 'Project'], // Auto-generate tags
                    website: '' // Can be added later
                };

                try {
                    // Save to pendingProjects (for backward compatibility)
                    const existingPendingProjects = JSON.parse(localStorage.getItem('pendingProjects') || '[]');
                    existingPendingProjects.push(newProject);
                    localStorage.setItem('pendingProjects', JSON.stringify(existingPendingProjects));
                    console.log("✅ Project saved to pendingProjects");

                    // --- NEW: Save to admin startups data ---
                    const ADMIN_STORAGE_KEY = 'ucInttoStartupsData';
                    const adminStartupsData = JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEY) || '[]');
                    adminStartupsData.push(newProject);
                    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminStartupsData));
                    console.log("✅ Project saved to admin startups data");

                    // --- NEW: Send email notification using EmailJS ---
                    try {
                        if (typeof emailjs !== 'undefined' && EMAILJS_SERVICE_ID !== 'YOUR_SERVICE_ID') {
                            await emailjs.send(
                                EMAILJS_SERVICE_ID,
                                EMAILJS_TEMPLATE_ID,
                                {
                                    project_name: newProject.name,
                                    founder_name: newProject.founderName,
                                    founder_email: newProject.founderEmail,
                                    industry: newProject.industry,
                                    college: selectedColleges.join(', '),
                                    trl: newProject.trlFull,
                                    submission_date: newProject.createdAt,
                                    admin_link: `${window.location.origin}/admin/startups.html`
                                },
                                EMAILJS_PUBLIC_KEY
                            );
                            console.log("✅ Email notification sent to admin");
                        } else {
                            console.warn("⚠️ EmailJS not configured or loaded");
                        }
                    } catch (emailError) {
                        console.error("❌ Email notification failed:", emailError);
                        // Don't block submission if email fails
                    }

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
                        successText.textContent = `Your project "${newProject.name}" has been submitted for admin approval. You'll be notified once it's reviewed.`;
                        successLinkHome.href = 'index.html';
                        successLinkProject.style.display = 'none'; 
                        successContainer.style.display = 'block';
                        successCloseBtn.addEventListener('click', () => window.close());
                    } else {
                        alert("Project submitted for approval!");
                        window.close();
                    }
                } catch (error) {
                    console.error("Error saving project:", error);
                    if (error.name === 'QuotaExceededError') {
                        alert("Error: Storage limit exceeded. Please use smaller images or contact admin.");
                    } else {
                        alert("Error saving project. Please try again or contact support.");
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