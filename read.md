# 🚀 LeetCode Tracker

A full-stack web application designed to track, organize, and monitor your Data Structures and Algorithms (DSA) problem-solving journey.

---

## 📐 Architecture: MVC Pattern

This project strictly adheres to the **Model-View-Controller (MVC)** architectural pattern to ensure clean separation of concerns, scalability, and maintainability.

```
       +--------------------------------------------------+
       |                  VIEW (React UI)                 |
       |  - src/App.jsx                                   |
       |  - src/components/ProblemCard.jsx                |
       +------------------------+-------------------------+
                                |
                   HTTP Requests| Responses (JSON)
                                v
       +--------------------------------------------------+
       |               ROUTER & CONTROLLER                |
       |  - backend/routes/problemRoutes.js               |
       |  - backend/controllers/problemController.js      |
       +------------------------+-------------------------+
                                |
                     Reads/Write| Data
                                v
       +--------------------------------------------------+
       |                  MODEL (Data)                    |
       |  - backend/models/problemModel.js                |
       +--------------------------------------------------+
```

### 1. Model (`backend/models/`)
* **File:** `problemModel.js`
* **Role:** Manages the data layer, schemas, and in-memory or database operations.
* **Responsibilities:**
  - Storing problem records (ID, title, topic, difficulty, notes).
  - Data retrieval (`getAll`, `getById`, `findByTitle`).
  - Data mutations (`create`, `update`, `delete`).

### 2. View (`src/`)
* **Role:** The user-facing client interface built with **React** and **Vite**.
* **Responsibilities:**
  - Presenting data dynamically with responsive UI and animations.
  - User interactions (forms, search, theme toggles, modal dialogs).
  - Dispatching asynchronous API requests to the backend controller.

### 3. Controller (`backend/controllers/`)
* **File:** `problemController.js`
* **Role:** The brain connecting the Model and View.
* **Responsibilities:**
  - Validating incoming request payloads.
  - Calling corresponding methods on the Model.
  - Sending appropriate HTTP status codes and JSON payloads back to the View.

### 4. Routes (`backend/routes/`)
* **File:** `problemRoutes.js`
* **Role:** Defines HTTP endpoints and delegates execution to Controller actions.

---

## 📁 Project Structure

```text
leetcode-tracker/
│
├── backend/                          # Backend Server (MVC Architecture)
│   ├── controllers/
│   │   └── problemController.js      # Controller: Request handling & response logic
│   ├── models/
│   │   ├── problemModel.js           # Model: Data storage and operations
│   │   └── suggestionModel.js        # Model: LeetCode catalog & URL slug generator
│   ├── routes/
│   │   └── problemRoutes.js          # Routes: Endpoint mappings
│   ├── package.json                  # Backend dependencies & scripts
│   └── server.js                     # Express app setup and middleware configuration
│
├── frontend/                         # Frontend View Layer (React + Vite)
│   ├── public/                       # Static assets
│   ├── src/
│   │   ├── assets/                   # Images and static files
│   │   ├── components/
│   │   │   ├── ProblemCard.jsx       # Problem item component with direct LeetCode link
│   │   │   └── ProblemCard.css       # Problem card styles
│   │   ├── App.jsx                   # Main application view with auto-suggestions
│   │   ├── App.css                   # Application layout, animations & dark styles
│   │   ├── index.css                 # Global design tokens and root styles
│   │   └── main.jsx                  # React DOM mounting entry point
│   ├── index.html                    # HTML shell
│   ├── package.json                  # Frontend dependencies & scripts
│   └── vite.config.js                # Vite configuration
│
├── package.json                      # Root workspace scripts
├── read.md                           # Documentation & architecture guide
└── README.md                         # Standard repository readme
```

---

## ⚡ Features

* 💡 **Full 4,000+ LeetCode Catalog**: Search across all 4,069 official LeetCode questions or paste direct LeetCode URLs to auto-detect title, topic, and difficulty!
* ↗️ **Direct LeetCode Redirection**: Click any problem title to instantly open its official LeetCode problem page in a new tab.
* ⭐ **Star Favorites**: Flag key or favorite problems with a single click.
* 🏷️ **Interactive Filter Tabs**: Filter your solved repository by All, Easy, Medium, Hard, or Favorites.
* 🔎 **In-List Quick Search**: Instantly find any problem in your list in real-time.
* 📄 **Executive PDF Export & Import**: Export a beautifully formatted, publication-grade PDF portfolio of all your solved problems (with stats banner, colorized difficulty, topics, notes, and direct clickable links to LeetCode), and import problems directly from PDF backups anytime!
* ⌨️ **Keyboard Shortcut**: Press `/` anywhere to focus the search bar, `Esc` to close any modal.
* 📊 **Live Stats Dashboard**: Instant overview of Total, Easy, Medium, and Hard problems solved with visual progress bar.
* 📂 **Collapsible Topic Sections**: Expand or collapse topics, with sub-accordions per difficulty.
* 📝 **Study Notes**: Intuitive modal to write intuition, edge cases, and approach notes.
* 🌙 **Permanent Dark Mode**: Sleek, immersive modern dark UI tailored for programmers.
* ⚠️ **Duplicate Detection**: Prevents adding duplicate problem titles with an alert modal.

---

## 🔌 API Endpoints (Backend)

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/problems` | Retrieve all solved problems | `200 OK` |
| `GET` | `/problems/suggestions?q=...` | Search catalog & get LeetCode suggestions | `200 OK` |
| `POST` | `/problems` | Create a new problem | `201 Created` / `400` / `409` |
| `PUT` | `/problems/:id` | Update an existing problem (notes, title, favorites) | `200 OK` / `404 Not Found` |
| `DELETE`| `/problems/:id` | Remove a problem by ID | `200 OK` / `404 Not Found` |
| `POST` | `/problems/import` | Bulk restore/import problems from JSON backup | `200 OK` |
| `GET` | `/health` | Health check endpoint | `200 OK` |

---

## 🛠️ Getting Started

### 1. Prerequisites
* **Node.js** (v18 or higher recommended)
* **npm**

### 2. Running the Backend
```bash
cd backend
npm install
npm run dev
# or: npm start
```
The backend server runs on `http://localhost:5000`.

### 3. Running the Frontend
```bash
cd frontend
npm install
npm run dev
```
Open your browser at the local URL provided by Vite (typically `http://localhost:5173`).

---

## 🛡️ MVC Building Guidelines for Future Development

When extending this project, continue to uphold the **MVC architecture**:

1. **New Data Entities**:
   - Add new data logic and schemas in `backend/models/`.
2. **New Business Logic & APIs**:
   - Write request handlers in `backend/controllers/`.
   - Wire endpoints in `backend/routes/`.
   - Keep `backend/server.js` clean—only use it for middleware and mounting route modules.
3. **UI & View**:
   - Keep React components modular inside `src/components/`.
   - Call backend controller endpoints via centralized API utilities or services.
