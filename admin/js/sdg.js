document.addEventListener('DOMContentLoaded', () => {
    // --- Chart.js Instance ---
    let sdgChart = null;

    // --- DOM Elements ---
    const tabs = document.querySelectorAll('.tab-btn');
    const totalUsageEl = document.getElementById('total-sdg-usage');
    const uniqueSdgsEl = document.getElementById('unique-sdgs');
    const itemCountEl = document.getElementById('item-count');
    const itemCountLabelEl = document.getElementById('item-count-label');
    const chartCanvas = document.getElementById('sdgPieChart');

    // --- SDG Colors (Official) ---
    const SDG_COLORS = {
        1: '#E5243B',  // No Poverty
        2: '#DDA63A',  // Zero Hunger
        3: '#4C9F38',  // Good Health
        4: '#C5192D',  // Quality Education
        5: '#FF3A21',  // Gender Equality
        6: '#26BDE2',  // Clean Water
        7: '#FCC30B',  // Clean Energy
        8: '#A21942',  // Decent Work
        9: '#FD6925',  // Industry, Innovation
        10: '#DD1367', // Reduced Inequalities
        11: '#FD9D24', // Sustainable Cities
        12: '#BF8B2E', // Responsible Consumption
        13: '#3F7E44', // Climate Action
        14: '#0A97D9', // Life Below Water
        15: '#56C02B', // Life on Land
        16: '#00689D', // Peace, Justice
        17: '#19486A'  // Partnerships
    };

    const SDG_NAMES = {
        1: 'SDG 1: No Poverty',
        2: 'SDG 2: Zero Hunger',
        3: 'SDG 3: Good Health',
        4: 'SDG 4: Quality Education',
        5: 'SDG 5: Gender Equality',
        6: 'SDG 6: Clean Water',
        7: 'SDG 7: Clean Energy',
        8: 'SDG 8: Decent Work',
        9: 'SDG 9: Industry, Innovation',
        10: 'SDG 10: Reduced Inequalities',
        11: 'SDG 11: Sustainable Cities',
        12: 'SDG 12: Responsible Consumption',
        13: 'SDG 13: Climate Action',
        14: 'SDG 14: Life Below Water',
        15: 'SDG 15: Life on Land',
        16: 'SDG 16: Peace, Justice',
        17: 'SDG 17: Partnerships'
    };


    // --- Load Data from LocalStorage ---
    const loadData = (key) => {
        const savedData = localStorage.getItem(key);
        return savedData ? JSON.parse(savedData) : [];
    };

    // --- Main Function to Update Dashboard ---
    const updateDashboard = (filter) => {
        // Load all data
        const startups = loadData('ucInttoStartupsData');
        const newsEvents = loadData('ucInttoNewsEventsData');

        let itemsToProcess = [];
        let itemCountLabel = 'Items';

        // Filter data based on tab
        if (filter === 'all') {
            itemsToProcess = [...startups, ...newsEvents];
            itemCountLabel = 'Total Items';
        } else if (filter === 'startup') {
            itemsToProcess = startups;
            itemCountLabel = 'Startups';
        } else if (filter === 'news_event') {
            itemsToProcess = newsEvents;
            itemCountLabel = 'News & Events';
        }

        // Process the data
        let totalUsage = 0;
        let itemCount = 0;
        const sdgFrequency = {};

        itemsToProcess.forEach(item => {
            // =================================================================
            // !!! IMPORTANT ASSUMPTION !!!
            // This code assumes your startup/news items will have an array
            // called 'sdgs' like this: item.sdgs = [9, 11, 17]
            // We need to add this field to the modals in startups.js and news-events.js
            // =================================================================
            const itemSDGs = item.sdgs || []; 

            if (itemSDGs.length > 0) {
                itemCount++;
                totalUsage += itemSDGs.length;

                // Count frequency of each SDG
                itemSDGs.forEach(sdgNum => {
                    if (sdgNum >= 1 && sdgNum <= 17) {
                        sdgFrequency[sdgNum] = (sdgFrequency[sdgNum] || 0) + 1;
                    }
                });
            }
        });

        const uniqueSdgs = Object.keys(sdgFrequency).length;

        // --- Update Stat Cards ---
        totalUsageEl.textContent = totalUsage;
        uniqueSdgsEl.textContent = uniqueSdgs;
        itemCountEl.textContent = itemCount;
        itemCountLabelEl.textContent = itemCountLabel;

        // --- Prepare Chart Data ---
        const sortedSdgs = Object.keys(sdgFrequency).sort((a, b) => sdgFrequency[b] - sdgFrequency[a]);
        
        const chartData = {
            labels: sortedSdgs.map(sdg => SDG_NAMES[sdg] || `SDG ${sdg}`),
            datasets: [{
                data: sortedSdgs.map(sdg => sdgFrequency[sdg]),
                backgroundColor: sortedSdgs.map(sdg => SDG_COLORS[sdg] || '#cccccc'),
                borderColor: '#ffffff',
                borderWidth: 2
            }]
        };

        // --- Render the Chart ---
        renderPieChart(chartData);
    };

    // --- Function to Render Pie Chart ---
    const renderPieChart = (data) => {
        if (!chartCanvas) return;

        // If a chart instance exists, destroy it first
        if (sdgChart) {
            sdgChart.destroy();
        }

        // Create new chart
        sdgChart = new Chart(chartCanvas, {
            type: 'doughnut', // Pie chart (doughnut has the hole in the middle like screenshots)
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                family: "'Inter', sans-serif",
                                size: 12
                            }
                        }
                    }
                }
            }
        });
    };

    // --- Tab Event Listeners ---
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active tab style
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update dashboard with the new filter
            const filter = tab.dataset.filter;
            updateDashboard(filter);
        });
    });

    // --- Initial Load ---
    updateDashboard('all'); // Load the 'All' tab by default
});