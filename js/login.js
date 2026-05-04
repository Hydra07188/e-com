document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const alertBox = document.getElementById('login-alert');

    if (!loginForm || !alertBox) {
        return;
    }

    const submitBtn = loginForm.querySelector('button[type="submit"]');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const originalBtnText = submitBtn.innerText;

        alertBox.style.display = 'none';
        alertBox.innerText = '';
        submitBtn.innerText = 'Signing in...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Unable to sign in. Please try again.');
            }

            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('auth_user', JSON.stringify(data.user));
            window.location.href = 'shop.html';
        } catch (error) {
            alertBox.innerText = error.message;
            alertBox.style.display = 'block';
        } finally {
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
        }
    });
});
