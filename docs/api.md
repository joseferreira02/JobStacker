# JobStacker API Documentation

Base URL: `http://localhost:3001`

---

## Auth

### POST /auth/register

Creates a new user account.

**Request body:**
```json
{
  "username": "john",
  "email": "john@example.com",
  "password": "mypassword123"
}
```

**Responses:**

| Status | Description |
|--------|-------------|
| 201 | User created successfully |
| 400 | Missing required fields |
| 409 | Email or username already in use |
| 500 | Internal server error |

**Success response (201):**
```json
{
  "token": "<jwt>",
  "user": {
    "id": 3,
    "username": "john",
    "email": "john@example.com"
  }
}
```

---

### POST /auth/login

Authenticates an existing user.

**Request body:**
```json
{
  "email": "john@example.com",
  "password": "mypassword123"
}
```

**Responses:**

| Status | Description |
|--------|-------------|
| 200 | Login successful |
| 400 | Missing required fields |
| 401 | Invalid credentials |
| 500 | Internal server error |

**Success response (200):**
```json
{
  "token": "<jwt>",
  "user": {
    "id": 2,
    "username": "john",
    "email": "john@example.com"
  }
}
```

---

## Notes

- JWT tokens expire after **7 days**
- Passwords are hashed with **bcrypt** (12 salt rounds) — never stored in plain text
- All request bodies must be `Content-Type: application/json`
- Protected routes (to be added) require the token in the `Authorization` header:
  ```
  Authorization: Bearer <token>
  ```
