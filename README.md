# TaskFlow — Task Management System

A full-stack MERN task management application with JWT authentication, advanced filtering, sorting, pagination, security hardening, CI workflow, and a dark glassmorphism UI.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features & Security Hardening](#features--security-hardening)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Testing & CI](#testing--ci)
- [Production Deployment & Architecture](#production-deployment--architecture)
- [API Reference](#api-reference)

---

## Tech Stack

| Layer     | Technology                            |
|-----------|---------------------------------------|
| Backend   | Node.js, Express.js, Mongoose         |
| Database  | MongoDB (local or Atlas)              |
| Auth & Security | JWT, bcryptjs, Helmet, express-rate-limit, CORS |
| Frontend  | React 18, Vite, React Router v6       |
| HTTP      | Axios (with JWT interceptors)         |
| Icons     | lucide-react                          |
| Styling   | Vanilla CSS with CSS custom properties |
| CI / CD   | GitHub Actions                        |

---

## Features & Security Hardening

### Backend
- User registration & login with hashed passwords (`bcryptjs`)
- JWT-based authentication with protected route middleware
- Security Hardening: `helmet` HTTP headers & `express-rate-limit` on `/api/auth` endpoints
- Restricted CORS configuration allowing local dev and production frontend origins (`CLIENT_URL` / `FRONTEND_URL` / `*.vercel.app`)
- Task CRUD: create, read, update, delete
- Quick status patch endpoint (`PATCH /api/tasks/:id/status`)
- Task analytics aggregation endpoint (`GET /api/tasks/analytics`)
- Query filtering: `status`, `priority`, `search` (case-insensitive regex with special char escaping)
- Sorting: `createdAt`, `dueDate`, `priority` (custom Low=1, Med=2, High=3 order)
- Backend Pagination: `page`, `limit` (defaults: page 1, limit 12)
- Strict User Data Isolation: Database queries explicitly bind to `{ userId: req.user._id }`

### Frontend
- Dark glassmorphism design system with CSS custom properties
- Register & Login pages with client-side validation
- Protected routes (JWT persisted in `localStorage`)
- Dashboard with live analytics cards and completion progress bar
- Task grid with skeleton loading states and empty states
- Create / Edit tasks via animated modal (title, description, status, priority, due date)
- Quick status toggle on task cards (Todo → In Progress → Done)
- Debounced search (300ms), status filter tabs, priority filter dropdown
- Sort controls: field selector + asc/desc direction indicator badge
- Pagination with per-page selector (6 / 12 / 24 / 48)
- Toast notifications for all actions (slide-in animation)
- Responsive layout for desktop, tablet (≤768px), and mobile (≤480px)

---

## Project Structure

```
task-management-system/
├── .github/
│   └── workflows/
│       └── ci.yml                  # GitHub Actions CI test workflow
├── backend/
│   ├── config/
│   │   └── db.js                   # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js       # register, login, me
│   │   └── taskController.js       # CRUD + analytics
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT token verification
│   │   └── errorMiddleware.js      # Centralized error handler
│   ├── models/
│   │   ├── User.js                 # User schema (bcrypt pre-save)
│   │   └── Task.js                 # Task schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── taskRoutes.js
│   ├── app.js                      # Express app, Helmet, CORS, Rate Limiters
│   ├── auditTest.js                # Automated unit & integration test suite (72 tests)
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── TaskAnalytics.jsx
    │   │   ├── TaskFilters.jsx
    │   │   ├── TaskSortControls.jsx
    │   │   ├── TaskList.jsx
    │   │   ├── TaskCard.jsx
    │   │   ├── TaskModal.jsx
    │   │   ├── Pagination.jsx
    │   │   ├── Toast.jsx
    │   │   └── Routes.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   └── Dashboard.jsx
    │   ├── services/
    │   │   └── api.js              # Axios instance with JWT interceptors
    │   ├── main.jsx
    │   └── index.css               # Design system & responsive styles
    ├── index.html
    ├── vite.config.js              # Port 3000, /api proxy to backend
    └── package.json
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable       | Description                                                 | Default |
|----------------|-------------------------------------------------------------|---------|
| `PORT`         | Port the Express server listens on                          | `5000`  |
| `MONGO_URI`    | MongoDB connection string (local or Atlas)                 | `mongodb://localhost:27017/task_management_db` |
| `JWT_SECRET`   | Secret key for signing JWTs                                 | (required secret string) |
| `NODE_ENV`     | `development`, `production`, or `test`                      | `development` |
| `CLIENT_URL`   | Deployed frontend production origin for CORS whitelist      | `http://localhost:3000` |
| `FRONTEND_URL` | Alternative deployed frontend origin for CORS whitelist     | — |

### Frontend (`frontend/.env`)

| Variable       | Description                                                 | Default |
|----------------|-------------------------------------------------------------|---------|
| `VITE_API_URL` | Base URL of deployed backend API (e.g. `https://your-api.onrender.com/api`) | `/api` |

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/santhoshreddynarra/task-management-system.git
cd task-management-system
```

### 2. Install dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 3. Start the backend

```bash
cd backend
npm run dev
# Server running on http://localhost:5000
```

### 4. Start the frontend

```bash
cd frontend
npm run dev
# Dev server running on http://localhost:3000
```

Open **http://localhost:3000** in your browser.

---

## Testing & CI

### Running Backend Tests Locally

The backend includes a comprehensive 72-test automated suite (`auditTest.js`) running against an in-memory MongoDB database:

```bash
cd backend
npm test
```

### Continuous Integration (CI)

A GitHub Actions workflow is configured in `.github/workflows/ci.yml`. On every push or pull request to `main`, the workflow automatically:
1. Provisions Node.js 18 environment
2. Installs backend dependencies (`npm ci`)
3. Runs the full test suite (`npm test`)

---

## Production Deployment & Architecture

### Production Stack
- **Frontend SPA**: Deployed on **Vercel** (or Netlify/Static Host). Set `VITE_API_URL` build environment variable.
- **Backend API**: Deployed on **Render** (or Railway/Heroku). Set `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`, and `CLIENT_URL` environment variables.
- **Database**: **MongoDB Atlas** database cluster.

---

## API Reference

All endpoints (except register/login) require the `Authorization: Bearer <token>` header.

### Auth

| Method | Endpoint             | Description                          | Auth Required |
|--------|----------------------|--------------------------------------|---------------|
| POST   | `/api/auth/register` | Register a new user                  | No            |
| POST   | `/api/auth/login`    | Login and receive JWT token          | No            |
| GET    | `/api/auth/me`       | Get current authenticated user       | Yes           |

### Tasks

| Method | Endpoint                   | Description                         |
|--------|----------------------------|-------------------------------------|
| POST   | `/api/tasks`               | Create a new task                   |
| GET    | `/api/tasks`               | List tasks (filter/sort/paginate)   |
| GET    | `/api/tasks/:id`           | Get single task by ID               |
| PUT    | `/api/tasks/:id`           | Update a task                       |
| DELETE | `/api/tasks/:id`           | Delete a task                       |
| PATCH  | `/api/tasks/:id/status`    | Quick-update task status            |
| GET    | `/api/tasks/analytics`     | Get user task statistics            |

#### `GET /api/tasks` — Query Parameters

| Parameter   | Type   | Default      | Values / Description                         |
|-------------|--------|--------------|----------------------------------------------|
| `status`    | string | —            | `Todo`, `In Progress`, `Done`               |
| `priority`  | string | —            | `Low`, `Medium`, `High`                     |
| `search`    | string | —            | Partial title match (case-insensitive regex) |
| `page`      | number | `1`          | Page number                                  |
| `limit`     | number | `12`         | Tasks per page                               |
| `sortBy`    | string | `createdAt`  | `createdAt`, `dueDate`, `priority`          |
| `sortOrder` | string | `desc`       | `asc`, `desc`                               |l `/api` requests to `http://localhost:5000` via Vite's proxy config — no CORS issues during development.
- JWT tokens are stored in `localStorage` under the key `token`. On 401 responses, the Axios interceptor automatically clears the token and redirects to `/login`.
- MongoDB must be running **before** starting the backend. Without a running MongoDB instance the server will exit immediately with `ECONNREFUSED`.
