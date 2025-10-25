import { saveApplication } from "./saveInfo.js";

document.addEventListener('DOMContentLoaded', () => {
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
    
    const updateSuccessSummary = (refNumber) => {
        const fallbackRefId = 'APP-' + Math.floor(1000000 + Math.random() * 9000000); 
        
        if (document.getElementById('app-reference-number')) {
            document.getElementById('app-reference-number').textContent = refNumber || fallbackRefId;
        }
        
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

    const showSuccessPage = (refNumber) => {
        if (formStepsWrapper) formStepsWrapper.classList.add('hidden');
        if (topTracker) topTracker.classList.add('hidden');
        if (innerTracker) innerTracker.classList.add('hidden');
        
        if (formCardMain) formCardMain.classList.add('success-view');

        updateSuccessSummary(refNumber);
        if (successStep) successStep.classList.remove('hidden');
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