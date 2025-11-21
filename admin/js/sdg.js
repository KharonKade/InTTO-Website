document.addEventListener('DOMContentLoaded', async () => {
    // --- Firestore Collections ---
    const STARTUPS_COLLECTION = 'startups';
    const NEWS_EVENTS_COLLECTION = 'newsEvents';
    
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

    // --- Load Data from Firestore ---
    const loadStartupsFromFirestore = async () => {
        try {
            const snapshot = await db.collection(STARTUPS_COLLECTION).get();
            const startups = [];
            snapshot.forEach(doc => {
                startups.push({
                    firestoreId: doc.id,
                    ...doc.data()
                });
            });
            return startups;
        } catch (error) {
            console.error('❌ Error loading startups:', error);
            return [];
        }
    };

    const loadNewsEventsFromFirestore = async () => {
        try {
            const snapshot = await db.collection(NEWS_EVENTS_COLLECTION).get();
            const newsEvents = [];
            snapshot.forEach(doc => {
                newsEvents.push({
                    firestoreId: doc.id,
                    ...doc.data()
                });
            });
            return newsEvents;
        } catch (error) {
            console.error('❌ Error loading news & events:', error);
            return [];
        }
    };

    // --- Main Function to Update Dashboard ---
    const updateDashboard = async (filter) => {
        console.log('🔄 Updating dashboard with filter:', filter);
        
        // Show loading state
        totalUsageEl.textContent = '...';
        uniqueSdgsEl.textContent = '...';
        itemCountEl.textContent = '...';

        // Load all data from Firestore
        const startups = await loadStartupsFromFirestore();
        const newsEvents = await loadNewsEventsFromFirestore();

        console.log('📊 Loaded data:', { startups: startups.length, newsEvents: newsEvents.length });

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

        console.log('📋 Processing', itemsToProcess.length, 'items for filter:', filter);

        // Process the data
        let totalUsage = 0;
        let itemCount = 0;
        const sdgFrequency = {};

        itemsToProcess.forEach(item => {
            // Get SDGs from item (handle both array of numbers and array of strings)
            let itemSDGs = item.sdgs || [];
            
            // Convert string SDGs to numbers if needed
            if (Array.isArray(itemSDGs)) {
                itemSDGs = itemSDGs.map(sdg => {
                    const num = typeof sdg === 'string' ? parseInt(sdg, 10) : sdg;
                    return isNaN(num) ? null : num;
                }).filter(sdg => sdg !== null);
            }

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

        console.log('📈 Results:', { totalUsage, uniqueSdgs, itemCount, sdgFrequency });

        // --- Update Stat Cards ---
        totalUsageEl.textContent = totalUsage;
        uniqueSdgsEl.textContent = uniqueSdgs;
        itemCountEl.textContent = itemCount;
        itemCountLabelEl.textContent = itemCountLabel;

        // --- Prepare Chart Data ---
        const sortedSdgs = Object.keys(sdgFrequency).sort((a, b) => sdgFrequency[b] - sdgFrequency[a]);
        
        if (sortedSdgs.length === 0) {
            console.log('⚠️ No SDG data to display');
            // No data - show empty chart or message
            renderPieChart({ labels: [], datasets: [{ data: [] }] }, filter);
            return;
        }

        const chartData = {
            labels: sortedSdgs.map(sdg => SDG_NAMES[parseInt(sdg)] || `SDG ${sdg}`),
            datasets: [{
                data: sortedSdgs.map(sdg => sdgFrequency[sdg]),
                backgroundColor: sortedSdgs.map(sdg => SDG_COLORS[parseInt(sdg)] || '#cccccc'),
                borderColor: '#ffffff',
                borderWidth: 2
            }]
        };

        console.log('📊 Chart data prepared:', { 
            labels: chartData.labels.length, 
            dataPoints: chartData.datasets[0].data.length 
        });

        // --- Render the Chart ---
        renderPieChart(chartData, filter);
    };

    // --- Function to Render Pie Chart ---
    const renderPieChart = (data, filter) => {
        console.log('🎨 Rendering chart for filter:', filter);
        
        if (!chartCanvas) {
            console.error('❌ Chart canvas not found');
            return;
        }

        // Check if Chart.js is loaded
        if (typeof Chart === 'undefined') {
            console.error('❌ Chart.js not loaded');
            return;
        }

        // If a chart instance exists, destroy it first
        if (sdgChart) {
            console.log('🗑️ Destroying previous chart instance');
            sdgChart.destroy();
            sdgChart = null;
        }

        // Handle empty data
        if (!data.labels || data.labels.length === 0) {
            console.log('⚠️ No data available for chart');
            // Create a placeholder chart with a message
            const ctx = chartCanvas.getContext('2d');
            ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
            ctx.font = '16px Inter, sans-serif';
            ctx.fillStyle = '#999';
            ctx.textAlign = 'center';
            ctx.fillText('No SDG data available', chartCanvas.width / 2, chartCanvas.height / 2);
            return;
        }

        console.log('✅ Creating new chart with', data.labels.length, 'data points');

        // Create new chart
        sdgChart = new Chart(chartCanvas, {
            type: 'doughnut',
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
                            },
                            padding: 15,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });

        console.log('✅ Chart rendered successfully');
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
    console.log('🎯 SDG Dashboard initializing...');
    console.log('Firebase DB:', db ? '✅ Connected' : '❌ Not connected');
    console.log('Chart.js:', typeof Chart !== 'undefined' ? '✅ Loaded' : '❌ Not loaded');
    
    await updateDashboard('all'); // Load the 'All' tab by default
    
    console.log('✅ SDG Dashboard initialized');
});