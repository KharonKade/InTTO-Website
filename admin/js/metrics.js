document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'ucInttoMetricsData';

    // **UPDATED** data structure (only one 'value' field)
    const defaultMetrics = [
        { id: 1, name: "Startups Incubated", value: "77", color: "#1C7F56", description: "Number of startups that have successfully completed or are currently undergoing the incubation program.", icon: "fa-solid fa-building" },
        { id: 2, name: "Investments Received", value: "₱11.6M+", color: "#6A5ACD", description: "Total amount of investments secured by incubated startups, in Philippine Pesos.", icon: "fa-solid fa-dollar-sign" },
        { id: 3, name: "IPs Protected", value: "30+", color: "#8A2BE2", description: "Total intellectual properties (patents, copyrights, trademarks, etc.) protected through the TBI.", icon: "fa-solid fa-shield-alt" },
        { id: 4, name: "Jobs Generated", value: "28", color: "#FF6347", description: "Number of full-time and part-time jobs created by startups incubated at the TBI.", icon: "fa-solid fa-users" }
    ];

    // --- Load/Save Data ---
    const loadData = () => {
        const savedData = localStorage.getItem(STORAGE_KEY);
        return savedData ? JSON.parse(savedData) : defaultMetrics;
    };
    const saveData = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(metricsData));
    };
    let metricsData = loadData();
    let editingMetricId = null;

    // --- DOM Elements (Updated) ---
    const metricsGrid = document.getElementById('metrics-grid');
    const exportMetricsBtn = document.getElementById('export-metrics-btn');
    const importMetricsBtn = document.getElementById('import-metrics-btn');
    const importCsvInput = document.getElementById('import-csv-input');
    const metricModalOverlay = document.getElementById('metric-modal-overlay');
    const closeMetricModalBtn = document.getElementById('close-metric-modal-btn');
    const cancelMetricBtn = document.getElementById('cancel-metric-btn');
    const metricForm = document.getElementById('metric-form');
    const metricModalTitle = document.getElementById('metric-modal-title');
    const metricModalSubtitle = document.getElementById('metric-modal-subtitle');
    const submitMetricBtn = document.getElementById('submit-metric-btn');
    const metricNameInput = document.getElementById('metric-name');
    const metricValueInput = document.getElementById('metric-value'); // Renamed
    const metricColorInput = document.getElementById('metric-color');
    const metricColorPreview = document.getElementById('metric-color-preview');
    const metricDescriptionTextarea = document.getElementById('metric-description');


    // --- Render Metrics ---
    const renderMetrics = () => {
        metricsGrid.innerHTML = '';
        metricsData.forEach(metric => {
            const card = document.createElement('div');
            card.className = 'metric-card';
            card.dataset.id = metric.id;
            card.dataset.icon = metric.icon;
            card.innerHTML = `
                <button class="edit-metric-btn" title="Edit Metric"><i class="fa-solid fa-pencil"></i></button>
                <div class="metric-main">
                    <i class="${metric.icon} metric-icon" style="color: ${metric.color};"></i>
                    <span class="metric-value" style="color: ${metric.color};">${metric.value}</span>
                </div>
                <h4 class="metric-name">${metric.name}</h4>
                <p class="metric-description">${metric.description}</p>
            `;
            metricsGrid.appendChild(card);
        });
        attachActionListeners();
    };

    // --- Attach Listeners to Dynamic Buttons ---
    const attachActionListeners = () => {
        document.querySelectorAll('.edit-metric-btn').forEach(button => {
            button.addEventListener('click', e => {
                const id = parseInt(e.target.closest('.metric-card').dataset.id);
                editMetric(id);
            });
        });
    };

    // --- Modal Functions ---
    const openModal = () => metricModalOverlay.classList.add('active');
    const closeModal = () => {
        metricModalOverlay.classList.remove('active');
        metricForm.reset();
        editingMetricId = null;
        metricColorPreview.style.backgroundColor = '#1C7F56';
    };

    // --- CRUD Functions (Updated) ---
    const editMetric = (id) => {
        const metric = metricsData.find(item => item.id === id);
        if (!metric) return;
        editingMetricId = id;
        metricNameInput.value = metric.name;
        metricValueInput.value = metric.value; // Updated
        metricColorInput.value = metric.color;
        metricDescriptionTextarea.value = metric.description;
        metricColorPreview.style.backgroundColor = metric.color;
        metricModalTitle.textContent = 'Edit Metric';
        metricModalSubtitle.textContent = 'Update metric information';
        submitMetricBtn.textContent = 'Update Metric';
        openModal();
    };

    // --- Export and Import Functions (Updated) ---
    const exportMetricsToCsv = () => {
        let csvContent = "Metric Name,Value,Color (Hex),Description,Icon Class\n"; // Updated header
        metricsData.forEach(metric => {
            csvContent += `"${metric.name.replace(/"/g, '""')}",`;
            csvContent += `"${metric.value.replace(/"/g, '""')}",`; // Updated
            csvContent += `"${metric.color}",`;
            csvContent += `"${metric.description.replace(/"/g, '""')}",`;
            csvContent += `"${metric.icon}"\n`;
        });
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'uc_intto_metrics.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const importMetricsFromCsv = (file) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            const csvData = event.target.result;
            const lines = csvData.split('\n').slice(1);
            const newMetrics = [];
            let lastId = metricsData.length > 0 ? Math.max(...metricsData.map(m => m.id)) : 0;
            lines.forEach(line => {
                if (line.trim() === '') return;
                const values = line.split(',');
                // Updated object structure
                const metric = {
                    id: ++lastId,
                    name: values[0].replace(/"/g, ''),
                    value: values[1].replace(/"/g, ''),
                    color: values[2].replace(/"/g, ''),
                    description: values[3].replace(/"/g, ''),
                    icon: values[4].replace(/"/g, '').trim()
                };
                newMetrics.push(metric);
            });
            if (newMetrics.length > 0) {
                if (confirm(`This will replace all existing metrics with ${newMetrics.length} new ones from the file. Are you sure?`)) {
                    metricsData = newMetrics;
                    saveData();
                    renderMetrics();
                    alert('Metrics updated successfully!');
                }
            } else {
                alert('No valid metrics found in the file.');
            }
        };
        reader.readAsText(file);
    };

    // --- Event Listeners ---
    closeMetricModalBtn.addEventListener('click', closeModal);
    cancelMetricBtn.addEventListener('click', closeModal);
    metricModalOverlay.addEventListener('click', (e) => { if (e.target === metricModalOverlay) closeModal(); });
    metricColorInput.addEventListener('input', (e) => { if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(e.target.value)) metricColorPreview.style.backgroundColor = e.target.value; });

    metricForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Updated formData
        const formData = {
            name: metricNameInput.value,
            value: metricValueInput.value,
            color: metricColorInput.value,
            description: metricDescriptionTextarea.value,
            icon: metricsData.find(m => m.id === editingMetricId)?.icon || "fa-solid fa-chart-simple"
        };
        if (editingMetricId !== null) {
            const index = metricsData.findIndex(item => item.id === editingMetricId);
            if (index !== -1) metricsData[index] = { ...metricsData[index], ...formData };
        }
        saveData();
        renderMetrics();
        closeModal();
    });

    exportMetricsBtn.addEventListener('click', exportMetricsToCsv);
    importMetricsBtn.addEventListener('click', () => { importCsvInput.click(); });
    importCsvInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) { importMetricsFromCsv(file); }
        event.target.value = null;
    });

    // --- Initial Render ---
    renderMetrics();
});