-- ============================================================
--  DevFlow – Database Schema
--  Database : MySQL 8
--  Charset  : utf8mb4
-- ============================================================

CREATE DATABASE IF NOT EXISTS devflow
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE devflow;

-- ------------------------------------------------------------
-- 1. USERS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Users (
  id          INT            NOT NULL AUTO_INCREMENT,
  name        VARCHAR(100)   NOT NULL,
  email       VARCHAR(150)   NOT NULL,
  password    VARCHAR(255)   NOT NULL,
  createdAt   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 2. PROJECTS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Projects (
  id          INT            NOT NULL AUTO_INCREMENT,
  name        VARCHAR(200)   NOT NULL,
  description TEXT,
  status      ENUM('Not Started','In Progress','Completed') NOT NULL DEFAULT 'Not Started',
  startDate   DATE,
  endDate     DATE,
  userId      INT            NOT NULL,
  createdAt   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  KEY        idx_projects_userId (userId),
  KEY        idx_projects_status (status),
  CONSTRAINT fk_projects_user
    FOREIGN KEY (userId) REFERENCES Users (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 3. TASKS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Tasks (
  id             INT   NOT NULL AUTO_INCREMENT,
  name           VARCHAR(200) NOT NULL,
  description    TEXT,
  priority       ENUM('Low','Medium','High')              NOT NULL DEFAULT 'Medium',
  status         ENUM('Pending','In Progress','Completed') NOT NULL DEFAULT 'Pending',
  type           ENUM('Feature','Bug','Enhancement')       NOT NULL DEFAULT 'Feature',
  estimatedHours FLOAT,
  dueDate        DATE,
  projectId      INT  NOT NULL,
  userId         INT  NOT NULL,
  createdAt      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  KEY        idx_tasks_projectId (projectId),
  KEY        idx_tasks_userId    (userId),
  KEY        idx_tasks_status    (status),
  KEY        idx_tasks_priority  (priority),
  KEY        idx_tasks_dueDate   (dueDate),
  CONSTRAINT fk_tasks_project
    FOREIGN KEY (projectId) REFERENCES Projects (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_tasks_user
    FOREIGN KEY (userId) REFERENCES Users (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 4. ACTIVITY LOGS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ActivityLogs (
  id        INT          NOT NULL AUTO_INCREMENT,
  action    VARCHAR(255) NOT NULL,
  entity    VARCHAR(50),
  entityId  INT,
  userId    INT          NOT NULL,
  createdAt DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  KEY        idx_activitylogs_userId (userId),
  KEY        idx_activitylogs_entity (entity, entityId),
  CONSTRAINT fk_activitylogs_user
    FOREIGN KEY (userId) REFERENCES Users (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
--  ER RELATIONSHIPS SUMMARY
-- ============================================================
--
--  Users    ──(1)────(Many)──  Projects
--  Users    ──(1)────(Many)──  Tasks
--  Users    ──(1)────(Many)──  ActivityLogs
--  Projects ──(1)────(Many)──  Tasks
--
--  CASCADE DELETE RULES:
--    Delete User    → removes all Projects, Tasks, ActivityLogs
--    Delete Project → removes all Tasks inside it
--
-- ============================================================
--
--  COLUMN NOTES:
--    Users.password      → bcrypt hashed (never plain text)
--    Projects.status     → 'Not Started' | 'In Progress' | 'Completed'
--    Tasks.priority      → 'Low' | 'Medium' | 'High'
--    Tasks.status        → 'Pending' | 'In Progress' | 'Completed'
--    Tasks.type          → 'Feature' | 'Bug' | 'Enhancement'
--    ActivityLogs.entity → 'Project' | 'Task' | 'User'
--
-- ============================================================
