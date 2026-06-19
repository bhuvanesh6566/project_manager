# ⚡ DevFlow – Project Management System

A full-stack web application for managing software projects and tasks with dashboards, analytics, and email reminders.

🌐 **Live Demo:** https://project-manager-bay-iota.vercel.app  
🔗 **GitHub:** https://github.com/bhuvanesh6566/project_manager

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Project Setup Instructions](#project-setup-instructions)
4. [Environment Variable Documentation](#environment-variable-documentation)
5. [Database Setup Instructions](#database-setup-instructions)
6. [API Documentation](#api-documentation)
7. [Security Features](#security-features)
8. [Bonus Features](#bonus-features)

---

## Tech Stack

| Layer    | Technology |
|----------|-----------|
| Frontend | React 19, Vite, Tailwind CSS, React Router, Recharts, React Hook Form + Zod, TanStack Query |
| Backend  | Node.js, Express.js, Sequelize ORM |
| Database | MySQL 8 |
| Auth     | JWT + bcrypt |
| Extras   | Winston logger, node-cron, nodemailer, express-rate-limit, express-validator |

---

## Project Structure

```
project_manager/
├── backend/
│   ├── config/
│   │   └── database.js          # Sequelize + MySQL connection
│   ├── controllers/
│   │   ├── authController.js    # Register, login, logout, profile
│   │   ├── projectController.js # Project CRUD
│   │   ├── taskController.js    # Task CRUD
│   │   └── dashboardController.js # Stats + charts
│   ├── middleware/
│   │   └── auth.js              # JWT verification + blacklist check
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Task.js
│   │   ├── ActivityLog.js
│   │   └── index.js             # Associations
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   └── dashboard.js
│   ├── services/
│   │   ├── activityService.js   # Activity log helper
│   │   └── cronService.js       # Daily email reminder cron
│   ├── utils/
│   │   ├── logger.js            # Winston logger
│   │   └── email.js             # Nodemailer
│   ├── validators/
│   │   └── validators.js        # express-validator rules
│   ├── logs/                    # Winston log files
│   ├── .env                     # Environment variables
│   └── server.js                # Entry point
├── frontend/
│   └── src/
│       ├── components/          # Badge, Modal, StatCard, ProgressBar
│       ├── context/             # AuthContext, ThemeContext
│       ├── layouts/             # MainLayout (sidebar + mobile nav)
│       ├── pages/               # Dashboard, Projects, Tasks, Activity, Profile
│       ├── services/
│       │   └── api.js           # Axios instance
│       └── App.jsx              # Routes
├── database/
│   └── schema.sql               # Full MySQL schema with indexes + FK
└── README.md
```

---

## Project Setup Instructions

### Prerequisites

- Node.js >= 18
- MySQL 8 (local) or Aiven free cloud MySQL
- Git

---

### 1. Clone the Repository

```bash
git clone https://github.com/bhuvanesh6566/project_manager.git
cd project_manager
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create your `.env` file (see [Environment Variables](#environment-variable-documentation)):

```bash
cp .env.example .env
# Edit .env with your values
```

Start the backend:

```bash
npm run dev       # Development (nodemon)
npm start         # Production
```

Server runs at: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App runs at: `http://localhost:5173`

> For production build: `npm run build`

---

## Environment Variable Documentation

Create `backend/.env` with the following variables:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | No | Backend server port | `5000` |
| `DB_HOST` | ✅ | MySQL hostname | `localhost` |
| `DB_PORT` | ✅ | MySQL port | `3306` |
| `DB_USER` | ✅ | MySQL username | `root` |
| `DB_PASSWORD` | ✅ | MySQL password | `yourpassword` |
| `DB_NAME` | ✅ | MySQL database name | `devflow` |
| `JWT_SECRET` | ✅ | Secret key for signing JWT tokens | `any_random_string` |
| `JWT_EXPIRES_IN` | No | JWT token expiry duration | `7d` |
| `EMAIL_HOST` | No | SMTP host for email reminders | `smtp.gmail.com` |
| `EMAIL_PORT` | No | SMTP port | `587` |
| `EMAIL_USER` | No | SMTP sender email address | `you@gmail.com` |
| `EMAIL_PASS` | No | Gmail App Password (not login password) | `xxxx xxxx xxxx xxxx` |
| `CLIENT_URL` | ✅ | Frontend URL for CORS | `http://localhost:5173` |

> **Gmail App Password:** Go to Google Account → Security → 2-Step Verification → App Passwords → generate one for "Mail".

---

### Frontend Environment Variables

Create `frontend/.env` for production:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `https://your-backend.onrender.com/api` |

> In local development, the Vite proxy handles `/api` automatically — no `.env` needed.

---

## Database Setup Instructions

### Option A — Local MySQL

```sql
-- Run in MySQL client
CREATE DATABASE devflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then start the backend — Sequelize auto-creates all tables via:
```js
sequelize.sync({ alter: true })
```

### Option B — Run Schema Manually

```bash
mysql -u root -p devflow < database/schema.sql
```

### Option C — Cloud MySQL (Aiven)

1. Sign up at [aiven.io](https://aiven.io) → create free MySQL service
2. Copy `Host`, `Port`, `User`, `Password` from the Aiven dashboard
3. Add them to your `.env`
4. SSL is required — already configured in `config/database.js`

---

### Database Schema (ER Overview)

```
Users
  id, name, email (unique), password (bcrypt), createdAt, updatedAt

Projects
  id, name, description, status (enum), startDate, endDate,
  userId (FK → Users.id), createdAt, updatedAt

Tasks
  id, name, description, priority (enum), status (enum), type (enum),
  estimatedHours, dueDate,
  projectId (FK → Projects.id), userId (FK → Users.id),
  createdAt, updatedAt

ActivityLogs
  id, action, entity, entityId,
  userId (FK → Users.id), createdAt, updatedAt
```

**Relationships:**
- User `1 → Many` Projects
- User `1 → Many` Tasks
- User `1 → Many` ActivityLogs
- Project `1 → Many` Tasks

**Cascade:** Deleting a User removes all their Projects, Tasks, and Logs. Deleting a Project removes all its Tasks.

---

## API Documentation

All protected routes require the header:
```
Authorization: Bearer <token>
```

---

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Register a new user |
| `POST` | `/api/auth/login` | ❌ | Login (rate limited: 10/15min) |
| `POST` | `/api/auth/logout` | ✅ | Logout and invalidate token |
| `GET` | `/api/auth/profile` | ✅ | Get current user info |
| `PUT` | `/api/auth/profile` | ✅ | Update name or password |

**POST /api/auth/register**
```json
{ "name": "John Doe", "email": "john@example.com", "password": "secret123" }
```

**POST /api/auth/login**
```json
{ "email": "john@example.com", "password": "secret123" }
```
Response:
```json
{ "token": "<jwt>", "user": { "id": 1, "name": "John Doe", "email": "john@example.com" } }
```

---

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects` | Get all projects (search/filter/sort/paginate) |
| `GET` | `/api/projects/:id` | Get single project with tasks |
| `POST` | `/api/projects` | Create a project |
| `PUT` | `/api/projects/:id` | Update a project |
| `DELETE` | `/api/projects/:id` | Delete project (cascades tasks) |

**Query Parameters (GET /api/projects):**

| Param | Description | Values |
|-------|-------------|--------|
| `search` | Filter by project name | any string |
| `status` | Filter by status | `Not Started`, `In Progress`, `Completed` |
| `sort` | Sort order | `newest` (default), `oldest` |
| `page` | Page number | default: `1` |
| `limit` | Items per page | default: `10` |

**Request Body (POST/PUT):**
```json
{
  "name": "E-Commerce Website",
  "description": "Full stack shopping app",
  "status": "In Progress",
  "startDate": "2024-01-01",
  "endDate": "2024-06-30"
}
```

---

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tasks` | Get all tasks (with filters) |
| `GET` | `/api/tasks/:id` | Get single task |
| `POST` | `/api/tasks` | Create a task |
| `PUT` | `/api/tasks/:id` | Update a task |
| `DELETE` | `/api/tasks/:id` | Delete a task |
| `PATCH` | `/api/tasks/:id/complete` | Mark task as completed |

**Query Parameters (GET /api/tasks):**

| Param | Description |
|-------|-------------|
| `search` | Filter by task name |
| `status` | `Pending`, `In Progress`, `Completed` |
| `priority` | `Low`, `Medium`, `High` |
| `type` | `Feature`, `Bug`, `Enhancement` |
| `projectId` | Filter by project |
| `sort` | `newest` or `oldest` |
| `page` / `limit` | Pagination |

**Request Body (POST/PUT):**
```json
{
  "name": "Build login page",
  "description": "JWT-based auth",
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

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dashboard` | Get stats, charts, recent activity |

**Response:**
```json
{
  "stats": {
    "totalProjects": 5,
    "totalTasks": 20,
    "completedTasks": 8,
    "pendingTasks": 7,
    "inProgressProjects": 3,
    "overdueTasks": 2,
    "completionPercentage": 40
  },
  "charts": {
    "taskStatus": [...],
    "taskPriority": [...],
    "weeklyCompleted": [...]
  },
  "recentProjects": [...],
  "activityLogs": [...]
}
```

---

### Error Responses

**General error:**
```json
{ "message": "Error description" }
```

**Validation error (422):**
```json
{
  "errors": [
    { "field": "email", "message": "Valid email is required" },
    { "field": "password", "message": "Password must be at least 6 characters" }
  ]
}
```

**Unauthorized (401):**
```json
{ "message": "No token provided" }
```

---

## Security Features

| Feature | Implementation |
|---------|---------------|
| Password hashing | bcrypt with 10 salt rounds |
| Authentication | JWT tokens with expiry |
| Token invalidation | In-memory blacklist on logout |
| Rate limiting | 10 login attempts / 15 min per IP |
| Input validation | express-validator on all POST/PUT |
| Authorization | userId scoping — users only access own data |
| SQL Injection | Sequelize ORM parameterized queries |
| Sensitive data | Password field never returned in responses |
| CORS | Restricted to `CLIENT_URL` only |

---

## Bonus Features

- 📊 Dashboard with Pie, Bar, and Line charts (Recharts)
- 📋 Activity logs for all create/update/delete actions
- 📧 3-tier email reminders (3 days before, 1 day before, overdue) via daily cron at 8 AM
- 🌙 Dark mode toggle
- 📄 Pagination on all list endpoints
- 🔄 Project progress percentage based on completed tasks
- ⚠️ Overdue task highlighting in red
- 👤 Profile page — update name and change password
- 📱 Responsive design — mobile bottom nav + desktop sidebar
