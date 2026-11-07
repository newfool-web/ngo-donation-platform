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

### 3. Environment configuration

Copy `server/.env.example` to `server/.env` and fill in values.

**Required variables:**
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — A strong random string for JWT signing

**Optional variables:**
- `GEMINI_API_KEY` — For AI-generated Hindi summaries (works without it)
- `PORT` — Server port (default 3000)
- `CORS_ORIGIN` — Frontend URL (default http://localhost:5173)

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

### Deploy backend

```bash
cd server
NODE_ENV=production node dist/index.js
```

Ensure `DATABASE_URL` points to a production PostgreSQL instance.

### Deploy frontend

Serve `client/dist/` with any static file server or CDN (Nginx, Vercel, Netlify).

Set the API base URL via the Vite proxy or configure `CORS_ORIGIN` on the backend to match the deployed frontend URL.

### Environment variables (production)

| Variable        | Example                                        |
|-----------------|------------------------------------------------|
| DATABASE_URL    | postgresql://user:pass@db-host:5432/ngo_prod   |
| JWT_SECRET      | a-very-long-random-secret-string               |
| PORT            | 3000                                           |
| NODE_ENV        | production                                     |
| CORS_ORIGIN     | https://companya.org                           |
| GEMINI_API_KEY  | AIza...                                        |

> **Important:** Never commit `.env` files or secrets to the repository.
