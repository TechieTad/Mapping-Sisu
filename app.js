// Initialize the map centered on Finland
const map = L.map('map').setView([64.0, 26.0], 5);

// Add OpenStreetMap tile layer
L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }
).addTo(map);

// Store markers for filtering
const markers = [];
let locations = [];

// Load the data from JSON file
async function loadLocations() {
    try {
        const response = await fetch('data.json');
        locations = await response.json();
        populateMap(locations);
        updateSidebar(); // Show first location by default
    } catch (error) {
        console.error('Error loading data:', error);
        // Fallback: try inline data
        loadInlineData();
    }
}

// Populate map with markers
function populateMap(data) {
    data.forEach(loc => {
        const marker = L.marker(loc.coords).addTo(map);
        
        // Click event: update sidebar
        marker.on('click', () => {
            updateSidebar(loc);
            highlightMarker(marker);
        });

        // Store marker reference
        marker.locationData = loc;
        markers.push(marker);
    });
}

// Update sidebar with story
function updateSidebar(loc) {
    const container = document.getElementById('story-content');
    
    if (!loc) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Select a marker on the map to explore stories of Finnish resilience.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="story-card">
            <div class="story-title">${loc.title}</div>
            <div class="story-meta">
                <span class="story-category">${loc.category}</span>
                <span class="story-year">${loc.year}</span>
            </div>
            <p class="story-text">${loc.story}</p>
        </div>
    `;
}

// Highlight selected marker
function highlightMarker(marker) {
    markers.forEach(m => {
        m.getElement().style.opacity = '0.6';
    });
    marker.getElement().style.opacity = '1';
}

// Filter markers by category
function filterMarkers(category) {
    markers.forEach(marker => {
        const loc = marker.locationData;
        if (category === 'All' || loc.category === category) {
            marker.addTo(map);
        } else {
            marker.remove();
        }
    });

    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent === category) {
            btn.classList.add('active');
        }
    });

    // Clear sidebar on filter
    updateSidebar(null);
}

// Set up filter buttons
function setupFilters() {
    const categories = ['All', 'Military', 'Modern'];
    const filterContainer = document.getElementById('filters');

    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn' + (cat === 'All' ? ' active' : '');
        btn.textContent = cat;
        btn.onclick = () => filterMarkers(cat);
        filterContainer.appendChild(btn);
    });
}

// Fallback if JSON fails
function loadInlineData() {
    console.log('Using inline data fallback');
    // This runs if fetch() fails in local testing without a server
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    setupFilters();
    loadLocations();
});
