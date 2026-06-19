# ⚡ DevFlow – Project Management System

A full-stack web application for managing software projects and tasks, built with React, Node.js, Express, and MySQL.

---

## Tech Stack

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Frontend | React 19, Vite, Tailwind CSS, React Router, Recharts, React Hook Form + Zod, TanStack Query |
| Backend  | Node.js, Express, Sequelize ORM                 |
| Database | MySQL 8                                         |
| Auth     | JWT + bcrypt                                    |
| Extras   | Winston logger, node-cron, nodemailer, rate limiting |

---

## Project Structure

```
project_manager/
├── backend/
│   ├── config/          # Database config
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Auth middleware
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── services/        # Activity log, cron jobs
│   ├── utils/           # Logger, email
│   ├── validators/      # Input validation rules
│   ├── logs/            # Winston log files
│   └── server.js        # Entry point
└── frontend/
    └── src/
        ├── components/  # Badge, Modal, StatCard, ProgressBar
        ├── context/     # AuthContext, ThemeContext
        ├── layouts/     # MainLayout (sidebar)
        ├── pages/       # Dashboard, Projects, Tasks, Activity, Profile
        ├── services/    # Axios instance
        └── App.jsx      # Routes
```

---

## Prerequisites

- Node.js >= 18
- MySQL 8

---

## Environment Variables (`backend/.env`)

| Variable        | Description                        | Example                    |
|-----------------|------------------------------------|----------------------------|
| `PORT`          | Backend server port                | `5000`                     |
| `DB_HOST`       | MySQL host                         | `localhost`                |
| `DB_PORT`       | MySQL port                         | `3306`                     |
| `DB_USER`       | MySQL username                     | `root`                     |
| `DB_PASSWORD`   | MySQL password                     | `yourpassword`             |
| `DB_NAME`       | MySQL database name                | `devflow`                  |
| `JWT_SECRET`    | Secret key for JWT signing         | `your_secret_key`          |
| `JWT_EXPIRES_IN`| JWT token expiry                   | `7d`                       |
| `EMAIL_HOST`    | SMTP host for email reminders      | `smtp.gmail.com`           |
| `EMAIL_PORT`    | SMTP port                          | `587`                      |
| `EMAIL_USER`    | SMTP email address                 | `you@gmail.com`            |
| `EMAIL_PASS`    | SMTP app password                  | `your_app_password`        |
| `CLIENT_URL`    | Frontend URL for CORS              | `http://localhost:5173`    |

---

## Database Setup

```bash
# Login to MySQL and create database
mysql -u root -p
CREATE DATABASE devflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

Tables are auto-created on first server start via `sequelize.sync({ alter: true })`.

### Database Schema (ER Overview)

```
Users
  id, name, email (unique), password (hashed), createdAt, updatedAt

Projects
  id, name, description, status (enum), startDate, endDate,
  userId (FK → Users.id), createdAt, updatedAt

Tasks
  id, name, description, priority (enum), status (enum), type (enum),
  estimatedHours, dueDate, projectId (FK → Projects.id),
  userId (FK → Users.id), createdAt, updatedAt

ActivityLogs
  id, action, entity, entityId, userId (FK → Users.id), createdAt, updatedAt
```

**Relationships:**
- User → (1:Many) → Projects
- Project → (1:Many) → Tasks
- User → (1:Many) → Tasks
- User → (1:Many) → ActivityLogs

---

## Setup & Run

### Backend

```bash
cd backend
npm install
# Edit .env with your credentials
npm run dev
```

Server starts on `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App opens at `http://localhost:5173`

---

## API Documentation

All protected routes require: `Authorization: Bearer <token>`

### Authentication

| Method | Endpoint              | Auth | Description              |
|--------|-----------------------|------|--------------------------|
| POST   | `/api/auth/register`  | No   | Register new user        |
| POST   | `/api/auth/login`     | No   | Login (rate limited)     |
| POST   | `/api/auth/logout`    | Yes  | Logout (invalidate token)|
| GET    | `/api/auth/profile`   | Yes  | Get current user profile |
| PUT    | `/api/auth/profile`   | Yes  | Update name or password  |

