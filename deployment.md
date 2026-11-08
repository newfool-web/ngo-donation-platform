# Deployment Guide

## Prerequisites

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm >= 9.x

## Local Development Setup

### 1. Install dependencies

```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 2. Database setup

Create a PostgreSQL database:

```sql
CREATE DATABASE ngo_donation_db;
```

For Supabase or another hosted PostgreSQL provider, use the provider's connection
string instead of creating a local database.

If the database password contains reserved URI characters such as `@`, encode
them in `DATABASE_URL` (`@` becomes `%40`). Encode only the username/password
portion of the URI. Do not commit the resulting connection string.

### 3. Environment configuration

Create `server/.env` locally and fill in the variables below. Keep this file
untracked; it contains credentials.

**Required variables:**
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — A strong random string for JWT signing
- `GEMINI_API_KEY` — For AI-generated Hindi summaries

**Optional variables:**
 (works without it)
- `PORT` — Server port (default 3000)
- `CORS_ORIGIN` — Comma-separated frontend origin allowlist (default http://localhost:5173)

### 4. Database migration and seeding

```bash
cd server
npx prisma db push       # Create tables
npx prisma generate      # Generate client
npx tsx prisma/seed.ts   # Seed demo data
```

### 5. Start development servers

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

- Backend: http://localhost:3000
- Frontend: http://localhost:5173

### 6. Run tests

```bash
cd server && npm test
```

## Demo Credentials

| Role  | Email                | Password      |
|-------|---------------------|---------------|
| Admin | admin@companya.org  | admin123456   |
| Donor | rajesh@example.com  | donor123456   |
| Donor | priya@example.com   | donor123456   |
| Donor | amit@example.com    | donor123456   |

## Production Deployment

### Build

```bash
# Frontend — produces static files in client/dist/
cd client && npm run build

# Backend — compiles TypeScript to server/dist/
cd server && npm run build
```

The application is deployed on Vercel as two separate projects: one for the
backend API and one for the frontend.

#### 1. Prepare the production database

Use the existing production database if it has already been created and seeded.
You do not need to run `db:push` or seed again when the Vercel backend uses that
same database. For a new database, run these commands from a trusted local
terminal before deploying:

```bash
cd server
npx prisma db push
npx prisma generate
npx tsx prisma/seed.ts
npx tsx prisma/sample-schemes.ts
```

The main seed is intended for initial setup. The district-specific supplemental
seed is repeatable.

#### 2. Deploy the backend

Create a Vercel project with the repository root set to `server`. The project
uses [server/api/index.ts](server/api/index.ts) as its serverless entry point
and [server/vercel.json](server/vercel.json) for routing. The backend package's
`postinstall` script generates the Prisma client during the Vercel build.

Set these variables for the Vercel **Production** environment:

```text
DATABASE_URL=<production PostgreSQL connection string>
JWT_SECRET=<strong random secret>
JWT_EXPIRES_IN=7d
NODE_ENV=production
CORS_ORIGIN=https://<frontend-project>.vercel.app
GEMINI_API_KEY=<optional Gemini API key>
```

Use the exact frontend origin in `CORS_ORIGIN` without a trailing slash. Multiple
origins may be separated by commas. `PORT` is not required for the Vercel
serverless runtime.

After deployment, verify:

```text
https://<backend-project>.vercel.app/api/health
```

#### 3. Deploy the frontend

Create a second Vercel project with the repository root set to `client`. The
client project uses `client/vercel.json` so direct navigation to routes such as
`/login` is handled by the React SPA instead of returning a Vercel `404`. Set
this build-time variable for the target environment:

```text
VITE_API_URL=https://<backend-project>.vercel.app/api
```

Redeploy after changing this variable. The frontend defaults to `/api` when
`VITE_API_URL` is not set, which is useful only when the API is served from the
same origin.

#### 4. Complete CORS configuration

After the frontend URL is known, update the backend `CORS_ORIGIN` value to that
exact URL and redeploy the backend. Preview deployments require their preview
origin to be added to the comma-separated allowlist if they must call the API.

### Environment variables (production)

| Variable         | Description                                         |
|------------------|-----------------------------------------------------|
| `DATABASE_URL`   | PostgreSQL connection string                        |
| `JWT_SECRET`     | Secret used to sign JWTs                            |
| `JWT_EXPIRES_IN` | JWT lifetime; defaults to `7d`                      |
| `PORT`           | Not required for the Vercel serverless runtime    |
| `NODE_ENV`       | Runtime environment, normally `production`         |
| `CORS_ORIGIN`    | Comma-separated frontend origin allowlist          |
| `GEMINI_API_KEY` | Optional key for Gemini-generated summaries        |
| `VITE_API_URL`   | Frontend build-time backend `/api` base URL        |

> **Important:** Never commit `.env` files or secrets to the repository.
