// ...existing code...
import { saveApplication } from "./saveInfo.js";
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('personal-info-form') || document.getElementById('startup-details-form');
    if (!form) {
        console.warn("Form with id 'personal-info-form' not found.");
        return;
    }

    if (typeof saveApplication !== 'function') {
        console.error("saveApplication is not available. Ensure saveInfo.js exports it.");
        return;
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const yearEl = document.getElementById('yearLevel');
        const yearLevelValue = yearEl ? yearEl.value : '';

        const deptCollegeEl = document.getElementById('deptCollege');
        const deptCollege = deptCollegeEl ? deptCollegeEl.value : '';

    // Safely read optional fields (may be absent depending on which form is present)
        const industry = document.getElementById('industry')?.value || '';

        const currentStageEl = document.getElementById('currentStage');
        const currentStage = currentStageEl ? currentStageEl.value : '';

        const formData = {
            // Personal-info fields (guarded in case form doesn't include them)
            fullName: document.getElementById('fullName')?.value || '',
            email: document.getElementById('email')?.value || '',
            phone: document.getElementById('phone')?.value || '',
            studentId: document.getElementById('studentId')?.value || '',
            yearLevel: yearLevelValue,
            departmentCollege: deptCollege,

            // Startup-related fields (these may be missing on the personal-info form)
            startupName: document.getElementById('startupName')?.value || '',
            industry: industry,
            currentStage: currentStage,
            briefDescription: document.getElementById('briefDescription')?.value || '',
            problemSolution: document.getElementById('problemSolution')?.value || '',
            targetMarket: document.getElementById('targetMarket')?.value || '',
            websiteSocial: document.getElementById('websiteSocial')?.value || '',

            submittedAt: new Date().toISOString()
        };

        // Ensure saveApplication is available (scriptoad ord ler matters)
        saveApplication(formData);
    });
});
// ...existing code...