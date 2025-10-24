import { saveApplication } from "./saveInfo.js";

document.addEventListener('DOMContentLoaded', () => {
    const personalInfoStep = document.getElementById('personal-info-step');
    const startupDetailsStep = document.getElementById('startup-details-step');
    const teamSupportStep = document.getElementById('team-support-step');
    const reviewStep = document.getElementById('review-step');

    const steps = [personalInfoStep, startupDetailsStep, teamSupportStep, reviewStep];
    const forms = [
        document.getElementById('personal-info-form'),
        document.getElementById('startup-details-form'),
        document.getElementById('team-support-form')
    ]; // Note: Exclude 'review-step' as it's not a true form with input fields
    
    const topTrackerSteps = document.querySelectorAll('.top-progress-tracker .step');
    const innerTrackerSteps = document.querySelectorAll('.inner-progress-tracker .step');
    const topConnectors = document.querySelectorAll('.top-progress-tracker .connector');
    const innerConnectors = document.querySelectorAll('.inner-progress-tracker .connector');

    let currentStep = 4; 
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
            
            // Handle checkbox array (Support Needed)
            if (fieldId === 'supportNeeded' && Array.isArray(value)) {
                value = value.length > 0 ? value.join(', ') : '';
            }
            
            let displayValue = value || 'Not provided';

            // Check if the default review content is 'N/A' to maintain that label if still empty
            const defaultText = el.getAttribute('data-default-text') || el.textContent; 
            el.setAttribute('data-default-text', defaultText); // Store default text once

            if (!value && defaultText === 'N/A') {
                displayValue = 'N/A';
            } else if (value) {
                displayValue = value;
            } else {
                displayValue = 'Not provided';
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

        if (stepNumber === 4) {
            updateReviewStep();
        }
        
        updateProgressTracker(stepNumber);
    };

    // Function to reset all forms and collected data
    const resetApplication = () => {
        // 1. Reset all step forms
        forms.forEach(form => {
            if (form && typeof form.reset === 'function') {
                form.reset();
            }
        });
        
        // 2. Clear collected data object
        collectedData = {}; 

        // 3. Clear review step content back to defaults
        updateReviewStep(); // Calling this on an empty collectedData will set values back to 'Not provided'/'N/A'
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
            console.log("Saving complete application data to Firebase:", collectedData);

            saveApplication(collectedData)
                .then(() => {
                    alert("Application submitted successfully! Starting a new application...");
                    
                    // 1. Reset all form data
                    resetApplication();

                    // 2. Navigate back to the first step
                    goToStep(1);

                })
                .catch(error => {
                    console.error("Submission failed:", error);
                    alert("Submission failed. Please check the console.");
                });
        });
    }

    goToStep(1);
});