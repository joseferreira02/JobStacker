# JobStacker

A full-stack web application to track and organize job applications. Keep all your applications, interviews, and statuses in one place.

## Tech Stack

| Layer      | Technology                     |
|------------|--------------------------------|
| Frontend   | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Backend    | Node.js, Express 5             |
| Database   | PostgreSQL, Sequelize ORM      |
| Auth       | JWT, bcrypt                    |
| Docs       | Swagger / OpenAPI 3.0          |
| CI         | GitHub Actions                 |

## Screenshots

### Login
![Login page](docs/auth-login.png)

### Register
![Register page](docs/auth-register.png)

## API Reference

Interactive docs available at `http://localhost:3001/api-docs` when the backend is running.

### Auth

This system's authentication layer was built with `OWASP` best practices and the `IAAA` security model in mind. Identification is handled through unique username and email constraints enforced at the database level, preventing duplicate identities. Authentication is performed via `bcrypt` password hashing with configurable salt rounds, and a dual-token strategy — short-lived `JWT access` tokens paired with rotating httpOnly refresh tokens, stored as hashed values in the database to mitigate token theft. Authorization is enforced through a Bearer token middleware that validates every access token before any protected resource is reached, keeping credentials out of request bodies entirely. Accountability is maintained through structured logging via a scoped Pino logger, capturing failed login attempts, token reuse events, and unexpected errors with IP addresses and user context for auditability. Additional hardening includes refresh token rotation with reuse detection (triggering full session revocation), rate limiting on all auth endpoints, and secure, SameSite-strict cookie configuration.

#### `POST /auth/register`
Register a new user.

**Request body**
```json
{
  "username": "john",
  "email": "john@example.com",
  "password": "mypassword123"
}
```

**Responses**
| Status | Description |
|--------|-------------|
| `201`  | User created — returns `{ token, user }` |
| `400`  | Missing required fields |
| `409`  | Email or username already in use |
| `500`  | Internal server error |

---

#### `POST /auth/login`
Login with email and password.

**Request body**
```json
{
  "email": "john@example.com",
  "password": "mypassword123"
}
```

**Responses**
| Status | Description |
|--------|-------------|
| `200`  | Login successful — returns `{ token, user }` |
| `400`  | Missing required fields |
| `401`  | Invalid credentials |
| `500`  | Internal server error |

---

The `token` returned from both endpoints is a JWT. Pass it in the `Authorization` header for protected routes:
```
Authorization: Bearer <token>
```

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

**Roles** — Available user roles (e.g. user, admin).
| Column      | Type        | Constraints          |
|-------------|-------------|----------------------|
| id          | INTEGER     | PK, Auto Increment   |
| name        | VARCHAR(50) | UNIQUE, NOT NULL     |
| description | TEXT        |                      |

**User Roles** — Maps users to their roles (many-to-many).
| Column      | Type      | Constraints          |
|-------------|-----------|----------------------|
| user_id     | INTEGER   | PK, FK → users(id)   |
| role_id     | INTEGER   | PK, FK → roles(id)   |
| assigned_at | TIMESTAMP | DEFAULT now()        |

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
User ──<< UserRole >>── Role
  │
  └──< Application >── Job ──> Company
            │
            └──< Interview
```

- A **User** has many **Roles** (through UserRole)
- A **Role** has many **Users** (through UserRole)
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

JWT_REFRESH_SECRET=your-jwt-key
JWT_ISSUER=jwt-issuer
JWT_AUDIENCE=jwt-audience
SALT_ROUNDS=your-salt-rounds
```

Create a `public.pem` and `private.pem` in `backend/keys/` and generate an RSA key pair.

Run database migrations:
```bash
npx sequelize-cli db:migrate
```

Start the server:
```bash
npm run dev
```

Create a docker image with redis:

```sh
docker run -d  --name redis-server   -p 6379:6379   redis:7
``


**3. Frontend**
```bash
cd frontend
npm install
npm run dev
```



