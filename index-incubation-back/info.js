import { saveApplication } from "../index-incubation-back/saveInfo.js";

document.addEventListener('DOMContentLoaded', () => {
    emailjs.init("5_58lLK_G13DczpUQ")
    const serviceID = "service_4k3exau";     
    const templateID = "template_0kp506f";   
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
        const submitButton = document.querySelector('.btn-submit');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Submit <span></span>';
        }
        });
    const personalInfoStep = document.getElementById('personal-info-step');
    const startupDetailsStep = document.getElementById('startup-details-step');
    const teamSupportStep = document.getElementById('team-support-step');
    const reviewStep = document.getElementById('review-step');
    const successStep = document.getElementById('success-step');
    
    
    const formStepsWrapper = document.getElementById('form-steps-wrapper');
    const formCardMain = document.getElementById('form-card-main');
    const topTracker = document.getElementById('progress-tracker-top');
    const innerTracker = document.getElementById('progress-tracker-inner');

    const steps = [personalInfoStep, startupDetailsStep, teamSupportStep, reviewStep];
    const forms = [
        document.getElementById('personal-info-form'),
        document.getElementById('startup-details-form'),
        document.getElementById('team-support-form')
    ];
    
    const topTrackerSteps = document.querySelectorAll('.top-progress-tracker .step');
    const innerTrackerSteps = document.querySelectorAll('.inner-progress-tracker .step');
    const topConnectors = document.querySelectorAll('.top-progress-tracker .connector');
    const innerConnectors = document.querySelectorAll('.inner-progress-tracker .connector');

    let currentStep = 1; 
    const collectedData = {};

    const collectFormData = (form) => {
        const data = {};
        const elements = form.querySelectorAll('input, select, textarea');
        elements.forEach(element => {
            if (element.type === 'checkbox') {
                if (!data[element.name]) {
                    data[element.name] = [];
                }
                if (element.checked) {
                    data[element.name].push(element.value);
                }
            } else {
                data[element.id] = element.value;
            }
        });
        Object.assign(collectedData, data);
    };

    const updateReviewStep = () => {
        const reviewElements = document.querySelectorAll('[data-review]');
        
        reviewElements.forEach(el => {
            const fieldId = el.getAttribute('data-review');
            let value = collectedData[fieldId];
            
            if (fieldId === 'supportNeeded' && Array.isArray(value)) {
                value = value.length > 0 ? value.join(', ') : '';
            }
            
            let displayValue = value || 'Not provided';

            if (el.textContent && el.textContent.includes('N/A') && !value) {
                displayValue = 'N/A';
            } else if (displayValue === 'Not provided' && value) {
                displayValue = value;
            }

            el.textContent = displayValue;
        });
    };

    const updateProgressTracker = (newStep) => {
        currentStep = newStep;
        const allSteps = [...topTrackerSteps, ...innerTrackerSteps];
        const allConnectors = [...topConnectors, ...innerConnectors];

        allSteps.forEach(step => {
            const stepNum = parseInt(step.getAttribute('data-step'));
            if (stepNum <= newStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        allConnectors.forEach(connector => {
            const connectorNums = connector.getAttribute('data-connector').split('-').map(Number);
            if (connectorNums[0] < newStep) {
                connector.classList.add('active');
            } else {
                connector.classList.remove('active');
            }
        });
    };
    
    // Inside info.js
const updateSuccessSummary = (refNumber) => {
    // FALLBACK: Create a random ID (no 'APP-' prefix, and will be uppercased later)
    // The fallback ID you were seeing before might have come from older or failed logic.
    const fallbackId = Math.floor(1000000000 + Math.random() * 9000000000).toString(); 
    
    // Use the document ID if available, otherwise use the fallback ID.
    let finalRefId = refNumber || fallbackId;

    // Apply the uppercase conversion to the Document ID (e.g., "Ozjtx1bKSpobihOjmyaP" -> "OZJTX1BKSPOSIHOJMYAP")
    finalRefId = finalRefId.toUpperCase();
    
    if (document.getElementById('app-reference-number')) {
        document.getElementById('app-reference-number').textContent = finalRefId;
    }
    
    // ... (The rest of the function remains the same, handling dates and summary data)
    const submissionDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    if (document.querySelector('[data-summary="fullName"]')) {
         document.querySelector('[data-summary="fullName"]').textContent = collectedData.fullName || 'Not provided';
    }
    if (document.querySelector('[data-summary="startupName"]')) {
         document.querySelector('[data-summary="startupName"]').textContent = collectedData.startupName || 'Not provided';
    }
    if (document.querySelector('[data-summary="submissionDate"]')) {
         document.querySelector('[data-summary="submissionDate"]').textContent = submissionDate;
    }
    if (document.querySelector('[data-summary="industry"]')) {
         document.querySelector('[data-summary="industry"]').textContent = collectedData.industry || 'Not provided';
    }
};
        
    const showSuccessPage = (refId) => {
        const btn = document.querySelector('.btn-submit');
        updateSuccessSummary(refId);
        if (formStepsWrapper) formStepsWrapper.classList.add('hidden');
        if (topTracker) topTracker.classList.add('hidden');
        if (innerTracker) innerTracker.classList.add('hidden');
        
        if (formCardMain) formCardMain.classList.add('success-view');
        if (successStep) successStep.classList.remove('hidden');
        if (btn) {
            btn.innerHTML = 'Submitted <span class="loader"></span>';
            btn.disabled = false;
        }
        if (forms[0]) forms[0].reset();
    };

    const goToStep = (stepNumber) => {
        steps.forEach(step => {
            if (!step) return;
            const stepNum = parseInt(step.getAttribute('data-step'));
            if (stepNum === stepNumber) {
                step.classList.remove('hidden');
            } else {
                step.classList.add('hidden');
            }
        });

        if (successStep) successStep.classList.add('hidden');
        if (formCardMain) formCardMain.classList.remove('success-view');
        if (topTracker) topTracker.classList.remove('hidden');
        if (innerTracker) innerTracker.classList.remove('hidden');

        if (stepNumber === 4) {
            updateReviewStep();
        }
        
        updateProgressTracker(stepNumber);
    };
    
    forms.forEach((form, index) => {
        const nextStep = index + 2;
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                collectFormData(form); 
                goToStep(nextStep);
            });
        }
    });

    const previousButtons = document.querySelectorAll('.btn-previous');
    previousButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (currentStep > 1) {
                goToStep(currentStep - 1);
            }
        });
    });

    const submitButton = document.querySelector('.btn-submit');
    if (submitButton) {
        if (typeof saveApplication !== 'function') {
            console.error("saveApplication is not available. Ensure saveInfo.js exports it.");
            return;
        }

        submitButton.addEventListener('click', () => {
            collectedData.submittedAt = new Date().toISOString();
            
            submitButton.disabled = true;

            saveApplication(collectedData)
                .then(response => {
                    const refId = response && response.refId ? response.refId : null;
                    showSuccessPage(refId);
                })
                .catch(error => {
                    console.error("Submission failed:", error);
                    alert("Submission failed. Please check the console.");
                    submitButton.disabled = false;
                });
        });
        
        const submitAnotherButton = document.querySelector('.btn-submit-another');
        if (submitAnotherButton) {
            submitAnotherButton.addEventListener('click', () => {
                 window.location.reload(); 
            });
        }
    }

    goToStep(1); 
});