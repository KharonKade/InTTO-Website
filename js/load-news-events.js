document.addEventListener('DOMContentLoaded', async () => {
    const mainNewsCardsContainer = document.getElementById('news-cards-container');
    const simpleNewsCardsContainer = document.querySelector('.news-section .news-cards');
    
    if (!window.db) {
        return;
    }

    // --- Logic for the Main Events Page (Pagination) ---
    if (mainNewsCardsContainer) {
        const paginationContainer = document.getElementById('pagination-container');
        const filterButtons = document.querySelectorAll('.filter-btn');
        const searchInput = document.getElementById('search-input');

        const PAGE_SIZE = 6;
        let allNewsEvents = [];
        let currentPage = 1;
        let currentFilter = 'all';
        let currentSearchTerm = '';
        let filteredNewsEvents = [];

        async function loadAllNewsEvents() {
            try {
                if (window.LoadingScreen) {
                    window.LoadingScreen.show('Loading news & events');
                }
                
                const snapshot = await db.collection('newsEvents')
                    .where('status', '==', 'published')
                    .get();
                
                const newsEvents = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    newsEvents.push({
                        id: doc.id,
                        ...data
                    });
                });
                
                newsEvents.sort((a, b) => {
                    const dateA = a.date ? (typeof a.date === 'string' ? new Date(a.date) : a.date.toDate()) : new Date(0);
                    const dateB = b.date ? (typeof b.date === 'string' ? new Date(b.date) : b.date.toDate()) : new Date(0);
                    return dateB - dateA;
                });
                
                allNewsEvents = newsEvents;
                
                if (window.LoadingScreen) window.LoadingScreen.hide();
                
            } catch (error) {
                if (window.LoadingScreen) window.LoadingScreen.hide();
            }
        }

        function applyFiltersAndSearch() {
            filteredNewsEvents = allNewsEvents.filter(item => {
                const itemType = item.type || 'news'; 
                
                const matchesFilter = currentFilter === 'all' || itemType === currentFilter;
                
                if (currentSearchTerm) {
                    const title = (item.title || '').toLowerCase();
                    const content = (item.content || '').toLowerCase();
                    const tags = (item.tags || []).join(' ').toLowerCase();
                    
                    const matchesSearch = title.includes(currentSearchTerm) || content.includes(currentSearchTerm) || tags.includes(currentSearchTerm);
                    return matchesFilter && matchesSearch;
                }
                
                return matchesFilter;
            });
            
            currentPage = 1;
            renderNewsEventsCards(mainNewsCardsContainer);
            renderPagination(paginationContainer);
        }

        function createNewsCard(item) {
            const coverImage = (item.images && item.images.length > 0) 
                ? item.images[0] 
                : 'graphics/news.png';

            let displayDate = 'N/A';
            if (item.date) {
                let dateObj;
                if (typeof item.date === 'string') {
                    dateObj = new Date(item.date);
                } else if (item.date.toDate) {
                    dateObj = item.date.toDate();
                }
                if (dateObj) {
                    displayDate = dateObj.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    });
                }
            }

            const tagText = (item.tags && item.tags.length > 0) 
                ? item.tags[0] 
                : item.type === 'event' ? 'Event' : 'News';

            const card = document.createElement('div');
            card.className = 'news-card';
            card.dataset.newsId = item.id;
            card.dataset.type = item.type || 'news';
            
            card.innerHTML = `
                <img src="${coverImage}" alt="${item.title}" onerror="this.src='graphics/news.png'">
                <div class="news-content">
                    <div class="news-meta">
                        <span class="tag">${tagText}</span>
                        <span class="date">${displayDate}</span>
                    </div>
                    <h3 class="news-title">${item.title || 'Untitled'}</h3>
                    <p class="news-desc">${(item.content || '').substring(0, 150)}...</p>
                    <a href="newsEventPage.html?id=${item.id}" class="read-more">Read More →</a>
                </div>
            `;
            return card;
        }

        function renderNewsEventsCards(container) {
            container.innerHTML = '';
            
            const totalItems = filteredNewsEvents.length;
            const totalPages = Math.ceil(totalItems / PAGE_SIZE);

            if (totalItems === 0) {
                container.innerHTML = '<p style="text-align: center; color: var(--text-light); grid-column: 1/-1;">No news or events match your current selection.</p>';
                return;
            }

            const startIndex = (currentPage - 1) * PAGE_SIZE;
            const endIndex = startIndex + PAGE_SIZE;
            const itemsToDisplay = filteredNewsEvents.slice(startIndex, endIndex);

            itemsToDisplay.forEach(item => {
                container.appendChild(createNewsCard(item));
            });

            if (currentPage > totalPages) {
                currentPage = 1; 
                renderNewsEventsCards(container);
            }
        }

        function renderPagination(container) {
            container.innerHTML = '';
            
            const totalItems = filteredNewsEvents.length;
            const totalPages = Math.ceil(totalItems / PAGE_SIZE);

            if (totalPages <= 1) {
                container.style.display = 'none';
                return;
            }

            container.style.display = 'flex';
            
            const prevButton = document.createElement('a');
            prevButton.href = '#';
            prevButton.className = `page-btn arrow prev ${currentPage === 1 ? 'disabled' : ''}`;
            prevButton.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
            prevButton.addEventListener('click', (e) => {
                e.preventDefault();
                if (currentPage > 1) {
                    currentPage--;
                    renderNewsEventsCards(mainNewsCardsContainer);
                    renderPagination(container);
                }
            });
            container.appendChild(prevButton);

            for (let i = 1; i <= totalPages; i++) {
                const pageButton = document.createElement('a');
                pageButton.href = '#';
                pageButton.className = `page-btn ${i === currentPage ? 'active' : ''}`;
                pageButton.textContent = i;
                pageButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (i !== currentPage) {
                        currentPage = i;
                        renderNewsEventsCards(mainNewsCardsContainer);
                        renderPagination(container);
                    }
                });
                container.appendChild(pageButton);
            }

            const nextButton = document.createElement('a');
            nextButton.href = '#';
            nextButton.className = `page-btn arrow next ${currentPage === totalPages ? 'disabled' : ''}`;
            nextButton.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
            nextButton.addEventListener('click', (e) => {
                e.preventDefault();
                if (currentPage < totalPages) {
                    currentPage++;
                    renderNewsEventsCards(mainNewsCardsContainer);
                    renderPagination(container);
                }
            });
            container.appendChild(nextButton);
        }
        
        if (filterButtons.length > 0) {
            filterButtons.forEach((btn) => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    filterButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    const filterId = btn.id;
                    
                    let selectedType = filterId.replace('filter-', '');
                    if (selectedType === 'news') {
                        selectedType = 'news';
                    } else if (selectedType === 'events') {
                        selectedType = 'event'; 
                    } else {
                        selectedType = 'all';
                    }
                    
                    currentFilter = selectedType;
                    
                    applyFiltersAndSearch();
                });
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                currentSearchTerm = e.target.value.toLowerCase();
                applyFiltersAndSearch();
            });
        }
        
        await loadAllNewsEvents();
        applyFiltersAndSearch();

        try {
            db.collection('newsEvents')
                .where('status', '==', 'published')
                .onSnapshot(() => {
                    loadAllNewsEvents().then(applyFiltersAndSearch);
                });
        } catch (error) {
        }
    } 
    
    // --- Logic for the Home Page Section (3 Latest Items) ---
    else if (simpleNewsCardsContainer) {
        
        // Helper function for creating a card (reused from above)
        function createNewsCard(item) {
            const coverImage = (item.images && item.images.length > 0) 
                ? item.images[0] 
                : 'graphics/news.png';

            let displayDate = 'N/A';
            if (item.date) {
                let dateObj;
                if (typeof item.date === 'string') {
                    dateObj = new Date(item.date);
                } else if (item.date.toDate) {
                    dateObj = item.date.toDate();
                }
                if (dateObj) {
                    displayDate = dateObj.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    });
                }
            }

            const tagText = (item.tags && item.tags.length > 0) 
                ? item.tags[0] 
                : item.type === 'event' ? 'Event' : 'News';

            const card = document.createElement('div');
            card.className = 'news-card';
            card.dataset.newsId = item.id;
            card.dataset.type = item.type || 'news';
            
            card.innerHTML = `
                <img src="${coverImage}" alt="${item.title}" onerror="this.src='graphics/news.png'">
                <div class="news-content">
                    <div class="news-meta">
                        <span class="tag">${tagText}</span>
                        <span class="date">${displayDate}</span>
                    </div>
                    <h3 class="news-title">${item.title || 'Untitled'}</h3>
                    <p class="news-desc">${(item.content || '').substring(0, 100)}...</p>
                    <a href="newsEventPage.html?id=${item.id}" class="read-more">Read More →</a>
                </div>
            `;
            return card;
        }

        async function loadLatestNewsEvents() {
            try {
                const snapshot = await db.collection('newsEvents')
                    .where('status', '==', 'published')
                    .orderBy('date', 'desc')
                    .limit(3)
                    .get();
                
                if (snapshot.empty) {
                    simpleNewsCardsContainer.innerHTML = '<p style="text-align: center; color: var(--text-light); grid-column: 1/-1;">No recent news or events available.</p>';
                    return;
                }

                simpleNewsCardsContainer.innerHTML = '';
                snapshot.forEach(doc => {
                    const item = doc.data();
                    item.id = doc.id;
                    simpleNewsCardsContainer.appendChild(createNewsCard(item));
                });

            } catch (error) {
                simpleNewsCardsContainer.innerHTML = '<p style="text-align: center; color: red; grid-column: 1/-1;">Error loading news.</p>';
            }
        }

        await loadLatestNewsEvents();
    }
});