# JobStacker

A full-stack web application to track and organize job applications. Keep all your applications, interviews, and statuses in one place.

## Tech Stack

| Layer      | Technology                     |
|------------|--------------------------------|
| Frontend   | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Backend    | Node.js, Express 5             |
| Database   | PostgreSQL, Sequelize ORM      |
| Auth       | JWT, bcrypt                    |

## Database Schema

![Database Schema](docs/schema.png)

### Tables

**Users** — Registered users of the platform.
| Column        | Type         | Constraints          |
|---------------|--------------|----------------------|
| id            | INTEGER      | PK, Auto Increment   |
| username      | VARCHAR(255) | UNIQUE, NOT NULL     |
| email         | VARCHAR(255) | UNIQUE, NOT NULL     |
| password_hash | VARCHAR(255) | NOT NULL             |
| created_at    | TIMESTAMP    | DEFAULT now()        |

**Companies** — Companies where jobs are listed.
| Column   | Type         | Constraints          |
|----------|--------------|----------------------|
| id       | INTEGER      | PK, Auto Increment   |
| title    | VARCHAR(255) | UNIQUE, NOT NULL     |
| location | VARCHAR(255) |                      |

**Jobs** — Job listings tied to a company.
| Column     | Type          | Constraints                        |
|------------|---------------|------------------------------------|
| id         | INTEGER       | PK, Auto Increment                 |
| company_id | INTEGER       | FK → companies(id)                 |
| title      | VARCHAR(255)  | NOT NULL                           |
| description| TEXT          |                                    |
| url        | TEXT          |                                    |
| salary     | DECIMAL(10,2) |                                    |
| work_mode  | ENUM          | 'remote', 'hybrid', 'onsite'       |

**Applications** — Tracks a user's application to a job.
| Column     | Type      | Constraints                                          |
|------------|-----------|------------------------------------------------------|
| id         | INTEGER   | PK, Auto Increment                                   |
| user_id    | INTEGER   | FK → users(id)                                       |
| job_id     | INTEGER   | FK → jobs(id)                                        |
| status     | ENUM      | 'applied', 'interviewing', 'rejected', 'offered', 'ghosted' |
| applied_at | TIMESTAMP | DEFAULT now()                                        |

**Interviews** — Interview rounds for an application.
| Column          | Type         | Constraints                                              |
|-----------------|--------------|----------------------------------------------------------|
| id              | INTEGER      | PK, Auto Increment                                       |
| application_id  | INTEGER      | FK → applications(id)                                    |
| round_type      | VARCHAR(255) |                                                          |
| scheduled_start | TIMESTAMP    | NOT NULL                                                 |
| scheduled_end   | TIMESTAMP    | NOT NULL                                                 |
| status          | ENUM         | 'scheduled', 'completed', 'canceled', 'passed', 'failed'|
| notes           | TEXT         |                                                          |

### Relationships

```
User ──< Application >── Job ──> Company
              │
              └──< Interview
```

- A **User** has many **Applications**
- A **Job** belongs to a **Company**
- An **Application** belongs to a **User** and a **Job**
- An **Interview** belongs to an **Application**

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL

### Setup

**1. Clone the repository**
```bash
git clone <your-repo-url>
cd JobStacker
```

**2. Backend**
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
DEV_DB_USER=your_db_user
DEV_DB_PASS=your_db_password
DEV_DB_NAME=jobstacker
DEV_DB_HOST=localhost
DEV_DB_PORT=5432
```

Run database migrations:
```bash
npx sequelize-cli db:migrate
```

Start the server:
```bash
node src/app.js
```

**3. Frontend**
```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
JobStacker/
├── backend/
│   ├── config/          # Database configuration
│   ├── migrations/      # Sequelize migrations
│   ├── models/          # Sequelize models
│   ├── seeders/         # Database seed data
│   ├── src/
│   │   └── app.js       # Express server entry point
│   └── .env             # Environment variables (not committed)
├── frontend/
│   ├── app/             # Next.js app directory
│   └── public/          # Static assets
└── docs/
    └── schema.png       # Database diagram
```


