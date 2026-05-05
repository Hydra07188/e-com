document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const alertBox = document.getElementById('register-alert');
    const passwordRule = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!registerForm || !alertBox) {
        return;
    }

    const submitBtn = registerForm.querySelector('button[type="submit"]');

    function showError(message) {
        alertBox.innerText = message;
        alertBox.style.display = 'block';
    }

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const firstName = document.getElementById('firstName').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const originalBtnText = submitBtn.innerText;

        alertBox.style.display = 'none';
        alertBox.innerText = '';

        if (!passwordRule.test(password)) {
            showError('Password must be at least 8 characters and include one uppercase letter and one symbol.');
            return;
        }

        submitBtn.innerText = 'Creating account...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ firstName, email, password })
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Unable to create account. Please try again.');
            }

            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('auth_user', JSON.stringify(data.user));
            window.location.href = 'shop.html';
        } catch (error) {
            showError(error.message);
        } finally {
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
        }
    });
});
