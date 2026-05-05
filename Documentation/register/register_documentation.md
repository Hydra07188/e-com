# Register Feature Documentation

## Contract Table

| Field | Contract |
| --- | --- |
| Feature | User registration |
| Endpoint | `POST /api/auth/register` |
| Request Body | `{ "firstName": "Jane", "email": "jane@example.com", "password": "Strong@123" }` |
| Frontend Validation | Name, email, and password are required. Password must be at least 8 characters and include one uppercase letter and one special character. |
| Backend Validation | Validates required fields, email format, password policy, and duplicate email in `auth_user.json` and SQLite. |
| Password Storage | The plaintext password is never stored. The server hashes it with bcrypt before saving. |
| JSON Persistence | New users are appended to `auth_user.json` with a bcrypt password hash and registration date. |
| Database Persistence | New users are inserted into SQLite `users` table with the same bcrypt hash. |
| Success Response | `201 Created` with `{ message, token, user }` |
| Duplicate Email Response | `409 Conflict` with `{ error: "Email is already registered." }` |
| Invalid Input Response | `400 Bad Request` with a validation error message |
| Security Notes | JWT contains non-sensitive identity data. Password comparison uses bcrypt. Errors do not expose whether a password or email was the exact failure point during login. |

## Activity Diagram

```mermaid
flowchart TD
    A["User opens register.html"] --> B["User enters name, email, and password"]
    B --> C{"Frontend password policy valid?"}
    C -- "No" --> D["Show validation error"]
    C -- "Yes" --> E["POST /api/auth/register"]
    E --> F{"Backend fields and email valid?"}
    F -- "No" --> G["Return 400 Bad Request"]
    F -- "Yes" --> H{"Email exists in auth_user.json or SQLite?"}
    H -- "Yes" --> I["Return 409 Conflict"]
    H -- "No" --> J["Hash password with bcrypt"]
    J --> K["Append user to auth_user.json"]
    K --> L["Insert user into SQLite"]
    L --> M["Sign JWT"]
    M --> N["Return token and safe user profile"]
    N --> O["Frontend stores token and redirects to shop.html"]
```

## Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant Frontend as register.html/register.js
    participant API as Express /api/auth/register
    participant File as auth_user.json
    participant DB as SQLite users
    participant JWT as jsonwebtoken

    User->>Frontend: Enter name, email, password
    Frontend->>Frontend: Validate uppercase, special char, length
    Frontend->>API: POST credentials over HTTPS
    API->>File: Read auth_user.json
    API->>DB: SELECT user WHERE email = ?
    DB-->>API: Existing user or null
    alt Duplicate email
        API-->>Frontend: 409 Email already registered
    else New user
        API->>API: bcrypt.hash(password)
        API->>File: Append hashed user record
        API->>DB: INSERT hashed user record
        API->>JWT: jwt.sign({ sub, email }, secret)
        JWT-->>API: Signed token
        API-->>Frontend: 201 { token, user }
        Frontend->>Frontend: localStorage.setItem(auth_token)
        Frontend-->>User: Redirect to shop.html
    end
```

## GenAI Prompt

Act as a Security Engineer and full-stack Node.js developer. Build a user registration feature for an Express and SQLite ecommerce project. Use the following contract:

- Create `POST /api/auth/register`.
- Request body must include `firstName`, `email`, and `password`.
- Validate on the frontend and backend that password is at least 8 characters and includes one uppercase letter and one special character.
- Check duplicate username/email against both `auth_user.json` and the SQLite `users` table.
- Never store plaintext passwords. Use bcrypt to hash the password.
- Append the new registered user to `auth_user.json` with username, bcrypt password hash, firstName, and registrationDate.
- Insert the same user into the SQLite `users` table.
- Sign a JWT after successful registration and return `{ message, token, user }`.
- Create `register.html` and `js/register.js` so the user can register from the browser, store the JWT in `localStorage`, and redirect to `shop.html`.
- Add comments explaining the security logic where useful.
