let allProjects = [];
let allNewsEvents = [];
const projectsContainer = document.getElementById('cardsGrid');
const newsContainer = document.querySelector('.news-cards');
const searchInput = document.querySelector('.filter-item.search input');
const sdgFilterIcons = document.querySelectorAll('.sdg-icon-wrapper');
const projectResultsInfo = document.querySelectorAll('.results-info p')[0];
const newsResultsInfo = document.querySelectorAll('.results-info p')[1];

let activeSdg = 9;

document.addEventListener('DOMContentLoaded', async () => {
    await fetchAllData();
    filterAndDisplay(activeSdg, '');
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        filterAndDisplay(activeSdg, searchTerm);
    });

    sdgFilterIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            const newSdg = parseInt(icon.getAttribute('data-sdg'));
            
            sdgFilterIcons.forEach(i => i.classList.remove('active'));
            icon.classList.add('active');
            
            activeSdg = newSdg;
            searchInput.value = '';
            filterAndDisplay(activeSdg, '');
        });
    });
});

async function fetchAllData() {
    try {
        const projectsSnapshot = await window.db.collection('projects').get();
        allProjects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const newsEventsSnapshot = await window.db.collection('news-events').get();
        allNewsEvents = newsEventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    } catch (error) {
        console.error("Error fetching data:", error);
        projectsContainer.innerHTML = `<p style="font-family: Poppins, sans-serif; text-align: center; width: 100%;">Error loading projects from database.</p>`;
        newsContainer.innerHTML = `<p style="font-family: Poppins, sans-serif; text-align: center; width: 100%;">Error loading news and events from database.</p>`;
    }
}

function filterAndDisplay(sdg, searchTerm) {
    const filteredProjects = allProjects.filter(project => {
        const matchesSdg = project.sdg === sdg;
        const matchesSearch = project.name.toLowerCase().includes(searchTerm) || 
                              (project.category ? project.category.toLowerCase().includes(searchTerm) : false) || 
                              (project.sdg ? project.sdg.toString() === searchTerm : false); 
        return matchesSdg && matchesSearch;
    });

    const filteredNewsEvents = allNewsEvents.filter(event => {
        const eventSdgArray = Array.isArray(event.sdg) ? event.sdg : [event.sdg];
        const matchesSdg = eventSdgArray.includes(sdg);
        const matchesSearch = event.title.toLowerCase().includes(searchTerm) || 
                              (event.tag ? event.tag.toLowerCase().includes(searchTerm) : false) || 
                              eventSdgArray.map(s => s.toString()).includes(searchTerm);
        return matchesSdg && matchesSearch;
    });

    projectResultsInfo.textContent = `Showing ${filteredProjects.length} related projects`;
    newsResultsInfo.textContent = `Showing ${filteredNewsEvents.length} related news & events`;
    
    renderProjects(filteredProjects);
    renderNews(filteredNewsEvents);
}

function renderProjects(projects) {
    projectsContainer.innerHTML = ''; 

    if (projects.length === 0) {
        projectsContainer.innerHTML = `<p style="font-family: Poppins, sans-serif; text-align: center; width: 100%; margin-top: 20px;">No projects found for the selected SDG and search term.</p>`;
        return;
    }

    projects.forEach(project => {
        const projectCard = document.createElement('article');
        projectCard.className = 'startup-card';
        projectCard.setAttribute('data-category', (project.category || '').toLowerCase());
        
        projectCard.innerHTML = `
            <div class="card-head">
                <img src="${project.logoUrl || 'graphics/sunshare.png'}" alt="${project.name || 'Startup'} logo" class="startup-logo">
                <div class="card-meta">
                    <h3 class="startup-name" style="font-family: Poppins, sans-serif;">${project.name || 'Untitled Project'}</h3>
                    <div class="tags">
                        ${project.category ? `<span class="tag" style="font-family: Poppins, sans-serif;">${project.category}</span>` : ''}
                        ${project.trl ? `<span class="tag small" style="font-family: Poppins, sans-serif;">${project.trl}</span>` : ''}
                        ${project.sdg ? `<span class="tag small" style="font-family: Poppins, sans-serif;">SDG ${project.sdg}</span>` : ''}
                    </div>
                </div>
            </div>
            <p class="startup-desc" style="font-family: Poppins, sans-serif;">${project.desc || 'No description available.'}</p>
            <a href="${project.link || '#'}" class="card-cta" style="font-family: Poppins, sans-serif;">View More <span class="cta-circle">➜</span></a>
        `;
        projectsContainer.appendChild(projectCard);
    });
}

function renderNews(newsEvents) {
    newsContainer.innerHTML = ''; 
    
    if (newsEvents.length === 0) {
        newsContainer.innerHTML = `<p style="font-family: Poppins, sans-serif; text-align: center; width: 100%; margin-top: 20px;">No news or events found for the selected SDG and search term.</p>`;
        return;
    }

    newsEvents.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = 'news-card';
        
        eventCard.innerHTML = `
            <img src="${event.imageUrl || 'graphics/news.png'}" alt="News Image">
            <div class="news-content">
                <div class="news-meta">
                    ${event.tag ? `<span class="tag" style="font-family: Poppins, sans-serif;">${event.tag}</span>` : ''}
                    ${event.date ? `<span class="date" style="font-family: Poppins, sans-serif;">${event.date}</span>` : ''}
                </div>
                <h3 class="news-title" style="font-family: Poppins, sans-serif;">${event.title || 'Untitled Event'}</h3>
                <p class="news-desc" style="font-family: Poppins, sans-serif;">${event.desc || 'No description available.'}</p>
                <a href="${event.link || 'newsEventPage.html'}" class="read-more" style="font-family: Poppins, sans-serif;">Read More →</a>
            </div>
        `;
        newsContainer.appendChild(eventCard);
    });
}