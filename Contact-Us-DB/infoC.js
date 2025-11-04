// Your final working infoContactUs.js script:

import { saveApplication } from "../Contact-Us-DB/saveInfoC.js"; 

document.addEventListener('DOMContentLoaded', () => {
    emailjs.init("5_58lLK_G13DczpUQ");
    const contactForm = document.getElementById('contact-form');
    const submitButton = document.querySelector('.contact-btn');


    if (!contactForm || !submitButton) {
        console.error("Contact form or submit button not found.");
        return;
    }

    const showSuccessPage = () => {
        const btn = document.querySelector('.contact-btn');
        if (btn) {
            btn.innerHTML = 'Send Message <span class="arrow-contact">➜</span>';
            btn.disabled = false;
        }
        alert(`✅ Message Sent Successfully! We will respond soon.`); 
        contactForm.reset();
    };

    const collectFormData = (form) => {
        const data = {};
        const elements = form.querySelectorAll('input, select, textarea');
        
        elements.forEach(element => {
            // Collects data using the element's ID (name, email, subject, message)
            data[element.id] = element.value;
        });
        return data; 
    };

    // FIX 2: Correctly structure the submit event handler.
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!contactForm.checkValidity()) {
            return; 
        }

        const formData = collectFormData(contactForm); 

        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        
        // 3. EmailJS Parameters
        const serviceID = "service_4k3exau";     
        const templateID = "template_ojczsmj";   
        const emailPromise = emailjs.send(serviceID, templateID, formData);
        
        // Add timestamp for database record
        formData.submittedAt = new Date().toISOString(); 
        const dbPromise = saveApplication(formData);

        Promise.allSettled([emailPromise, dbPromise])
            .then(results => {
                const emailResult = results[0];
                const dbResult = results[1];
                
                if (emailResult.status === 'fulfilled' && dbResult.status === 'fulfilled') {
                    // Both succeeded
                    console.log('Email and DB save succeeded.');
                    showSuccessPage();
                } else if (emailResult.status === 'rejected') {
                    // Email failed
                    console.error('Email sending failed:', emailResult.reason);
                    alert("Submission failed. (Email Error)");
                } else if (dbResult.status === 'rejected') {
                    // DB failed
                    console.error('Database saving failed:', dbResult.reason);
                    alert("Submission failed. (Database Error)");
                } else {
                    // If one succeeded, we show success but log the warning
                    console.warn('Submission partially succeeded (one operation failed but the other succeeded).');
                    showSuccessPage(); 
                }
            })
            .catch(error => {
                // This catch only triggers if Promise.allSettled fails, which is rare
                console.error("An unexpected error occurred during submission:", error);
                alert("An unexpected error occurred.");
            })
            .finally(() => {
                // Ensure button resets even if both fail
                submitButton.disabled = false;
                submitButton.innerHTML = 'Send Message <span class="arrow-contact">➜</span>';
            });
    });
});