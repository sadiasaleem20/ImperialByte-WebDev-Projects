const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

router.post("/signup", async (req, res) => {
  try {
    const { username, email, password, country, city } = req.body;

    if (!username || !email || !password || !country || !city) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      username,
      email,
      password,
      country,
      city,
      savedCities: [city],
    });

    res.status(201).json({
      message: "Signup successful",
      token: generateToken(user._id),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        country: user.country,
        city: user.city,
        savedCities: user.savedCities,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.status(200).json({
      message: "Login successful",
      token: generateToken(user._id),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        country: user.country,
        city: user.city,
        savedCities: user.savedCities,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/cities", protect, async (req, res) => {
  try {
    const { city } = req.body;
    if (!city || !city.trim()) {
      return res.status(400).json({ message: "City name is required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const clean = city.trim();
    const alreadySaved = user.savedCities.some(
      (c) => c.toLowerCase() === clean.toLowerCase()
    );

    if (alreadySaved) {
      return res.status(400).json({ message: "City already in your dashboard" });
    }

    if (user.savedCities.length >= 8) {
      return res.status(400).json({ message: "You can save up to 8 cities" });
    }

    user.savedCities.push(clean);
    await user.save();

    res.status(200).json({ message: "City added", savedCities: user.savedCities });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.delete("/cities/:city", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.savedCities.length <= 1) {
      return res.status(400).json({ message: "You must keep at least one city" });
    }

    user.savedCities = user.savedCities.filter(
      (c) => c.toLowerCase() !== req.params.city.toLowerCase()
    );
    await user.save();

    res.status(200).json({ message: "City removed", savedCities: user.savedCities });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
