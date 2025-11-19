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
        // Create confirmation modal
        const modal = document.createElement('div');
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999;';
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = 'background: white; padding: 30px; border-radius: 10px; text-align: center; max-width: 400px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
        modalContent.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 15px;">Thank you for Contacting Us</div>
            <h2 style="margin: 0 0 10px 0; color: #333;">Message Sent Successfully!</h2>
            <p style="color: #666; margin-bottom: 20px;">We will respond soon.</p>
            <button style="background: #166c41; color: white; border: none; padding: 10px 30px; border-radius: 5px; cursor: pointer; font-size: 16px;">OK</button>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Close modal on button click
        modalContent.querySelector('button').addEventListener('click', () => {
            modal.remove();
        });
        
        // Close modal on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
            modal.remove();
            }
        });
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