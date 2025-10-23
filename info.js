// ...existing code...
import { saveApplication } from "./saveInfo.js";
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('personal-info-form');
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
        
        // --- Existing Year Level Logic (to keep it clean, though .value often suffices) ---
        // --- FIXED Year Level Logic ---
        const yearEl = document.getElementById('yearLevel');
        // Simply use .value, which returns the 'value' attribute of the selected option.
        const yearLevelValue = yearEl ? yearEl.value : '';
        // -----------------------------------------------------------------------------------

        // **New: Get the Department/College value**
        const deptCollegeEl = document.getElementById('deptCollege');
        const deptCollege = deptCollegeEl ? deptCollegeEl.value : '';


        const formData = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            studentId: document.getElementById('studentId').value,
            yearLevel: yearLevelValue, 
            departmentCollege: deptCollege, 

            submittedAt: new Date().toISOString()
        };

        // Ensure saveApplication is available (script load order matters)
        saveApplication(formData);
    });
});
// ...existing code...