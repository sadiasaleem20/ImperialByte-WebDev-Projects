# ImperialByte WebDev Projects

A collection of web development projects built during my internship at **Imperial Byte**. Each folder is a standalone project, going from vanilla front-end UI work up to a full-stack app with authentication and a live weather API.

## Projects

### ☕ CoffeeApp — Cafe Fika

A landing page + ordering flow for a fictional coffee & bakery shop, "Cafe Fika."

- Coffee and bakery menus with add-to-cart buttons
- Slide-out cart panel with live quantity controls and subtotal
- Cart persists across page reloads via `localStorage`
- Separate checkout page that reads the cart, collects delivery details, generates an order ID (`GRN-####`), and shows a confirmation screen
- Scroll-reveal animations, smooth-scroll nav, and a newsletter signup form (front-end only, no backend)
- **Stack:** HTML, CSS, vanilla JavaScript

### 📝 Notes

A Google Keep-style notes app.

- Composer for quick notes, with an expandable title field and checklist mode
- Pin, archive, and trash views, plus 11 background color options
- Search across notes
- **Stack:** HTML, Bootstrap 5, vanilla JavaScript
- **Note:** Notes live in memory only (a JS array) — refreshing the page resets them to the two starter notes. `localStorage` persistence would be a natural next step.

### ❓ QuizApp — Pakistan Quiz

A 5-question multiple-choice quiz on Pakistan (capital, independence year, founder, national language, national sport).

- Start / quiz / result screens with a progress bar
- Instant right/wrong feedback per question, live score tracking, and a closing message based on final score
- A second set of 5 questions is already written in the code (currently commented out) — uncommenting them expands the quiz to 10 questions
- **Stack:** HTML, Bootstrap 5, vanilla JavaScript

### 🏠 airbnb

A close front-end clone of the Airbnb homepage, styled around Islamabad listings.

- Header that shrinks into a compact search pill on scroll
- Listing carousel with prev/next navigation, generated from a JS data array (name, price, rating, category, gradient placeholder colors)
- "Inspiration for future getaways" section with filter tabs and a destinations grid
- Full multi-column footer matching Airbnb's real layout
- Includes an "Internship at Imperial Byte" credit line in the header
- **Stack:** HTML, Bootstrap 5, custom CSS, vanilla JavaScript

### ⛅ weatherApp

A full-stack weather dashboard with real user accounts — the most complete project in this repo.

**Backend (Node/Express/MongoDB):**

- JWT-based signup/login, with passwords hashed via `bcryptjs` before being saved (Mongoose `pre("save")` hook)
- Protected routes via an `authMiddleware` that verifies the `Authorization: Bearer <token>` header
- Each user can save up to 8 cities to their dashboard (`POST /api/auth/cities`, `DELETE /api/auth/cities/:city`), with a minimum of 1 city enforced
- Weather data pulled live from OpenWeatherMap, including temperature, humidity, wind, sunrise/sunset, and **air quality index** (translated from OpenWeatherMap's 1–5 scale into Good/Fair/Moderate/Poor/Very Poor labels)
- A public weather route (`GET /api/weather/public`) alongside the authenticated one

**Frontend:**

- Landing, signup, login, and dashboard pages
- Accurate local time per saved city, computed by taking the city's UTC offset from the API and applying it independently of the visitor's own timezone

**API routes:**
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | – | Create account |
| POST | `/api/auth/login` | – | Log in, get JWT |
| GET | `/api/auth/me` | ✅ | Get current user |
| POST | `/api/auth/cities` | ✅ | Save a city (max 8) |
| DELETE | `/api/auth/cities/:city` | ✅ | Remove a saved city (min 1 must remain) |
| GET | `/api/weather` | ✅ | Weather + AQI for a city |
| GET | `/api/weather/public` | – | Same, without auth |

**Stack:** Node.js, Express, MongoDB (Mongoose), JWT, bcryptjs, Axios, vanilla JS frontend

#### Running weatherApp locally

```bash
cd weatherApp
npm install
```

Create a `.env` file in `weatherApp/` (this file is gitignored and not included in the repo):

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_own_secret_key
WEATHER_API_KEY=your_openweathermap_api_key
```

Then start the server:

```bash
npm run dev
```

## Repo structure

```
ImperialByte-WebDev-Projects/
├── CoffeeApp/
├── Notes/
├── QuizApp/
├── airbnb/
└── weatherApp/
```

## About

These projects were built during my Web Development Internship at Imperial Byte, progressing from front-end UI practice toward full-stack development with authentication and live third-party APIs. More projects will be added here as the internship continues.
