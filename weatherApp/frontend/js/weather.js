const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

const hero = document.getElementById("hero");
const msg = document.getElementById("msg");
const cityGrid = document.getElementById("cityGrid");
const addCityPanel = document.getElementById("addCityPanel");

let savedCities = [];
let activeCity = null;
let cityCache = {};

let activeTimezoneOffset = 0;
let activeFetchedAt = null;

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  window.location.href = "login.html";
});

// Date.now() is a UTC timestamp. To show a city's real local time, add its
// UTC offset (in seconds, from OpenWeatherMap) then format while FORCING
// the formatter to treat the result as UTC — this stops the browser from
// applying the visitor's own timezone on top of our manual shift.
function cityLocalDate(timezoneOffsetSeconds) {
  const nowUtcMs = Date.now();
  return new Date(nowUtcMs + timezoneOffsetSeconds * 1000);
}

function formatCityDate(date) {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function formatCityTime(date) {
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

function updateClock() {
  const cityNow = cityLocalDate(activeTimezoneOffset);
  document.getElementById("dateText").textContent = formatCityDate(cityNow);
  document.getElementById("timeText").textContent = formatCityTime(cityNow);
}
setInterval(updateClock, 1000);

function updateAgoText() {
  const el = document.getElementById("updatedAgo");
  if (!activeFetchedAt) {
    el.textContent = "just now";
    return;
  }
  const seconds = Math.floor((Date.now() - activeFetchedAt) / 1000);
  if (seconds < 60) el.textContent = "just now";
  else if (seconds < 3600)
    el.textContent = `${Math.floor(seconds / 60)} min ago`;
  else el.textContent = `${Math.floor(seconds / 3600)} hr ago`;
}
setInterval(updateAgoText, 15000);

const THEMES = {
  Clear: { a: "#ffcf5c", b: "#ff9fb4", c: "#f77b6d", d: "#8a3b52" },
  Clouds: { a: "#9fb0c8", b: "#6f84a3", c: "#4c5f7d", d: "#22314a" },
  Rain: { a: "#4c6a8a", b: "#33526f", c: "#20364e", d: "#101f33" },
  Drizzle: { a: "#5c85a8", b: "#3f6689", c: "#274a68", d: "#122d47" },
  Thunderstorm: { a: "#2c3244", b: "#1d2130", c: "#12151f", d: "#05070c" },
  Snow: { a: "#eaf4ff", b: "#bcd9f2", c: "#8db6dd", d: "#4f7fa8" },
  Mist: { a: "#b9c3ce", b: "#98a4b2", c: "#78889a", d: "#4d5c6d" },
  Fog: { a: "#b9c3ce", b: "#98a4b2", c: "#78889a", d: "#4d5c6d" },
  Haze: { a: "#cbb08c", b: "#a98b68", c: "#846a4d", d: "#4d3a29" },
};

function applyHeroTheme(main) {
  const t = THEMES[main] || THEMES.Clouds;
  hero.style.setProperty("--theme-a", t.a);
  hero.style.setProperty("--theme-b", t.b);
  hero.style.setProperty("--theme-c", t.c);
  hero.style.setProperty("--theme-d", t.d);
}

function guessMain(desc) {
  desc = (desc || "").toLowerCase();
  if (desc.includes("thunder")) return "Thunderstorm";
  if (desc.includes("snow")) return "Snow";
  if (desc.includes("rain") || desc.includes("drizzle")) return "Rain";
  if (desc.includes("mist") || desc.includes("fog") || desc.includes("haze"))
    return "Mist";
  if (desc.includes("cloud")) return "Clouds";
  return "Clear";
}

async function loadProfile() {
  try {
    const res = await fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (!res.ok) {
      localStorage.removeItem("token");
      window.location.href = "login.html";
      return;
    }

    document.getElementById("welcomeText").textContent = data.user.username;
    savedCities =
      data.user.savedCities && data.user.savedCities.length
        ? data.user.savedCities
        : [data.user.city];

    activeCity = savedCities[0];
    await renderCityGrid();
    await setActiveCity(activeCity);
  } catch (err) {
    msg.innerHTML = `<div class="alert alert-error">Could not load your profile</div>`;
  }
}

async function getWeather(city, { force = false } = {}) {
  if (!force && cityCache[city]) return cityCache[city].data;

  const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "City not found");

  cityCache[city] = { data, fetchedAt: Date.now() };
  return data;
}

async function setActiveCity(city, { force = false } = {}) {
  activeCity = city;
  msg.innerHTML = `<div class="alert alert-info">Loading ${city}...</div>`;

  try {
    const data = await getWeather(city, { force });
    msg.innerHTML = "";

    activeTimezoneOffset = data.timezone || 0;
    activeFetchedAt = cityCache[city].fetchedAt;

    document.getElementById("cityName").textContent =
      `${data.city}, ${data.country}`;
    document.getElementById("temp").textContent =
      `${Math.round(data.temperature)}°`;
    document.getElementById("description").textContent =
      data.description.charAt(0).toUpperCase() + data.description.slice(1);
    document.getElementById("feelsLikeText").textContent =
      `Feels like ${Math.round(data.feels_like)}°`;
    document.getElementById("conditionBadge").textContent =
      data.main || guessMain(data.description);
    document.getElementById("humidity").textContent = `${data.humidity}%`;
    document.getElementById("wind").textContent = `${data.wind_speed} km/h`;
    document.getElementById("aqi").textContent = data.air_quality || "--";

    // sunrise/sunset are absolute UTC unix seconds — convert to this city's
    // local wall-clock time using the same offset trick as the main clock.
    if (data.sunrise) {
      const sunriseDate = new Date(
        (data.sunrise + activeTimezoneOffset) * 1000,
      );
      document.getElementById("sunriseText").textContent =
        formatCityTime(sunriseDate);
    }
    if (data.sunset) {
      const sunsetDate = new Date((data.sunset + activeTimezoneOffset) * 1000);
      document.getElementById("sunsetText").textContent =
        formatCityTime(sunsetDate);
    }

    updateClock();
    updateAgoText();
    applyHeroTheme(data.main || guessMain(data.description));
    highlightActiveCard(city);
  } catch (err) {
    msg.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}

function highlightActiveCard(city) {
  document.querySelectorAll(".city-card[data-city]").forEach((card) => {
    card.classList.toggle(
      "active",
      card.dataset.city.toLowerCase() === city.toLowerCase(),
    );
  });
}

async function renderCityGrid() {
  cityGrid.innerHTML = "";

  for (const city of savedCities) {
    const card = document.createElement("div");
    card.className = "city-card";
    card.dataset.city = city;
    card.innerHTML = `
      <button class="remove-btn" title="Remove ${city}">&times;</button>
      <div class="name">${city}</div>
      <div class="temp">--°</div>
      <div class="cond">Loading...</div>
    `;
    cityGrid.appendChild(card);

    card.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-btn")) return;
      setActiveCity(city);
    });

    card.querySelector(".remove-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      removeCity(city);
    });

    getWeather(city)
      .then((data) => {
        card.querySelector(".temp").textContent =
          `${Math.round(data.temperature)}°`;
        card.querySelector(".cond").textContent =
          data.description.charAt(0).toUpperCase() + data.description.slice(1);
      })
      .catch(() => {
        card.querySelector(".cond").textContent = "Unavailable";
      });
  }

  const addCard = document.createElement("div");
  addCard.className = "city-card add-card";
  addCard.innerHTML = `<span>+</span> Add city`;
  addCard.addEventListener("click", () => {
    addCityPanel.classList.toggle("open");
    if (addCityPanel.classList.contains("open")) {
      document.getElementById("newCityInput").focus();
    }
  });
  cityGrid.appendChild(addCard);
}

