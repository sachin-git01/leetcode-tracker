# 🚀 LeetCode Tracker

A full-stack web application designed to track, organize, and monitor your Data Structures and Algorithms (DSA) problem-solving journey with secure Google OAuth authentication and MongoDB Atlas cloud synchronization.

---

## 📐 Architecture: MVC Pattern

This project strictly adheres to the **Model-View-Controller (MVC)** architectural pattern to ensure clean separation of concerns, scalability, and maintainability.

```
       +--------------------------------------------------+
       |                  VIEW (React UI)                 |
       |  - src/App.jsx                                   |
       |  - src/components/LandingHero.jsx                |
       |  - src/components/Navbar.jsx                     |
       |  - src/components/ProblemCard.jsx                |
       +------------------------+-------------------------+
                                |
                   HTTP Requests| Responses (JSON)
                                v
       +--------------------------------------------------+
       |               ROUTER & CONTROLLER                |
       |  - backend/routes/authRoutes.js                  |
       |  - backend/routes/problemRoutes.js               |
       |  - backend/controllers/authController.js         |
       |  - backend/controllers/problemController.js      |
       |  - backend/middleware/authMiddleware.js          |
       +------------------------+-------------------------+
                                |
                     Reads/Write| Data
                                v
       +--------------------------------------------------+
       |                  MODEL (Data)                    |
       |  - backend/models/User.js                        |
       |  - backend/models/Problem.js                     |
       |  - backend/models/suggestionModel.js             |
       +------------------------+-------------------------+
```

### 1. Model (`backend/models/`)
* **`User.js`**: User account schema, Google profile metadata, and aggregated solver statistics.
* **`Problem.js`**: Problem record schema with user scoping, status, notes, tags, difficulty, and high-performance compound indices.
* **`suggestionModel.js`**: In-memory catalog of 4,073+ official LeetCode problems for ultra-fast title matching and URL parsing.

### 2. View (`src/`)
* **Role:** The user-facing client interface built with **React** and **Vite**.
* **Responsibilities:**
  - Modern, responsive, zero-purple dark UI.
  - Interactive problems workspace with filtering, searching, and topic categorization.
  - One-click Google Sign-In via `@react-oauth/google`.
  - Lazy-loaded executive PDF export/import.

### 3. Controller & Router (`backend/controllers/` & `backend/routes/`)
* **`authController.js` & `authRoutes.js`**: Verifies Google OAuth ID tokens via `google-auth-library` and issues secure JWT tokens.
* **`problemController.js` & `problemRoutes.js`**: Validates request payloads, manages CRUD operations scoped to authenticated users, and protects against ReDoS.
* **`authMiddleware.js`**: JWT Bearer token protection for protected API routes.

---

## 📁 Project Structure

```text
leetcode-tracker/
│
├── backend/                          # Backend Server (MVC Architecture)
│   ├── config/
│   │   └── db.js                     # MongoDB Atlas Mongoose connection
│   ├── controllers/
│   │   ├── authController.js         # Controller: Google OAuth & JWT generation
│   │   └── problemController.js      # Controller: Scoped CRUD & stats calculation
│   ├── middleware/
│   │   └── authMiddleware.js         # JWT verification middleware
│   ├── models/
│   │   ├── Problem.js                # Model: Mongoose Problem schema & indices
│   │   ├── User.js                   # Model: Mongoose User schema
│   │   └── suggestionModel.js        # Model: 4,073+ LeetCode catalog & URL parser
│   ├── routes/
│   │   ├── authRoutes.js             # Routes: /auth endpoints
│   │   └── problemRoutes.js          # Routes: /problems endpoints
│   ├── scripts/
│   │   └── checkDb.js                # Utility: MongoDB live status check
│   ├── .env.example                  # Environment variable reference
│   ├── package.json                  # Backend dependencies & scripts
│   └── server.js                     # Hardened Express app (Helmet, CORS, Rate-Limit, Compression)
│
├── frontend/                         # Frontend View Layer (React + Vite)
│   ├── public/                       # Static assets
│   ├── src/
│   │   ├── assets/                   # Static icons and assets
│   │   ├── components/
│   │   │   ├── LandingHero.jsx       # Futuristic zero-scroll landing page
│   │   │   ├── Navbar.jsx            # User profile header & sign-out modal
│   │   │   ├── ProblemCard.jsx       # Problem item component with LeetCode link
│   │   │   └── ProblemCard.css       # Problem card styles
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Global authentication state provider
│   │   ├── App.jsx                   # Main application view with search & filters
│   │   ├── App.css                   # Central design system & responsive layout
│   │   ├── index.css                 # Design tokens and root reset
│   │   └── main.jsx                  # React DOM mounting entry point
│   ├── .env.example                  # Frontend environment variable reference
│   ├── vercel.json                   # Vercel deployment SPA rewrite config
│   ├── index.html                    # HTML shell
│   ├── package.json                  # Frontend dependencies & scripts
│   └── vite.config.js                # Vite build configuration
│
├── .gitignore                        # Global Git ignore rules (.env protected)
├── package.json                      # Root workspace scripts
└── README.md                         # Project documentation
```

