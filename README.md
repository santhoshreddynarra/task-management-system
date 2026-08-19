# Task Management System

A MERN stack task management application built as part of a technical assessment.

## Project Structure

```
task-management-system/
├── frontend/          # React + Vite client application
├── backend/           # Node.js + Express REST API
├── .gitignore
└── README.md
```

## Backend Architecture

```
backend/
├── config/            # Database and external service configuration
├── controllers/       # Route request handlers and business logic
├── middleware/        # Custom Express middleware (auth, error handling, etc.)
├── models/            # Mongoose data models and schemas
├── routes/            # Express route declarations
├── app.js             # Express app setup and middleware configuration
├── server.js          # Server entry point and database connection
├── package.json       # Backend dependencies and scripts
└── .env.example       # Example environment configuration
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB instance (local or Atlas URI)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Configure the environment variables:
   - `PORT`: Server port (defaults to 5000)
   - `MONGO_URI`: MongoDB connection string
   - `JWT_SECRET`: Secret key for JWT signing

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Verify the server is running:
   - Make a GET request to `http://localhost:5000/`
