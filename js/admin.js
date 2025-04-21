document.addEventListener('DOMContentLoaded', function() {
    const adminLoginForm = document.getElementById('admin-login-form');
    const adminLoginDiv = document.getElementById('admin-login');
    const videoManagementDiv = document.getElementById('video-management');
    const addVideoForm = document.getElementById('add-video-form');
    const videoListDiv = document.getElementById('video-list');
    const adminAddUserForm = document.getElementById('admin-add-user-form');

    // Hardcoded admin credentials
    const ADMIN_USER = 'admin';
    const ADMIN_PASS = 'sra1ni';

    if (adminLoginForm) {
        adminLoginForm.onsubmit = function(e) {
            e.preventDefault();
            const username = document.getElementById('admin-username').value;
            const password = document.getElementById('admin-password').value;
            if (username === ADMIN_USER && password === ADMIN_PASS) {
                adminLoginDiv.style.display = 'none';
                videoManagementDiv.style.display = 'block';
                renderVideoList();
                renderUserList(); // Add this line
            } else {
                alert('Invalid admin credentials!');
            }
        };
    }

    if (addVideoForm) {
        addVideoForm.onsubmit = async function(e) {
            e.preventDefault();
            let videos = JSON.parse(localStorage.getItem('videos')) || [];
            const id = 'vid' + (videos.length + 1);
            const title = document.getElementById('video-title').value;
            const description = document.getElementById('video-description').value;
            const category = document.getElementById('video-category').value;
            const season = parseInt(document.getElementById('video-season').value);
            const episode = parseInt(document.getElementById('video-episode').value);

            // Get URL inputs
            const thumbnailUrl = document.getElementById('thumbnail-url').value.trim();
            const videoUrl = document.getElementById('video-url').value.trim();

            // Get file inputs
            const thumbnailInput = document.getElementById('video-thumbnail');
            const videoInput = document.getElementById('video-file');
            const thumbnailFile = thumbnailInput && thumbnailInput.files.length > 0 ? thumbnailInput.files[0] : null;
            const videoFile = videoInput && videoInput.files.length > 0 ? videoInput.files[0] : null;

            // Helper to read file as Data URL
            function readFileAsDataURL(file) {
                return new Promise((resolve, reject) => {
                    if (!file) return resolve('');
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            }

            // Use URL if provided, otherwise use file
            let thumbnailData = thumbnailUrl;
            if (!thumbnailData && thumbnailFile) {
                thumbnailData = await readFileAsDataURL(thumbnailFile);
            }

            let videoData = videoUrl;
            if (!videoData && videoFile) {
                videoData = await readFileAsDataURL(videoFile);
            }

            if (!thumbnailData || !videoData) {
                alert('Please provide a thumbnail and a video (either by URL or file).');
                return;
            }

            videos.push({
                id, title, description, category, season, episode,
                thumbnail: thumbnailData,
                videoFile: videoData,
                isEmbed: !!videoUrl // Mark if this is an embed URL
            });

            try {
                localStorage.setItem('videos', JSON.stringify(videos));
            } catch (err) {
                alert('Video is too large to store. Try a smaller file or use a URL.');
                return;
            }

            renderVideoList();
            addVideoForm.reset();
            alert('Video added successfully!');
        };
    }

    function renderVideoList() {
        let videos = JSON.parse(localStorage.getItem('videos')) || [];
        videoListDiv.innerHTML = '';
        if (videos.length === 0) {
            videoListDiv.innerHTML = '<p style="color:#888;">No videos added yet.</p>';
            return;
        }
        videos.forEach((video, idx) => {
            const div = document.createElement('div');
            div.className = 'admin-video-item animate-fadein';
            div.innerHTML = `
                <span style="font-size:1.5em;vertical-align:middle;">🎬</span>
                <strong>${video.title}</strong> <span style="color:#888;">(${video.category})</span>
                <span style="margin-left:10px;color:#a0e9ff;">S${video.season}E${video.episode}</span>
                <button onclick="deleteVideo(${idx})" class="admin-btn"><span style="font-size:1.2em;">🗑️</span> Delete</button>
            `;
            videoListDiv.appendChild(div);
        });
    }

    window.deleteVideo = function(idx) {
        let videos = JSON.parse(localStorage.getItem('videos')) || [];
        videos.splice(idx, 1);
        localStorage.setItem('videos', JSON.stringify(videos));
        renderVideoList();
    };

    function renderUserList() {
        const userListDiv = document.getElementById('user-list');
        let users = JSON.parse(localStorage.getItem('users')) || [];
        userListDiv.innerHTML = '';
        if (users.length === 0) {
            userListDiv.innerHTML = '<p style="color:#888;">No users found.</p>';
            return;
        }
        users.forEach((user, idx) => {
            const div = document.createElement('div');
            div.className = 'admin-user-item animate-fadein';
            div.innerHTML = `
                <span style="font-size:1.5em;vertical-align:middle;">👤</span>
                <strong>${user.name || 'No Name'}</strong> <span style="color:#888;">(${user.email})</span> - Age: ${user.age || 'N/A'}
                <button onclick="deleteUser(${idx})" class="admin-btn" style="margin-left:10px;"><span style="font-size:1.2em;">🗑️</span> Delete</button>
            `;
            userListDiv.appendChild(div);
        });
    }

    window.deleteUser = function(idx) {
        let users = JSON.parse(localStorage.getItem('users')) || [];
        // Get the user to be deleted
        const deletedUser = users[idx];
        users.splice(idx, 1);
        localStorage.setItem('users', JSON.stringify(users));

        // Check if the deleted user is currently logged in
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && deletedUser && currentUser.email === deletedUser.email) {
            localStorage.removeItem('currentUser');
            // Optionally, redirect to login page
            window.location.href = "login.html";
        }

        renderUserList();
    };

    if (adminAddUserForm) {
        adminAddUserForm.onsubmit = function(e) {
            e.preventDefault();
            let users = JSON.parse(localStorage.getItem('users')) || [];
            const name = document.getElementById('new-user-name').value.trim();
            const email = document.getElementById('new-user-email').value.trim();
            const password = document.getElementById('new-user-password').value;

            // Check for duplicate email
            if (users.some(u => u.email === email)) {
                alert('A user with this email already exists.');
                return;
            }

            users.push({ name, email, password });
            localStorage.setItem('users', JSON.stringify(users));
            renderUserList();
            adminAddUserForm.reset();
            alert('User registered successfully!');
        };
    }
});