const countrySelect = document.getElementById('country');
const citySelect = document.getElementById('city');

async function loadCountries() {
  try {
    const res = await fetch('https://countriesnow.space/api/v0.1/countries/positions');
    const data = await res.json();
    const countries = data.data.map(c => c.name).sort();

    countrySelect.innerHTML = '<option value="">Select your country</option>';
    countries.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      countrySelect.appendChild(opt);
    });
  } catch (err) {
    countrySelect.innerHTML = '<option value="">Could not load countries</option>';
  }
}

countrySelect.addEventListener('change', async () => {
  const country = countrySelect.value;
  citySelect.innerHTML = '<option value="">Loading cities...</option>';

  if (!country) {
    citySelect.innerHTML = '<option value="">Select country first</option>';
    return;
  }

  try {
    const res = await fetch('https://countriesnow.space/api/v0.1/countries/cities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country })
    });
    const data = await res.json();

    if (data.error || !data.data || data.data.length === 0) {
      citySelect.innerHTML = '<option value="">No cities found</option>';
      return;
    }

    citySelect.innerHTML = '<option value="">Select your city</option>';
    data.data.sort().forEach(city => {
      const opt = document.createElement('option');
      opt.value = city;
      opt.textContent = city;
      citySelect.appendChild(opt);
    });
  } catch (err) {
    citySelect.innerHTML = '<option value="">Could not load cities</option>';
  }
});

loadCountries();

document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const country = countrySelect.value;
  const city = citySelect.value;
  const msg = document.getElementById('msg');

  if (!country || !city) {
    msg.innerHTML = `<div class="alert alert-error">Please select your country and city</div>`;
    return;
  }

  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, country, city })
    });

    const data = await res.json();

    if (!res.ok) {
      msg.innerHTML = `<div class="alert alert-error">${data.message || 'Signup failed'}</div>`;
      return;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.user.username);

    msg.innerHTML = `<div class="alert alert-success">Signup successful! Redirecting...</div>`;

    setTimeout(() => (window.location.href = 'dashboard.html'), 700);
  } catch (err) {
    msg.innerHTML = `<div class="alert alert-error">Server error, try again</div>`;
  }
});
