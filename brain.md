# 🧠 Project Brain: LeetCode Tracker

> **Core Memory & Operational Guide**: This document preserves all context, architectural invariants, decisions, schemas, and operational instructions for the `leetcode-tracker` project. Any assistant or developer continuing work on this project **must read and adhere** to the guidelines laid out here.

---

## 📌 1. Project Overview & Identity

* **Name:** LeetCode Tracker
* **Goal:** A modern full-stack web application designed to track, organize, search, and review Data Structures & Algorithms (DSA) problem-solving progress.
* **Stack:**
  * **Frontend (View):** React 19, Vite 8, Vanilla CSS (dynamic themes, responsive layout, animations).
  * **Backend (Model & Controller):** Node.js, Express 5, CORS.
  * **Dev / Run Environment:** Windows OS (PowerShell / cmd).

---

## 🏛️ 2. Non-Negotiable Architecture Directives

### ⚠️ MANDATORY RULE: Always Follow MVC Architecture
Every backend feature, entity, or workflow must strictly follow the **Model-View-Controller (MVC)** design pattern. Never put business logic or data structures directly into `server.js` or route handlers.

```
       +--------------------------------------------------+
       |                  VIEW (React UI)                 |
       |  - src/App.jsx                                   |
       |  - src/components/ProblemCard.jsx                |
       |  - src/components/modals/                        |
       +------------------------+-------------------------+
                                |
                   HTTP Requests| Responses (JSON)
                                v
       +--------------------------------------------------+
       |                     ROUTER                       |
       |  - backend/routes/problemRoutes.js               |
       +------------------------+-------------------------+
                                |
                                v
       +--------------------------------------------------+
       |                   CONTROLLER                     |
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

### Component Roles & Responsibilities

1. **Model Layer (`backend/models/`):**
   * Encapsulates all data access, storage, and persistence logic.
   * Exposes uniform static or instance methods (e.g. `getAll()`, `getById(id)`, `findByTitle(title)`, `create(data)`, `update(id, data)`, `delete(id)`).
   * Models contain **no** HTTP-specific knowledge (no `req`, `res`, status codes).

2. **Controller Layer (`backend/controllers/`):**
   * Acts as the coordinator between incoming requests and the Model.
   * Validates input (`req.body`, `req.params`, `req.query`).
   * Handles business logic, status codes (`200`, `201`, `400`, `404`, `409`, `500`), and JSON response formatting.
   * Intercepts and catches exceptions with try/catch.

3. **Routes Layer (`backend/routes/`):**
   * Express routers dedicated to resource endpoints.
   * Maps HTTP methods and paths to controller methods (e.g. `router.get('/', controller.getProblems)`).
   * Free of business logic.

4. **Server Bootstrap (`backend/server.js`):**
   * Configures global middleware (`cors()`, `express.json()`).
   * Mounts route modules at base paths (e.g. `app.use('/problems', problemRoutes)`).
   * Starts HTTP listener on `PORT` (default: 5000).

5. **View Layer (`src/`):**
   * Pure client presentation using React components.
   * Dispatches fetch requests to backend endpoints.
   * Renders reactive UI, handles user input, theme state, search, and modals.

---

## 🗃️ 3. Data Schema & Models

### Problem Entity
```javascript
{
  id: Number,           // Auto-incremented unique integer identifier
  title: String,        // Problem name (e.g. "Two Sum", unique case-insensitive)
  topic: String,        // DSA Category (Array, Tree, Graph, DP, etc.)
  difficulty: String,   // "Easy" | "Medium" | "Hard"
  note: String          // User's custom revision notes or hints
}
```

### Pre-defined Topic Categories
`Array`, `String`, `Linked List`, `Stack`, `Queue`, `HashMap`, `HashSet`, `Two Pointers`, `Sliding Window`, `Binary Search`, `Recursion`, `Backtracking`, `Sorting`, `Heap / Priority Queue`, `Tree`, `Binary Tree`, `BST`, `Trie`, `Graph`, `BFS`, `DFS`, `Greedy`, `Dynamic Programming`, `Bit Manipulation`, `Math`, `Matrix`, `Prefix Sum`, `Segment Tree`, `Fenwick Tree`, `Union Find (DSU)`, `Topological Sort`, `Shortest Path`, `Minimum Spanning Tree`, `Interval`, `Monotonic Stack`, `Monotonic Queue`, `Others`.

---

## 🔌 4. API Endpoints Contract

| Method | Route | Description | Expected Payload | Response (Success) |
|---|---|---|---|---|
| `GET` | `/problems` | Fetch all problems | None | `200 OK`: `Array<Problem>` |
| `GET` | `/problems/suggestions?q=...` | Live LeetCode suggestions across all 4,000+ problems & URL parser | Query `q` | `200 OK`: `Array<Suggestion>` |
| `POST` | `/problems` | Create problem | `{ title, topic, difficulty, note }` | `201 Created`: `{ message, problem }` |
| `PUT` | `/problems/:id` | Update title/note/details | `{ title?, topic?, difficulty?, note? }` | `200 OK`: `{ message, problem }` |
| `DELETE` | `/problems/:id` | Delete problem by ID | None | `200 OK`: `{ message }` |
| `GET` | `/health` | Server health check | None | `200 OK`: `{ status: "OK", timestamp }` |

---

## 💻 5. System & Windows Execution Quirks

* **Execution Policy:** On this Windows machine, PowerShell script execution (`npm.ps1`) may be restricted. Always use `cmd.exe /c` when invoking npm commands:
  ```powershell
  # Build frontend
  cmd.exe /c "npm run build"

  # Run backend
  cmd.exe /c "cd backend && npm start"
  ```
* **Ports in Use:**
  * Backend: `http://localhost:5000`
  * Frontend (Vite Dev Server): `http://localhost:5173`

