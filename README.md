# Student Task Manager

A modern full stack productivity platform for students to organize assignments, deadlines, and study sessions.

## Features
- Secure authentication with JWT and bcrypt password hashing
- Task management with priorities, status updates, and multiple views (board, table)
- Analytics dashboard with productivity charts
- Calendar view with task scheduling
- Pomodoro focus timer and focus tools
- Wellness tracking (mood logs, burnout score, weekly workload, recommendations)
- Task breakdown into actionable subtasks (OpenAI-powered)

## Tech Stack
- Frontend: React (Vite), Tailwind CSS, React Router, Axios, Recharts, Framer Motion
- Backend: Node.js, Express.js, Mongoose-style models with JSON file persistence (`backend/data/`)
- Auth: JWT, bcrypt

## Project Structure
```
backend/
   data/
   src/
      config/
      controllers/
      middleware/
      models/
      routes/
frontend/
   src/
      api/
      components/
      context/
      pages/
```

## Setup
### Backend
1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Create `.env` based on `.env.sample` and set your JWT secret (OpenAI key required for task breakdown).
3. The backend uses a JSON-backed mock database by default (data stored in `backend/data/`).
4. Start the API server:
   ```bash
   npm run dev
   ```

Optional: To use a real MongoDB instance, replace the mock import in `backend/src/config/db.js` with `import mongoose from 'mongoose';` and provide `MONGO_URI` in `.env`.

### Frontend
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Update `frontend/.env.example` as needed and create a `.env` file if you want a custom API URL.
3. Start the client:
   ```bash
   npm run dev
   ```

## API Overview
- `POST /api/auth/register` - register a new user
- `POST /api/auth/login` - login and receive a JWT
- `POST /api/auth/logout` - logout
- `GET /api/auth/me` - fetch current user profile
- `GET /api/tasks` - list tasks with filters
- `POST /api/tasks` - create a task
- `PUT /api/tasks/:id` - update a task
- `DELETE /api/tasks/:id` - delete a task
- `GET /api/tasks/stats` - task stats
- `GET /api/tasks/analytics` - analytics data
- `POST /api/tasks/breakdown` - break down a task into actionable subtasks using OpenAI
- `GET /api/wellness` - aggregated wellness data
- `POST /api/wellness/log` - log mood and focus hours
- `GET /api/wellness/burnout` - burnout score
- `GET /api/wellness/weekly` - weekly workload
- `GET /api/wellness/focus-break` - focus vs break ratio
- `GET /api/wellness/recommendations` - wellness recommendations

## Deployment Notes
- Backend: deploy to Render, Railway, or Azure App Service
- Frontend: deploy to Vercel or Netlify
- Set `VITE_API_URL` to your deployed backend URL
- Ensure the backend `JWT_SECRET` and `OPENAI_API_KEY` are set in production
- If you keep the JSON-backed data store, use a host with persistent storage

## Environment Variables
Backend `.env.sample`:
```
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key_here
```

Frontend `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

"# Student-Task-Manager" 
