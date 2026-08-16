const SHOWCASE_CITY = "Lahore";

async function loadShowcaseWeather() {
  try {
    const res = await fetch(
      `/api/weather/public?city=${encodeURIComponent(SHOWCASE_CITY)}`,
    );
    if (!res.ok) return;

    const data = await res.json();

    document.getElementById("wcCity").textContent = `${data.city}`;
    document.getElementById("wcCondition").textContent =
      data.description.charAt(0).toUpperCase() + data.description.slice(1);
    document.getElementById("wcTemp").textContent =
      `${Math.round(data.temperature)}°C`;
    document.getElementById("wcFeels").textContent =
      `Feels like ${Math.round(data.feels_like)}°`;
    document.getElementById("wcHilo").textContent =
      `High ${Math.round(data.temp_max)}° · Low ${Math.round(data.temp_min)}°`;
    document.getElementById("wcHumidity").textContent = `${data.humidity}%`;
    document.getElementById("wcWind").textContent = `${data.wind_speed} km/h`;
    document.getElementById("wcAqi").textContent = data.air_quality || "--";
  } catch (err) {}
}

loadShowcaseWeather();
