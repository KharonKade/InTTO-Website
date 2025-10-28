import { saveApplication } from "../Contact-Us-DB/saveInfoC.js";

document.addEventListener('DOMContentLoaded', () => {
    // 1. Target the form and button directly
    const contactForm = document.getElementById('contact-form');
    const submitButton = document.querySelector('.contact-btn');
    
    // Check if the form exists before continuing
    if (!contactForm || !submitButton) {
        console.error("Contact form or submit button not found.");
        return;
    }

    // This object will hold all the collected data
    const collectedData = {};

    // --- Core Utility Functions ---

    // Define the success page handler (replacing the complex multi-step version)
    const showSuccessPage = (refId) => {
        // Find the button again to reset its text
        const btn = document.querySelector('.contact-btn');
        if (btn) {
            btn.innerHTML = 'Send Message <span class="arrow-contact">➜</span>';
            btn.disabled = false;
        }
        
        // Show success feedback and clear the form
        alert(`✅ Message Sent Successfully! Reference ID: ${refId || 'N/A'}. We will respond soon.`);
        contactForm.reset();
    };

    // Define the data collection function
    const collectFormData = (form) => {
        const data = {};
        const elements = form.querySelectorAll('input, select, textarea');
        
        elements.forEach(element => {
            // Checkbox logic preserved, but unlikely to be used in a simple contact form
            if (element.type === 'checkbox') {
                if (!data[element.name]) {
                    data[element.name] = [];
                }
                if (element.checked) {
                    data[element.name].push(element.value);
                }
            } else {
                // Collects data using the element's ID (e.g., name, email, subject, message)
                data[element.id] = element.value;
            }
        });
        // Update the central collectedData object
        Object.assign(collectedData, data);
    };

    // --- Event Handlers ---

    // Use the form's submit event for native validation handling
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Ensure client-side validation passes
        if (!contactForm.checkValidity()) {
            return; 
        }

        // 1. Collect Data
        collectFormData(contactForm); 

        // 2. Add timestamp
        collectedData.submittedAt = new Date().toISOString();

        // 3. Check for the save function
        if (typeof saveApplication !== 'function') {
            console.error("saveApplication is not available. Check your import path and export in saveInfoC.js.");
            alert("Submission error: Saving functionality is missing.");
            return;
        }

        // 4. Disable button and start submission
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        saveApplication(collectedData)
            .then(response => {
                const refId = response && response.refId ? response.refId : 'MSG-' + Date.now();
                showSuccessPage(refId); // Defined above
            })
            .catch(error => {
                console.error("Submission failed:", error);
                alert("Submission failed. Please check the console for details.");
            })
            .finally(() => {
                // Ensure button is re-enabled and text is reset on failure
                if (submitButton.disabled) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = 'Send Message <span class="arrow-contact">➜</span>';
                }
            });
    });
    
    // NOTE: The previous script had a separate 'click' handler for the button 
    // and a 'submit' handler for the form. This consolidated structure (using only 
    // the 'submit' event) is generally better practice. The code above uses 
    // the 'submit' event handler and removes the redundant 'click' handler.
    // We are replacing the old forms.forEach loop and the submitButton click handler
    // with the consolidated form.addEventListener('submit', ...) above.
});