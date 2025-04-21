document.addEventListener('DOMContentLoaded', function() {
    // --- Video Data Loading ---
    const videoGrid = document.getElementById('video-grid');
    let videos = JSON.parse(localStorage.getItem('videos')) || [
        {
            id: 'vid1',
            title: 'Sample Video 1',
            description: 'An exciting action movie.',
            category: 'Action',
            thumbnail: 'assets/thumbnails/sample1.jpg',
            videoFile: 'videos/sample1.mp4'
        },
        {
            id: 'vid2',
            title: 'Sample Video 2',
            description: 'A hilarious comedy.',
            category: 'Comedy',
            thumbnail: 'assets/thumbnails/sample2.jpg',
            videoFile: 'videos/sample2.mp4'
        }
    ];

    // --- UI Elements ---
    const playerContainer = document.getElementById('video-player-container');
    const player = document.getElementById('video-player');
    const closeBtn = document.getElementById('close-player');
    const searchInput = document.getElementById('search-input');
    const categorySelect = document.getElementById('category-select');
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    // --- User Data ---
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

    // --- Helper Functions ---
    function saveUserData() {
        if (currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
    }

    function renderVideos(filter = {}) {
        videoGrid.innerHTML = '';
        let filtered = videos;
        if (filter.search) {
            filtered = filtered.filter(v => v.title.toLowerCase().includes(filter.search.toLowerCase()));
        }
        if (filter.category && filter.category !== 'All') {
            filtered = filtered.filter(v => v.category === filter.category);
        }

        // Group by title for season/episode structure
        const grouped = {};
        filtered.forEach(video => {
            if (!grouped[video.title]) grouped[video.title] = [];
            grouped[video.title].push(video);
        });

        Object.keys(grouped).forEach(title => {
            const show = grouped[title];
            const thumb = document.createElement('div');
            thumb.className = 'video-thumb';
            thumb.innerHTML = `
                <img src="${show[0].thumbnail}" alt="${title}" width="200">
                <p>${title}</p>
                <button class="watch-later-btn" data-id="${show[0].id}">Watch Later</button>
                <div class="star-rating" data-id="${show[0].id}">
                    ${[1,2,3,4,5].map(star => `<span data-star="${star}">&#9733;</span>`).join('')}
                </div>
            `;
            thumb.onclick = (e) => {
                if (e.target.classList.contains('watch-later-btn')) {
                    e.stopPropagation();
                    addToWatchLater(show[0].id);
                } else if (e.target.parentElement.classList.contains('star-rating')) {
                    e.stopPropagation();
                    setRating(show[0].id, parseInt(e.target.dataset.star));
                } else {
                    showSeasonsModal(show);
                }
            };
            setStarRatingUI(thumb.querySelector('.star-rating'), getRating(show[0].id));
            videoGrid.appendChild(thumb);
        });
    }

    // Modal for seasons/episodes
    function showSeasonsModal(show) {
        // Create modal
        let modal = document.getElementById('season-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'season-modal';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100vw';
            modal.style.height = '100vh';
            modal.style.background = 'rgba(0,0,0,0.7)';
            modal.style.display = 'flex';
            modal.style.alignItems = 'center';
            modal.style.justifyContent = 'center';
            modal.style.zIndex = '9999';
            document.body.appendChild(modal);
        }
        // Group by season
        const seasons = {};
        show.forEach(v => {
            if (!seasons[v.season]) seasons[v.season] = [];
            seasons[v.season].push(v);
        });
        let html = `<div style="background:#fff; border-radius:16px; padding:32px; min-width:320px; max-width:90vw; color:#222; text-align:center; position:relative;">
            <button id="close-season-modal" style="position:absolute;top:12px;right:18px;font-size:1.5em;cursor:pointer;background:none;border:none;">&times;</button>
            <h2>${show[0].title}</h2>
            <div>`;
        Object.keys(seasons).sort((a,b)=>a-b).forEach(seasonNum => {
            html += `<h3>Season ${seasonNum}</h3><ul style="list-style:none;padding:0;">`;
            seasons[seasonNum].sort((a,b)=>a.episode-b.episode).forEach(ep => {
                html += `<li style="margin:8px 0;">
                    <button class="episode-btn" data-id="${ep.id}" style="padding:8px 18px;border-radius:8px;background:#a0e9ff;color:#fff;font-weight:bold;border:none;cursor:pointer;margin-right:8px;">
                        Episode ${ep.episode}: ${ep.description}
                    </button>
                </li>`;
            });
            html += `</ul>`;
        });
        html += `</div></div>`;
        modal.innerHTML = html;
        modal.style.display = 'flex';
    
        // Close modal
        document.getElementById('close-season-modal').onclick = () => {
            modal.style.display = 'none';
        };
        // Play episode on click
        modal.querySelectorAll('.episode-btn').forEach(btn => {
            btn.onclick = function() {
                const epId = this.getAttribute('data-id');
                const ep = show.find(v => v.id === epId);
                if (ep) {
                    playVideo(ep);
                    modal.style.display = 'none';
                }
            };
        });
    }

    function playVideo(video) {
        player.src = video.videoFile;
        playerContainer.style.display = 'block';
        addToHistory(video.id);
    }

    closeBtn.onclick = function() {
        playerContainer.style.display = 'none';
        player.pause();
    };

    // --- Watch History ---
    function addToHistory(videoId) {
        if (!currentUser) return;
        currentUser.history = currentUser.history || [];
        if (!currentUser.history.includes(videoId)) {
            currentUser.history.push(videoId);
            saveUserData();
        }
    }

    // --- Watch Later ---
    function addToWatchLater(videoId) {
        if (!currentUser) return alert('Please log in to use Watch Later.');
        currentUser.watchLater = currentUser.watchLater || [];
        if (!currentUser.watchLater.includes(videoId)) {
            currentUser.watchLater.push(videoId);
            saveUserData();
            alert('Added to Watch Later!');
        }
    }

    // --- Star Rating ---
    function getRating(videoId) {
        if (!currentUser) return 0;
        currentUser.ratings = currentUser.ratings || {};
        return currentUser.ratings[videoId] || 0;
    }
    function setRating(videoId, rating) {
        if (!currentUser) return alert('Please log in to rate videos.');
        currentUser.ratings = currentUser.ratings || {};
        currentUser.ratings[videoId] = rating;
        saveUserData();
        renderVideos(getCurrentFilter());
    }
    function setStarRatingUI(starDiv, rating) {
        if (!starDiv) return;
        Array.from(starDiv.children).forEach(span => {
            span.style.color = (parseInt(span.dataset.star) <= rating) ? '#FFD700' : '#ccc';
        });
    }

    // --- Search & Category ---
    function getCurrentFilter() {
        return {
            search: searchInput ? searchInput.value : '',
            category: categorySelect ? categorySelect.value : 'All'
        };
    }
    if (searchInput) {
        searchInput.addEventListener('input', () => renderVideos(getCurrentFilter()));
    }
    if (categorySelect) {
        categorySelect.addEventListener('change', () => renderVideos(getCurrentFilter()));
        // Populate categories
        const cats = ['All', ...new Set(videos.map(v => v.category))];
        categorySelect.innerHTML = cats.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    }

    // --- Dark Mode ---
    if (darkModeToggle) {
        darkModeToggle.checked = localStorage.getItem('darkMode') === 'true';
        setDarkMode(darkModeToggle.checked);
        darkModeToggle.addEventListener('change', function() {
            setDarkMode(this.checked);
            localStorage.setItem('darkMode', this.checked);
        });
    }
    function setDarkMode(enabled) {
        document.body.classList.toggle('dark-mode', enabled);
    }

    // --- Initial Render ---
    renderVideos();

    // --- Expose for debugging ---
    window._videos = videos;
    window._currentUser = currentUser;
});

document.addEventListener('DOMContentLoaded', function() {
    const videoGrid = document.getElementById('video-grid');
    if (videoGrid) {
        videoGrid.addEventListener('click', function(e) {
            // Find the closest video thumb (fix selector)
            const videoItem = e.target.closest('.video-thumb');
            if (videoItem) {
                const currentUser = localStorage.getItem('currentUser');
                if (!currentUser) {
                    alert("Please Login.\nIf You Don't Have An Account To Login Then Please Buy Our Subscription.\nTo Buy Subscription Contact:\nInstagram - @srh.nishant\nTelegram - @srh.nisahnt");
                    e.preventDefault();
                    return;
                }
                // playVideo(video); // This line is not needed here, as your modal logic handles playback
            }
        });
    }
});