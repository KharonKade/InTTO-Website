// Load published news & events from Firestore
document.addEventListener('DOMContentLoaded', async () => {
    const newsCardsContainer = document.querySelector('.news-cards');
    
    if (!newsCardsContainer) {
        console.warn('News cards container not found on this page');
        return;
    }

    // Initialize Firebase if not already initialized
    if (!window.db) {
        console.error('Firebase not initialized! Make sure Firebase scripts are loaded before this script.');
        return;
    }

    // Configuration
    const ITEMS_PER_PAGE = 20; // Limit items per load for performance
    let lastVisible = null;
    let allNewsEvents = [];
    let isLoading = false;

    // Load news & events from Firestore with pagination
    async function loadNewsEvents(loadMore = false) {
        if (isLoading) return;
        
        try {
            isLoading = true;
            
            // Build query with pagination
            let query = db.collection('newsEvents')
                .where('status', '==', 'published')
                .limit(ITEMS_PER_PAGE);
            
            // If loading more, start after last document
            if (loadMore && lastVisible) {
                query = query.startAfter(lastVisible);
            }
            
            const snapshot = await query.get();
            
            if (snapshot.empty && !loadMore) {
                return [];
            }
            
            // Store last visible document for pagination
            lastVisible = snapshot.docs[snapshot.docs.length - 1];
            
            const newsEvents = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                newsEvents.push({
                    id: doc.id,
                    ...data
                });
            });
            
            // Sort manually by date (descending - newest first)
            newsEvents.sort((a, b) => {
                const dateA = a.date ? (typeof a.date === 'string' ? new Date(a.date) : a.date.toDate()) : new Date(0);
                const dateB = b.date ? (typeof b.date === 'string' ? new Date(b.date) : b.date.toDate()) : new Date(0);
                return dateB - dateA;
            });
            
            return newsEvents;
        } catch (error) {
            return [];
        } finally {
            isLoading = false;
        }
    }

    // Render news & events cards
    async function renderNewsEventsCards(loadMore = false) {
        if (!loadMore && window.LoadingScreen) {
            window.LoadingScreen.show('Loading news & events');
        }
        
        const newsEvents = await loadNewsEvents(loadMore);
        
        if (newsEvents.length === 0 && !loadMore) {
            newsCardsContainer.innerHTML = '<p style="text-align: center; color: var(--text-light); grid-column: 1/-1;">No news or events available yet.</p>';
            if (window.LoadingScreen) window.LoadingScreen.hide();
            return;
        }

        // Add to all news events
        allNewsEvents = loadMore ? [...allNewsEvents, ...newsEvents] : newsEvents;

        // Clear existing cards only if not loading more
        if (!loadMore) {
            newsCardsContainer.innerHTML = '';
        }

        newsEvents.forEach((item, index) => {
            // Get the cover image (first image)
            const coverImage = (item.images && item.images.length > 0) 
                ? item.images[0] 
                : 'graphics/news.png'; // Fallback image

            // Format date
            let displayDate = 'N/A';
            if (item.date) {
                if (typeof item.date === 'string') {
                    // Format: YYYY-MM-DD to "Month DD, YYYY"
                    const dateObj = new Date(item.date);
                    displayDate = dateObj.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    });
                } else if (item.date.toDate) {
                    displayDate = item.date.toDate().toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    });
                }
            }

            // Get first tag or type
            const tagText = (item.tags && item.tags.length > 0) 
                ? item.tags[0] 
                : item.type === 'event' ? 'Event' : 'News';

            // Create card
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

            newsCardsContainer.appendChild(card);
        });

        // Hide loading screen
        if (window.LoadingScreen) window.LoadingScreen.hide();

        // Show/hide load more button
        const loadMoreBtn = document.getElementById('load-more-news');
        if (loadMoreBtn) {
            // Show button if we got full page of results (might be more)
            loadMoreBtn.style.display = newsEvents.length === ITEMS_PER_PAGE ? 'block' : 'none';
        }

        // Re-apply any existing filters if function exists
        if (typeof applyCurrentFilter === 'function') {
            applyCurrentFilter();
        }
    }

    // Initial render
    await renderNewsEventsCards();

    // Load more button handler
    const loadMoreBtn = document.getElementById('load-more-news');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', async () => {
            loadMoreBtn.disabled = true;
            loadMoreBtn.textContent = 'Loading...';
            await renderNewsEventsCards(true);
            loadMoreBtn.disabled = false;
            loadMoreBtn.textContent = 'Load More';
        });
    }

    // Optional: Listen for real-time updates (only for first page)
    try {
        db.collection('newsEvents')
            .where('status', '==', 'published')
            .limit(ITEMS_PER_PAGE)
            .onSnapshot(() => {
                lastVisible = null;
                allNewsEvents = [];
                renderNewsEventsCards();
            });
    } catch (error) {
        // Real-time updates won't work but initial load will still function
    }

    // Add filter functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.querySelector('.filter-item.search input');

    if (filterButtons.length > 0) {
        filterButtons.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                // Remove active class from all
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const cards = document.querySelectorAll('.news-card');
                const filterType = index === 0 ? 'all' : (index === 1 ? 'news' : 'event');

                cards.forEach(card => {
                    if (filterType === 'all' || card.dataset.type === filterType) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });

        // Set first button as active
        if (filterButtons[0]) {
            filterButtons[0].classList.add('active');
        }
    }

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('.news-card');

            cards.forEach(card => {
                const title = card.querySelector('.news-title').textContent.toLowerCase();
                const desc = card.querySelector('.news-desc').textContent.toLowerCase();

                if (title.includes(searchTerm) || desc.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
});