---

## ⚡ Features

* 🔐 **Secure Google OAuth 2.0**: Seamless, one-click sign in; each user's problem repository is private and isolated.
* ☁️ **MongoDB Atlas Cloud Sync**: All problems, notes, and favorites sync automatically across devices.
* 💡 **Full 4,000+ LeetCode Catalog**: Search across 4,073+ official questions or paste any LeetCode URL to auto-detect title, topic, and difficulty.
* ↗️ **Direct LeetCode Redirection**: Click any problem title to open its official LeetCode page.
* ⭐ **Star Favorites**: Flag key problems for quick revision.
* 🏷️ **Interactive Filter Tabs**: Filter by All, Easy, Medium, Hard, or Favorites.
* 🔎 **In-List Quick Search**: Real-time filtering with ReDoS-safe search.
* 📄 **Executive PDF Export & Import**: Code-split, publication-grade PDF portfolio export with embedded lossless backup data for one-click restore.
* ⌨️ **Keyboard Shortcuts**: Press `/` anywhere to focus search/add input, `Esc` to close modals.
* 📊 **Live Stats Dashboard**: Instant overview of Total, Easy, Medium, and Hard problems solved with visual progress bars.
* 🛡️ **Production-Hardened Security**: Equipped with Helmet HTTP security headers, origin-restricted CORS, rate limiting against DDoS/brute force, and Gzip/Brotli response compression.

---

## 🔌 API Endpoints (Backend)

| Method | Endpoint | Description | Auth Required | Status Code |
| :--- | :--- | :--- | :---: | :--- |
| `POST` | `/auth/google` | Sign in / register via Google ID token | No | `200 OK` / `400` |
| `GET` | `/auth/me` | Fetch authenticated user profile & stats | Yes | `200 OK` / `401` |
| `GET` | `/problems` | Retrieve all solved problems for user | Yes | `200 OK` |
| `GET` | `/problems/suggestions?q=...` | Search catalog & get LeetCode suggestions | Optional | `200 OK` |
| `POST` | `/problems` | Create a new solved problem | Yes | `201 Created` / `400` / `409` |
| `PUT` | `/problems/:id` | Update an existing problem (notes, title, favorites) | Yes | `200 OK` / `404` |
| `DELETE`| `/problems/:id` | Remove a problem by ID | Yes | `200 OK` / `404` |
| `POST` | `/problems/import` | Bulk restore problems from JSON backup | Yes | `200 OK` |
| `GET` | `/health` | Health check & uptime monitoring | No | `200 OK` |

---

## 🛠️ Getting Started

### 1. Prerequisites
* **Node.js** (v18 or higher recommended)
* **npm**
* A free **MongoDB Atlas** cluster URI
* A **Google Cloud Console OAuth 2.0 Client ID**

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and supply your MONGODB_URI, JWT_SECRET, and GOOGLE_CLIENT_ID
npm run dev
# Or production: npm start
```
The backend server runs on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env and supply your VITE_GOOGLE_CLIENT_ID and VITE_API_URL
npm run dev
```
Open `http://localhost:5173/` in your browser.
