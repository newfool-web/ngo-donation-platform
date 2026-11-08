# Company A — Women's Welfare & Donation Platform

A Hindi-first platform connecting women with government welfare schemes across 9 districts of Madhya Pradesh, and enabling donors to contribute with instant receipts and 80G certificates.

> ⚠️ **Demo Platform** — Scheme information is illustrative. Donation flow is in test mode. No actual money is transferred. PDFs are not legally valid.

## Technology Stack

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Frontend   | React 19, TypeScript, Vite, Tailwind CSS      |
| Backend    | Node.js, Express, TypeScript                  |
| Database   | PostgreSQL with Prisma ORM                    |
| Auth       | JWT + bcrypt                                  |
| AI         | Gemini API (Hindi scheme summaries)           |
| PDF        | PDFKit (server-side generation)               |
| Testing    | Vitest, Supertest                             |

## Prerequisites

- **Node.js** ≥ 18.x
- **PostgreSQL** ≥ 14.x
- **npm** ≥ 9.x

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/newfool-web/ngo-donation-platform.git
cd ngo-donation-platform
```

### 2. Backend setup

```bash
cd server
npm install
```

Create a local `.env` file (do not commit it):

Create `server/.env` manually in your editor, then add the variables below.

Edit `.env` with your values:

```
DATABASE_URL=postgresql://user:password@localhost:5432/ngo_donation_db
JWT_SECRET=your-secure-random-string
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
GEMINI_API_KEY=           # Optional — leave blank for fallback summaries
```

### 3. Database migration and seeding

```bash
# Create the database first in PostgreSQL:
# CREATE DATABASE ngo_donation_db;

# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Seed with illustrative data
npx tsx prisma/seed.ts

# Add repeatable district-specific examples for filter testing
npx tsx prisma/sample-schemes.ts
```

### 4. Frontend setup

```bash
cd ../client
npm install
```

### 5. Run the application

**Backend** (from `server/` directory):
```bash
npm run dev
```
Server starts at `http://localhost:3000`

**Frontend** (from `client/` directory):
```bash
npm run dev
```
App available at `http://localhost:5173`

## Demo Credentials

| Role  | Email                | Password      |
|-------|---------------------|---------------|
| Admin | admin@companya.org  | admin123456   |
| Donor | rajesh@example.com  | donor123456   |
| Donor | priya@example.com   | donor123456   |
| Donor | amit@example.com    | donor123456   |

## Running Tests

```bash
cd server
npm test
```

All 29 tests cover:
- Authentication & role permissions
- Scheme CRUD operations
- Eligibility matching (5 scenarios)
- Donation processing & validation
- Duplicate payment prevention (idempotency)
- PDF generation (receipt & 80G certificate)
- Auth middleware role checks

## Environment Variables

| Variable        | Required | Description                           |
|-----------------|----------|---------------------------------------|
| DATABASE_URL    | Yes      | PostgreSQL connection string          |
| JWT_SECRET      | Yes      | Secret for JWT token signing          |
| JWT_EXPIRES_IN  | No       | Token expiry (default: 7d)            |
| PORT            | No       | Server port (default: 3000)           |
| NODE_ENV        | No       | Environment (default: development)    |
| CORS_ORIGIN     | No       | Comma-separated allowed frontend origins (default: localhost:5173) |
| GEMINI_API_KEY  | No       | Gemini API key for AI summaries       |
| VITE_API_URL    | No       | Frontend build-time API base URL (default: /api) |

## Production Deployment

### Build

```bash
# Frontend
cd client
npm run build    # Output in client/dist/

# Backend
cd server
npm run build    # Output in server/dist/
```

### Deploy

1. Deploy `server/` as a Vercel project. The serverless entry point is `server/api/index.ts`.
2. Set `CORS_ORIGIN` to the deployed frontend URL (comma-separate local and preview origins if needed).
3. Set the backend environment variables in the Vercel project.
4. If the production database is new, run `npx prisma db push` and the seed scripts against it from a trusted local terminal. Do not repeat this step for an already-prepared database.
5. Deploy `client/` as a separate Vercel project.
6. Set `VITE_API_URL` to the deployed backend URL followed by `/api`, then redeploy the frontend.

## Project Structure

```
ngo-donation-platform/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── context/            # Auth and Language contexts
│   │   ├── lib/                # API client
│   │   └── pages/              # Page components
│   └── ...
├── server/                     # Express backend
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── seed.ts             # Seed data
│   ├── src/
│   │   ├── middleware/         # Auth, validation, error handling
│   │   ├── routes/             # API route handlers
│   │   ├── services/           # Business logic
│   │   └── validators/         # Zod schemas
│   └── tests/                  # Test suite
└── README.md
```
