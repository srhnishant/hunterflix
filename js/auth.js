document.addEventListener('DOMContentLoaded', function() {
    // Registration
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.onsubmit = function(e) {
            e.preventDefault();
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const age = document.getElementById('register-age').value;
            const password = document.getElementById('register-password').value;
            let users = JSON.parse(localStorage.getItem('users')) || [];
            if (users.find(u => u.email === email)) {
                alert('Email already registered!');
                return;
            }
            users.push({ name, email, age, password, profilePic: 'assets/default-profile.png', history: [], watchLater: [], ratings: {} });
            localStorage.setItem('users', JSON.stringify(users));
            alert('Registration successful! Please login.');
            window.location.href = 'login.html';
        };
    }

    // Login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.onsubmit = function(e) {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            let users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.email === email && u.password === password);
            if (user) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                window.location.href = 'index.html';
            } else {
                alert('Invalid credentials!');
            }
        };
    }
});