async function addCity(city) {
  try {
    const res = await fetch("/api/auth/cities", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ city }),
    });
    const data = await res.json();

    if (!res.ok) {
      msg.innerHTML = `<div class="alert alert-error">${data.message}</div>`;
      return;
    }

    savedCities = data.savedCities;
    addCityPanel.classList.remove("open");
    document.getElementById("newCityInput").value = "";
    await renderCityGrid();
    await setActiveCity(city);
  } catch (err) {
    msg.innerHTML = `<div class="alert alert-error">Could not add city</div>`;
  }
}

async function removeCity(city) {
  try {
    const res = await fetch(`/api/auth/cities/${encodeURIComponent(city)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (!res.ok) {
      msg.innerHTML = `<div class="alert alert-error">${data.message}</div>`;
      return;
    }

    savedCities = data.savedCities;
    delete cityCache[city];

    if (activeCity.toLowerCase() === city.toLowerCase()) {
      activeCity = savedCities[0];
      await setActiveCity(activeCity);
    }

    await renderCityGrid();
  } catch (err) {
    msg.innerHTML = `<div class="alert alert-error">Could not remove city</div>`;
  }
}

document.getElementById("confirmAddCity").addEventListener("click", () => {
  const city = document.getElementById("newCityInput").value.trim();
  if (city) addCity(city);
});

document.getElementById("newCityInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") document.getElementById("confirmAddCity").click();
});

document.getElementById("refreshBtn").addEventListener("click", () => {
  if (activeCity) setActiveCity(activeCity, { force: true });
});

loadProfile();
