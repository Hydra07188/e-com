# Furni E-Commerce Project

Full-stack ecommerce demo built with Node.js, Express, SQLite, JWT authentication, bcrypt password hashing, and a Controller-Route-Service-Repository architecture.

## Project Overview

The app serves static storefront pages and exposes APIs for:

- Product catalog browsing
- User registration and login
- JWT-based profile lookup
- Cart-driven checkout
- SQLite order persistence

## Architecture

The backend is organized as a modular monolith that can be split into microservices later.

```text
routes/          HTTP endpoint mapping only
controllers/     Express request/response adapters
services/        Business rules and orchestration
repositories/    SQLite and file persistence access
models/          Safe response shapes and data helpers
middlewares/     Auth and central error handling
config/          Environment and auth configuration
```

Future microservice boundaries:

- Identity / Auth Service: user registration, login, JWT verification
- Product Catalog Service: product listing and price snapshots
- Order Service: checkout validation, server-side totals, order persistence

## Folder Structure

```text
config/
controllers/
css/
Documentation/
images/
js/
middlewares/
models/
repositories/
routes/
services/
server.js
database.js
```

## Environment Setup

Create a local `.env` file from `.env.example`:

```powershell
Copy-Item .env.example .env
```

Required environment variables:

```text
NODE_ENV=development
PORT=5500
JWT_SECRET=replace-this-with-a-long-random-secret
JWT_EXPIRES_IN=24h
DB_FILE=store.db
AUTH_USER_FILE=auth_user.json
JSON_BODY_LIMIT=10kb
```

Important:

- Never commit `.env`.
- Use a long, random `JWT_SECRET` before production.
- SQLite database files are ignored by Git and should not be pushed.

## Install Dependencies

```powershell
npm install
```

## Run The Project

```powershell
npm start
```

Open:

```text
http://localhost:5500
```

## Test The Project

```powershell
npm test
node --check server.js
```

Useful API smoke checks:

- `GET /api/products`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/checkout`

## Security Notes

- Secrets are loaded from `.env` using `dotenv`.
- Startup validation stops the server if required variables are missing.
- JWT tokens expire based on `JWT_EXPIRES_IN`.
- Passwords are hashed with bcryptjs.
- Express JSON body size is limited by `JSON_BODY_LIMIT`.
- Checkout does not trust client-provided price or totals.
- Order totals are calculated on the server from SQLite product prices.
- SQL queries use parameterized placeholders to reduce SQL injection risk.
- Production error responses hide stack traces and return a generic message.
- `.gitignore` excludes `.env`, `node_modules/`, database files, and logs.

## Go-Live Checklist

Before deployment:

- Set `NODE_ENV=production`.
- Replace the development `JWT_SECRET`.
- Confirm HTTPS/TLS is enabled in the hosting environment.
- Back up SQLite data or migrate to a managed database.
- Review any seeded demo users before going public.
