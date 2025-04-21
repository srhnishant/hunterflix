document.addEventListener('DOMContentLoaded', function() {
    const profileInfo = document.getElementById('profile-info');
    const watchLaterDiv = document.getElementById('watch-later');
    let user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Show account info
    profileInfo.innerHTML = `
        <img src="${user.profilePic}" alt="Profile Picture" width="80"><br>
        <strong>Name:</strong> ${user.name || 'N/A'}<br>
        <strong>Email:</strong> ${user.email || 'N/A'}<br>
        <strong>Age:</strong> ${user.age || 'N/A'}
    `;

    // Show Watch Later videos with titles
    let videos = JSON.parse(localStorage.getItem('videos')) || [];
    if (user.watchLater && user.watchLater.length) {
        let html = '<ul>';
        user.watchLater.forEach(id => {
            const video = videos.find(v => v.id === id);
            if (video) {
                html += `<li><strong>${video.title}</strong> (${video.category})</li>`;
            } else {
                html += `<li>${id}</li>`;
            }
        });
        html += '</ul>';
        watchLaterDiv.innerHTML = html;
    } else {
        watchLaterDiv.innerHTML = '<p>No videos in Watch Later.</p>';
    }
});