**Register Body:**
```json
{ "name": "John Doe", "email": "john@example.com", "password": "secret123" }
```

**Login Body:**
```json
{ "email": "john@example.com", "password": "secret123" }
```

**Login Response:**
```json
{ "token": "<jwt>", "user": { "id": 1, "name": "John Doe", "email": "john@example.com" } }
```

---

### Projects

| Method | Endpoint              | Description                        |
|--------|-----------------------|------------------------------------|
| GET    | `/api/projects`       | Get all projects (search/filter/sort/paginate) |
| GET    | `/api/projects/:id`   | Get project with tasks             |
| POST   | `/api/projects`       | Create project                     |
| PUT    | `/api/projects/:id`   | Update project                     |
| DELETE | `/api/projects/:id`   | Delete project (cascades tasks)    |

**Query Params (GET /api/projects):**
- `search` — filter by name
- `status` — `Not Started` | `In Progress` | `Completed`
- `sort` — `newest` | `oldest`
- `page` — page number (default: 1)
- `limit` — items per page (default: 10)

**Create/Update Body:**
```json
{
  "name": "E-Commerce Website",
  "description": "Full stack shop",
  "status": "In Progress",
  "startDate": "2024-01-01",
  "endDate": "2024-06-30"
}
```

---

### Tasks

| Method | Endpoint                 | Description                   |
|--------|--------------------------|-------------------------------|
| GET    | `/api/tasks`             | Get all tasks (with filters)  |
| GET    | `/api/tasks/:id`         | Get single task               |
| POST   | `/api/tasks`             | Create task                   |
| PUT    | `/api/tasks/:id`         | Update task                   |
| DELETE | `/api/tasks/:id`         | Delete task                   |
| PATCH  | `/api/tasks/:id/complete`| Mark task as completed        |

**Query Params (GET /api/tasks):**
- `search`, `status`, `priority`, `type`, `sort`, `page`, `limit`, `projectId`

**Create/Update Body:**
```json
{
  "name": "Build login page",
  "description": "JWT-based authentication",
  "projectId": 1,
  "priority": "High",
  "status": "Pending",
  "type": "Feature",
  "dueDate": "2024-03-15",
  "estimatedHours": 8
}
```

---

### Dashboard

| Method | Endpoint          | Description                        |
|--------|-------------------|------------------------------------|
| GET    | `/api/dashboard`  | Get stats, charts, recent activity |

**Response includes:**
- `stats` — totalProjects, totalTasks, completedTasks, pendingTasks, inProgressProjects, overdueTasks, completionPercentage
- `charts` — taskStatus (pie), taskPriority (bar), weeklyCompleted (line)
- `recentProjects` — 5 most recently updated
- `activityLogs` — 10 most recent actions

---

### Error Response Format

```json
{ "message": "Error description" }
```

Validation errors:
```json
{
  "errors": [
    { "field": "email", "message": "Valid email is required" },
    { "field": "password", "message": "Password must be at least 6 characters" }
  ]
}
```

---

## Security Features

- Passwords hashed with **bcrypt** (10 salt rounds)
- **JWT** authentication on all protected routes
- Token **blacklist** on logout
- **Rate limiting**: 10 login attempts / 15 min, 20 registrations / hour
- **Input validation** on all POST/PUT endpoints via `express-validator`
- **Authorization**: users can only access their own data (userId scoping on all queries)
- **SQL Injection protection** via Sequelize ORM parameterized queries
- Sensitive fields (password) never returned in API responses

---

## Bonus Features

- 📊 Dashboard with Pie, Bar, and Line charts
- 📋 Activity logs for all create/update/delete actions
- 📧 Email reminders for tasks due tomorrow (daily cron at 8 AM)
- 🌙 Dark mode toggle
- 📄 Pagination on all list endpoints
- 🔄 Project progress percentage based on completed tasks
- ⚠️ Overdue task highlighting
- 👤 Profile page with name and password update