---

## 📂 6. Complete Workspace File Registry

```text
e:/LeetCode/leetcode-tracker/
│
├── backend/
│   ├── controllers/
│   │   └── problemController.js   # HTTP controllers (request/response, status codes)
│   ├── models/
│   │   ├── problemModel.js        # Problem data model & in-memory store
│   │   └── suggestionModel.js     # Suggestion model & LeetCode URL slug generator
│   ├── routes/
│   │   └── problemRoutes.js       # Route declarations for /problems
│   ├── package.json               # Backend dependencies (express, cors)
│   └── server.js                  # Express bootstrap, middleware & route mounting
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/                # Static UI images & assets
│   │   ├── components/
│   │   │   ├── ProblemCard.jsx    # Problem list item row with direct LeetCode link
│   │   │   └── ProblemCard.css    # Item row styles, badges, action buttons
│   │   ├── App.jsx                # Root view: forms, topic accordions, modals
│   │   ├── App.css                # Main application styling, hero, cards, dark theme
│   │   ├── index.css              # Global root styles, fonts, color tokens
│   │   └── main.jsx               # Vite React client entry
│   ├── index.html                 # HTML root template
│   ├── package.json               # Frontend dependencies (react 19, vite 8)
│   └── vite.config.js             # Vite config
│
├── brain.md                       # 🧠 This master memory & knowledge file
├── read.md                        # Project documentation file
├── README.md                      # Standard repository README
└── package.json                   # Root workspace scripts
```

---

## 🎯 7. Frontend State Architecture (`frontend/src/App.jsx`)

* `problems`: List of all problems fetched from backend.
* `title`, `topic`, `difficulty`: Form inputs for adding a problem.
* `addSuggestions`, `showAddSuggestions`: Live auto-complete suggestions from official 4,000+ LeetCode catalog.
* `openTopics`: Object map tracking accordion expand/collapse state per topic (`{ [topicName]: boolean }`).
* `deleteIndex`: ID/index of problem pending deletion confirmation modal.
* `showDuplicateModal`: Boolean flag for duplicate title prevention modal.
* `noteIndex`, `noteText`: State for problem note editor modal.
* **Theme:** Permanent immersive Dark Mode (no day mode).

---

## 🚀 8. Future Roadmap & Extensibility

1. **Persistent Database Integration:**
   * Replace in-memory array in [`backend/models/problemModel.js`](file:///e:/LeetCode/leetcode-tracker/backend/models/problemModel.js) with MongoDB (Mongoose) or PostgreSQL/SQLite (Prisma/Sequelize).
   * Because of MVC, **only** the model file needs updates; routes and controllers remain untouched.
2. **Full Frontend-Backend CRUD Sync:**
   * Wire `deleteProblem`, `updateProblem`, and `saveNote` in [`App.jsx`](file:///e:/LeetCode/leetcode-tracker/src/App.jsx) to call `DELETE /problems/:id` and `PUT /problems/:id`.
3. **Tags & Solution Links:**
   * Add `leetcodeUrl`, `tags`, and `codeSolution` fields to `ProblemModel`.
4. **Filter & Sorting Enhancements:**
   * Filter by difficulty badge, completion status, or last-revised date.

---

## ✅ 9. Rules When Making Changes

1. **Never break MVC:** Always place data logic in `models/`, business handlers in `controllers/`, paths in `routes/`.
2. **Preserve Compatibility:** Maintain JSON contract with frontend so UI stays fully functional.
3. **Keep Files Documented:** Update `read.md` and `brain.md` whenever new entities, endpoints, or patterns are introduced.
