const express = require("express");
const axios = require("axios");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

const AQI_LABELS = {
  1: "Good",
  2: "Fair",
  3: "Moderate",
  4: "Poor",
  5: "Very Poor",
};

async function fetchWeatherPayload(city) {
  const response = await axios.get(
    "https://api.openweathermap.org/data/2.5/weather",
    {
      params: {
        q: city,
        appid: process.env.WEATHER_API_KEY,
        units: "metric",
      },
    },
  );

  const data = response.data;

  let aqiLabel = null;
  try {
    const aqiRes = await axios.get(
      "https://api.openweathermap.org/data/2.5/air_pollution",
      {
        params: {
          lat: data.coord.lat,
          lon: data.coord.lon,
          appid: process.env.WEATHER_API_KEY,
        },
      },
    );
    const aqiIndex = aqiRes.data?.list?.[0]?.main?.aqi;
    aqiLabel = AQI_LABELS[aqiIndex] || null;
  } catch (aqiErr) {
    aqiLabel = null;
  }

  return {
    city: data.name,
    country: data.sys.country,
    temperature: data.main.temp,
    feels_like: data.main.feels_like,
    temp_min: data.main.temp_min,
    temp_max: data.main.temp_max,
    humidity: data.main.humidity,
    wind_speed: data.wind.speed,
    description: data.weather[0].description,
    icon: data.weather[0].icon,
    main: data.weather[0].main,
    timezone: data.timezone,
    sunrise: data.sys.sunrise,
    sunset: data.sys.sunset,
    air_quality: aqiLabel,
  };
}

async function handleWeatherRequest(req, res) {
  try {
    const { city } = req.query;
    if (!city) {
      return res.status(400).json({ message: "City is required" });
    }

    const payload = await fetchWeatherPayload(city);
    res.status(200).json(payload);
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return res.status(404).json({ message: "City not found" });
    }
    res
      .status(500)
      .json({ message: "Error fetching weather", error: err.message });
  }
}

router.get("/", protect, handleWeatherRequest);

router.get("/public", handleWeatherRequest);

module.exports = router;
