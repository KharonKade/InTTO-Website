document.addEventListener('DOMContentLoaded', function() {
    console.log("Project Detail script loaded.");

    // --- Get Lightbox Elements ---
    const lightboxOverlay = document.getElementById('lightbox-overlay');
    const lightboxImage = document.getElementById('lightbox-image');

    // --- 1. DYNAMIC BACKGROUND CIRCLES ---
    function createRandomCircles() {
        // ... (keep your existing createRandomCircles function here) ...
        const body = document.body;
        if (!body) return;
        const circleCount = Math.floor(Math.random() * 6) + 5;
        const colors = ['#B9F8CF', '#cff8b9', '#b9eef8', '#f8b9d4', '#f8e0b9'];
        for (let i = 0; i < circleCount; i++) {
            const circle = document.createElement('div');
            circle.classList.add('blur-circle');
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

    // --- 2. SMOOTH SCROLL FOR "CONTACT FOUNDER" ---
    const contactButton = document.querySelector('.contact-founder-btn');
    const publisherInfoSection = document.getElementById('publisher-info');
    if (contactButton && publisherInfoSection) {
        contactButton.addEventListener('click', function(e) {
            e.preventDefault();
            publisherInfoSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // --- Lightbox Functions ---
    function openLightbox(imageUrl) {
        if (!lightboxOverlay || !lightboxImage) return;
        console.log("Opening lightbox for:", imageUrl);
        
        // --- Don't open lightbox for the default image ---
        if (imageUrl.includes('Logo/No image.png')) {
            return;
        }

        lightboxImage.src = imageUrl;
        lightboxOverlay.style.display = 'flex'; // Use flex for centering
        // Need a tiny delay for the CSS transition to work from display:none
        setTimeout(() => {
            lightboxOverlay.classList.add('visible');
        }, 10);
        // Add listener for Escape key
        document.addEventListener('keydown', handleEscapeKey);
    }

    function closeLightbox() {
        if (!lightboxOverlay) return;
        console.log("Closing lightbox");
        lightboxOverlay.classList.remove('visible');
        // Wait for fade out before setting display:none
        setTimeout(() => {
            lightboxOverlay.style.display = 'none';
            lightboxImage.src = ""; // Clear src
        }, 300); // Should match CSS transition duration
        // Remove listener for Escape key
        document.removeEventListener('keydown', handleEscapeKey);
    }

    function handleEscapeKey(event) {
        if (event.key === 'Escape') {
            closeLightbox();
        }
    }

    // Add listener to close lightbox when clicking the overlay (but not the image itself)
    if (lightboxOverlay) {
        lightboxOverlay.addEventListener('click', function(event) {
            if (event.target === lightboxOverlay) { // Only close if overlay background is clicked
                closeLightbox();
            }
        });
    }


    // --- 3. LOAD PROJECT DATA ---
    function loadProjectData() {
        console.log("Loading project data...");
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');

        // --- Get page elements ---
        const detailTitle = document.getElementById('detail-title');
        const detailImage = document.getElementById('detail-image'); // Main hero image
        const galleryGrid = document.getElementById('detail-gallery-grid');
        const prevBtn = document.getElementById('hero-prev-btn');
        const nextBtn = document.getElementById('hero-next-btn');

        // --- Slideshow state variables ---
        let galleryImageUrls = [];
        let currentImageIndex = 0;
        let slideTimer = null;


        if (!projectId) { /* ... (rest of error handling) ... */
             console.error("No project ID found in URL.");
            if(detailTitle) detailTitle.textContent = "Project Not Found"; // Safety check
            return;
        }
        console.log("Project ID from URL:", projectId);

        let allProjects = [];
        try { /* ... (rest of loading/parsing) ... */
             allProjects = JSON.parse(localStorage.getItem('ucolabProjects') || '[]');
        } catch (e) {
            console.error("Error parsing projects from localStorage", e);
             if(detailTitle) detailTitle.textContent = "Error Loading Project"; // Safety check
            return; // Stop if parsing fails
        }

        if (!Array.isArray(allProjects) || allProjects.length === 0) { /* ... (rest of error handling) ... */
             console.error("No projects found in localStorage.");
             if(detailTitle) detailTitle.textContent = "Project Not Found"; // Safety check
            return;
        }

        const project = allProjects.find(p => String(p.id) === String(projectId));

        if (!project) { /* ... (rest of error handling) ... */
             console.error("Project with ID", projectId, "not found.");
            if(detailTitle) detailTitle.textContent = "Project Not Found"; // Safety check
            return;
        }

        console.log("Found project:", project);

        // --- 4. POPULATE PAGE WITH DATA ---

        document.title = `${project.title || 'Project'} - UCoLab`;

        // --- Populate non-image fields (Keep existing code) ---
        if(detailTitle) detailTitle.textContent = project.title || 'N/A';
        const shortDescEl = document.getElementById('detail-short-desc');
        if(shortDescEl) shortDescEl.textContent = project.shortDescription || 'No description provided.';
        const detailIcon = document.getElementById('detail-icon');
        // ... (rest of icon, tags, long desc, problem, solution, features, sidebar population) ...
        const longDescEl = document.getElementById('detail-long-desc');
        if(longDescEl) longDescEl.textContent = project.detailedDescription || 'No overview provided.';
        const problemEl = document.getElementById('detail-problem');
        if(problemEl) problemEl.textContent = project.problemStatement || 'No problem statement provided.';
        const solutionEl = document.getElementById('detail-solution');
        if(solutionEl) solutionEl.textContent = project.solution || 'No solution provided.';
        const featuresGrid = document.getElementById('detail-features-grid');
        if(featuresGrid){ /* ... (features population logic) ... */
             featuresGrid.innerHTML = ''; // Clear first
            if (project.features && Array.isArray(project.features) && project.features.some(f => f.title && f.description)) {
                 project.features.forEach(feature => {
                    if (feature.title && feature.description) { // Ensure both exist in the feature object
                        featuresGrid.innerHTML += `
                            <div class="feature-item">
                                <h4>${feature.title}</h4>
                                <p>${feature.description}</p>
                            </div>
                        `;
                    }
                });
            } else {
                featuresGrid.innerHTML = '<p>No specific features listed.</p>';
            }
        }
        const trlNumMatch = project.trl?.match(/TRL (\d+)/);
        const trlNum = trlNumMatch ? parseInt(trlNumMatch[1], 10) : 0;
        const trlPercent = trlNum > 0 ? Math.round((trlNum / 9) * 100) : 0;
        let trlLabelClass = 'trl-grey';
        let trlLabelText = project.trl || 'TRL ?';
        let trlColor = '#9e9e9e';
        if (trlNum <= 3) { trlLabelClass = 'trl-blue-sidebar'; trlLabelText = 'Proof of Concept'; trlColor = '#64b5f6'; }
        else if (trlNum <= 4) { trlLabelClass = 'trl-yellow-sidebar'; trlLabelText = 'Laboratory Testing'; trlColor = '#fdd835'; }
        else if (trlNum <= 6) { trlLabelClass = 'trl-orange-sidebar'; trlLabelText = 'Prototype/Pilot'; trlColor = '#ffca28'; }
        else if (trlNum <= 9) { trlLabelClass = 'trl-green-sidebar'; trlLabelText = 'System Prototype/Demo'; trlColor = '#7cb342'; }
        const trlTextEl = document.getElementById('detail-trl-text');
        if(trlTextEl) trlTextEl.innerHTML = `${project.trl || 'TRL ?'} of 9 <span class="trl-percentage">${trlPercent}%</span>`;
        const trlProgressEl = document.getElementById('detail-trl-progress');
        if(trlProgressEl){ trlProgressEl.style.width = `${trlPercent}%`; trlProgressEl.style.backgroundColor = trlColor;}
        const trlLabel = document.getElementById('detail-trl-label');
        if(trlLabel){ trlLabel.textContent = trlLabelText; trlLabel.className = `trl-label ${trlLabelClass}`; }
        const startDateEl = document.getElementById('detail-start-date');
        if(startDateEl) startDateEl.textContent = project.startDate || 'N/A';
        const teamSizeEl = document.getElementById('detail-team-size');
        if(teamSizeEl) teamSizeEl.textContent = project.teamSize || 'N/A';
        const collegeEl = document.getElementById('detail-college');
        // --- MODIFIED: Handle college array ---
        if(collegeEl) collegeEl.textContent = (Array.isArray(project.college) ? project.college.join(', ') : project.college) || 'N/A';
        const founderNameEl = document.getElementById('detail-founder-name');
        if(founderNameEl) founderNameEl.textContent = project.founderName || 'N/A';
        const founderRoleEl = document.getElementById('detail-founder-role');
        if(founderRoleEl) founderRoleEl.textContent = project.founderRole || 'N/A';
        const founderAffiliationEl = document.getElementById('detail-founder-affiliation');
        if(founderAffiliationEl) founderAffiliationEl.textContent = project.founderAffiliation || 'N/A';
        const founderEmailEl = document.getElementById('detail-founder-email');
        if(founderEmailEl) founderEmailEl.textContent = project.founderEmail || 'N/A';
        const phoneEl = document.getElementById('detail-founder-phone-container');
        const phoneValueEl = document.getElementById('detail-founder-phone');
        if (phoneEl && phoneValueEl) { if (project.founderPhone) { phoneValueEl.textContent = project.founderPhone; phoneEl.style.display = 'flex'; } else { phoneEl.style.display = 'none'; }}
        const industryEl = document.getElementById('detail-industry');
        if(industryEl) industryEl.textContent = project.industry || 'N/A';

        // --- SLIDESHOW AND GALLERY LOGIC ---

        // --- MODIFIED: Use new default image ---
        const defaultImageUrl = 'Logo/No image.png';

        galleryImageUrls = []; // Reset before populating
        if (project.imageUrls && Array.isArray(project.imageUrls)) {
             galleryImageUrls = project.imageUrls.filter(url => url && typeof url === 'string' && url.trim() !== '');
        }

        // --- Helper function to update the main image and active thumbnail (WITH FADE) ---
        function showImage(index) {
            const currentDetailImage = document.getElementById('detail-image'); // Get fresh ref
            const currentGalleryGrid = document.getElementById('detail-gallery-grid'); // Get fresh ref
            if (!currentDetailImage || !currentGalleryGrid || !galleryImageUrls || index < 0 || index >= galleryImageUrls.length) {
                 console.error("showImage: Missing element or invalid index", index, galleryImageUrls);
                 return;
            }

            currentImageIndex = index;
            currentDetailImage.style.opacity = 0; // Start Fade Out

            setTimeout(() => {
                currentDetailImage.src = galleryImageUrls[index]; // Change src
                
                // MODIFIED: Click on hero image now opens lightbox
                currentDetailImage.onclick = () => { openLightbox(galleryImageUrls[index]); };
                
                // --- NEW: Add class if it's the default image ---
                if (galleryImageUrls[index] === defaultImageUrl) {
                    currentDetailImage.classList.add('default-image');
                } else {
                    currentDetailImage.classList.remove('default-image');
                }

                currentDetailImage.style.opacity = 1; // Start Fade In

                // Update active thumbnail
                currentGalleryGrid.querySelectorAll('img.gallery-image').forEach((img, i) => {
                    img.classList.toggle('active', i === index); // More concise way
                });

            }, 500); // Match CSS transition
        }


        function showNextImage() { /* ... (keep existing function) ... */
             if (galleryImageUrls.length === 0) return; // Don't run if no images
            let newIndex = (currentImageIndex + 1) % galleryImageUrls.length;
            showImage(newIndex);
        }
        function showPrevImage() { /* ... (keep existing function) ... */
             if (galleryImageUrls.length === 0) return; // Don't run if no images
            let newIndex = (currentImageIndex - 1 + galleryImageUrls.length) % galleryImageUrls.length;
            showImage(newIndex);
        }
        function resetTimer() { /* ... (keep existing function) ... */
            clearInterval(slideTimer); // Clear existing timer
            if (galleryImageUrls.length > 1) {
                slideTimer = setInterval(showNextImage, 5000); // Start new 5-second timer
            }
        }


        // --- Main Image & Gallery Setup ---
        // --- MODIFIED: Check length *before* adding default ---
        if (galleryImageUrls.length > 0 && detailImage) {
            // 1. Populate the Gallery Grid
            if (galleryGrid) {
                galleryGrid.innerHTML = '';
                galleryImageUrls.forEach((imageUrl, index) => {
                    const img = document.createElement('img');
                    img.src = imageUrl;
                    img.alt = `${project.title || 'Project'} gallery image ${index + 1}`;
                    img.className = 'gallery-image';

                    // MODIFIED: Click on gallery image opens lightbox
                    img.onclick = () => {
                        openLightbox(imageUrl);
                    };

                    galleryGrid.appendChild(img);
                });
            } else { console.warn("Gallery grid element not found"); }

            // 2. Set the initial image (index 0) & ADD LIGHTBOX CLICK
            showImage(0); // This now sets the initial onclick for the hero image too

            // 3. Set up Slideshow buttons (if needed)
            if (galleryImageUrls.length > 1 && prevBtn && nextBtn) { /* ... (keep existing button setup) ... */
                 prevBtn.style.display = 'flex';
                nextBtn.style.display = 'flex';
                const newPrevBtn = prevBtn.cloneNode(true);
                if (prevBtn.parentNode) prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
                newPrevBtn.addEventListener('click', () => { showPrevImage(); resetTimer(); });
                const newNextBtn = nextBtn.cloneNode(true);
                 if (nextBtn.parentNode) nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
                newNextBtn.addEventListener('click', () => { showNextImage(); resetTimer(); });
                resetTimer(); // Start autoplay
            } else if (prevBtn && nextBtn) { /* ... (hide buttons if only 1 image) ... */
                 prevBtn.style.display = 'none';
                nextBtn.style.display = 'none';
            } else { console.warn("Slideshow buttons not found"); }

        } else { // --- No images ---
             if(detailImage){ /* ... (set placeholder, remove onclick) ... */
                // --- MODIFIED: Use new default image ---
                detailImage.src = defaultImageUrl;
                detailImage.alt = `${project.title || 'Project'} Image (Placeholder)`;
                detailImage.onclick = null; // Remove click listener
                detailImage.classList.add('default-image'); // Add class
            }
            if (galleryGrid) { galleryGrid.innerHTML = '<p>No images were uploaded for this project.</p>'; }
            if (prevBtn && nextBtn) { /* ... (hide buttons) ... */
                prevBtn.style.display = 'none';
                nextBtn.style.display = 'none';
            }
        }

    } // End of loadProjectData()

    // --- 5. Initial Call ---
    loadProjectData();

    // --- Intersection Observer for Scroll Animations ---
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    // ... (keep existing Intersection Observer code) ...
    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target); // Optional: Stop observing once visible
                }
            });
        }, {
            threshold: 0.1 // Trigger when 10% of the element is visible
        });

        animatedElements.forEach(el => {
             // Ensure the element doesn't already have is-visible before observing
             if (!el.classList.contains('is-visible')) {
                observer.observe(el);
             }
        });
    } else {
        // Fallback for older browsers: make elements visible immediately
        animatedElements.forEach(el => {
            el.classList.add('is-visible');
        });
    }

}); // End DOMContentLoaded