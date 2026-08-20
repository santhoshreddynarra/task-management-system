# TaskFlow — Task Management System

A full-stack MERN task management application with JWT authentication, advanced filtering, sorting, pagination, and a dark glassmorphism UI.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Git History](#git-history)

---

## Tech Stack

| Layer     | Technology                            |
|-----------|---------------------------------------|
| Backend   | Node.js, Express.js, Mongoose         |
| Database  | MongoDB (local or Atlas)              |
| Auth      | JWT (JSON Web Tokens), bcryptjs       |
| Frontend  | React 18, Vite, React Router v6       |
| HTTP      | Axios (with interceptors)             |
| Icons     | lucide-react                          |
| Styling   | Vanilla CSS with CSS custom properties |

---

## Features

### Backend
- User registration & login with hashed passwords (bcryptjs)
- JWT-based authentication with 7-day token expiry
- Task CRUD: create, read, update, delete
- Quick status patch endpoint (`PATCH /api/tasks/:id/status`)
- Task analytics aggregation endpoint
- Query filtering: `status`, `priority`, `search` (regex)
- Sorting: `createdAt`, `dueDate`, `priority`, `title` (asc/desc)
- Pagination: `page`, `limit` (defaults: page 1, limit 12)
- Mongoose input sanitization (`$` operator stripping)
- Consistent JSON error responses via centralized error middleware

### Frontend
- Dark glassmorphism design system with CSS custom properties
- Register & Login pages with client-side validation
- Protected routes (JWT persisted in localStorage)
- Dashboard with live analytics cards and completion progress bar
- Task grid with skeleton loading states and empty states
- Create / Edit tasks via animated modal (title, description, status, priority, due date)
- Quick status toggle on task cards (Todo → In Progress → Done)
- Debounced search (300ms), status filter tabs, priority filter dropdown
- Sort controls: field selector + asc/desc toggle
- Pagination with per-page selector (6 / 12 / 24 / 48)
- Toast notifications for all actions (slide-in animation)
- Responsive layout for tablet (≤768px) and mobile (≤480px)

---

## Project Structure

```
task-management-system/
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
│   ├── app.js
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

## Prerequisites

- **Node.js** v18+ and **npm** v9+
- **MongoDB** (local installation **or** a MongoDB Atlas cluster URI)

### MongoDB options

**Option A – Local MongoDB**
Install MongoDB Community Edition from https://www.mongodb.com/try/download/community and start the service:
```bash
# Windows (PowerShell, as Administrator)
net start MongoDB
# or if installed manually:
mongod --dbpath "C:\data\db"
```

**Option B – MongoDB Atlas (recommended for cloud)**
1. Create a free cluster at https://cloud.mongodb.com
2. Whitelist your IP address
3. Copy the connection string and set it as `MONGO_URI` in `backend/.env`

---

## Environment Variables

Create `backend/.env` (copy from `backend/.env.example` if provided):

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/task_management_db
JWT_SECRET=your_strong_random_secret_here
NODE_ENV=development
```

| Variable    | Description                                              |
|-------------|----------------------------------------------------------|
| `PORT`      | Port the Express server listens on (default `5000`)     |
| `MONGO_URI` | MongoDB connection string (local or Atlas)              |
| `JWT_SECRET`| Secret key for signing JWTs — use a long random string  |
| `NODE_ENV`  | `development` or `production`                           |

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

### 3. Configure environment

```bash
cd backend
# Create .env with the variables listed above
```

### 4. Start the backend

```bash
cd backend
npm start
# Server running on http://localhost:5000
```

### 5. Start the frontend

```bash
cd frontend
npm run dev
# Dev server running on http://localhost:3000
```

Open **http://localhost:3000** in your browser.

---

## API Reference

All endpoints (except register/login) require the `Authorization: Bearer <token>` header.

### Auth

| Method | Endpoint             | Description                          | Auth Required |
|--------|----------------------|--------------------------------------|---------------|
| POST   | `/api/auth/register` | Register a new user                  | No            |
| POST   | `/api/auth/login`    | Login and receive JWT token          | No            |
| GET    | `/api/auth/me`       | Get the current authenticated user  | Yes           |

**Register / Login request body:**
```json
{
  "name": "Jane Doe",       // register only
  "email": "jane@example.com",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
}
```

---

### Tasks

| Method | Endpoint                   | Description                         |
|--------|----------------------------|-------------------------------------|
| POST   | `/api/tasks`               | Create a new task                   |
| GET    | `/api/tasks`               | List tasks (with filter/sort/page)  |
| GET    | `/api/tasks/:id`           | Get a single task by ID             |
| PUT    | `/api/tasks/:id`           | Update a task                       |
| DELETE | `/api/tasks/:id`           | Delete a task                       |
| PATCH  | `/api/tasks/:id/status`    | Quick-update task status            |
| GET    | `/api/tasks/analytics`     | Get task analytics for current user |

#### `GET /api/tasks` — Query Parameters

| Parameter   | Type   | Default      | Values / Description                         |
|-------------|--------|--------------|----------------------------------------------|
| `status`    | string | —            | `Todo`, `In Progress`, `Done`               |
| `priority`  | string | —            | `Low`, `Medium`, `High`                     |
| `search`    | string | —            | Partial title match (case-insensitive regex) |
| `page`      | number | `1`          | Page number                                  |
| `limit`     | number | `12`         | Tasks per page                               |
| `sortBy`    | string | `createdAt`  | `createdAt`, `dueDate`, `priority`, `title` |
| `sortOrder` | string | `desc`       | `asc`, `desc`                               |

**Response:**
```json
{
  "tasks": [...],
  "totalTasks": 42,
  "totalPages": 4,
  "page": 1,
  "limit": 12
}
```

#### Task object shape

```json
{
  "_id": "...",
  "title": "Fix login bug",
  "description": "Optional description text",
  "status": "In Progress",
  "priority": "High",
  "dueDate": "2026-09-01T00:00:00.000Z",
  "user": "...",
  "createdAt": "2026-08-20T09:00:00.000Z",
  "updatedAt": "2026-08-20T12:00:00.000Z"
}
```

#### `GET /api/tasks/analytics` — Response

```json
{
  "totalTasks": 20,
  "completedTasks": 8,
  "pendingTasks": 12,
  "completionPercentage": 40
}
```

---

## Git History

| Commit | Message |
|--------|---------|
| `e69e049` | `fix: harden backend and resolve api issues` |
| `e0d7d36` | `feat: set up react frontend` |
| `209bc79` | `feat: add authentication pages and protected routes` |
| `f2f5531` | `feat: build dashboard and task statistics` |
| `2218a4c` | `feat: implement task management interface` |
| `1d29ec3` | `feat: add task search and filters` |
| `5b578ac` | `feat: add task sorting and pagination` |
| `ff05d93` | `style: improve dashboard usability and responsive layout` |

---

## Notes

- The frontend dev server proxies all `/api` requests to `http://localhost:5000` via Vite's proxy config — no CORS issues during development.
- JWT tokens are stored in `localStorage` under the key `token`. On 401 responses, the Axios interceptor automatically clears the token and redirects to `/login`.
- MongoDB must be running **before** starting the backend. Without a running MongoDB instance the server will exit immediately with `ECONNREFUSED`.
