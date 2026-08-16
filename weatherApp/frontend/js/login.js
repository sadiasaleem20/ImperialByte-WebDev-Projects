document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const msg = document.getElementById('msg');

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      msg.innerHTML = `<div class="alert alert-error">${data.message || 'Login failed'}</div>`;
      return;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.user.username);

    msg.innerHTML = `<div class="alert alert-success">Login successful! Redirecting...</div>`;

    setTimeout(() => (window.location.href = 'dashboard.html'), 700);
  } catch (err) {
    msg.innerHTML = `<div class="alert alert-error">Server error, try again</div>`;
  }
});
