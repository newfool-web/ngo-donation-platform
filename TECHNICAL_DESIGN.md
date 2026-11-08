# Technical Design Document
## Company A — Women's Welfare & Donation Platform

**GitHub:** https://github.com/newfool-web/ngo-donation-platform

**Live app:** https://company-a-client.vercel.app/

---

## 1. Architecture & Technology Decisions

### Architecture: Modular Monolith

The application follows a modular monolithic architecture with clear separation:

```
┌─────────────────────────┐     ┌─────────────────────────┐
│   React SPA (Client)    │────▶│   Express API (Server)  │
│   Vite + Tailwind CSS   │     │   TypeScript + Prisma   │
└─────────────────────────┘     └──────────┬──────────────┘
                                           │
                                ┌──────────▼──────────────┐
                                │      PostgreSQL DB       │
                                │   (Prisma ORM)           │
                                └──────────────────────────┘
```

**Why this stack:**
- **React + Vite**: Fast HMR, excellent TypeScript support, tree-shaking for small bundles (103KB gzipped)
- **Express**: Mature, well-documented, low overhead for API routes
- **PostgreSQL + Prisma**: Atomic sequences for receipt numbering, strong schema enforcement, type-safe queries
- **Tailwind CSS**: Utility-first for rapid UI iteration, small CSS bundle (4.5KB gzipped)

### Deployment topology

The application can run as a traditional Node process or as two separate Vercel
projects:

- The `client` project builds the Vite SPA.
- The `server` project exposes the Express app through `server/api/index.ts`
  and routes requests with `server/vercel.json`.
- Both deployments use the same hosted PostgreSQL database through Prisma.
- The frontend uses the build-time `VITE_API_URL` value. The backend uses the
  comma-separated `CORS_ORIGIN` allowlist.
- Vercel runs request handlers on demand; it is not a persistent worker host.
  PDF files are therefore generated on demand in the request and are not
  persisted to disk.

### Key design principles
- Hindi-first UI with runtime language toggle
- Server-side validation for all inputs (Zod schemas)
- Role-based access enforced at middleware level
- Atomic receipt generation with idempotency protection
- All PDFs generated server-side from persisted records

---

## 2. Database Schema

### Entity-Relationship Diagram

```
User (1)──────(N) Donation (N)──────(1) Campaign
  │                    │
  │                    └── receiptNumber (UNIQUE, from ReceiptSequence)
  │                    └── idempotencyKey (UNIQUE)
  │                    └── certificateNumber (UNIQUE)
  │
Scheme (N)──────(1) HelpCentre
  │
  └── eligibility (JSON)
  └── district (String[])
```

### Models

| Model           | Purpose                                     |
|-----------------|---------------------------------------------|
| User            | Donors and admins with bcrypt passwords     |
| Scheme          | Bilingual welfare scheme data               |
| HelpCentre      | Physical help centre locations              |
| Campaign        | Donation campaigns with targets             |
| Donation        | Donation records with receipt/certificate   |
| ReceiptSequence | Atomic fiscal-year receipt counter          |

### Key constraints
- `receiptNumber`: globally unique, generated atomically via PostgreSQL UPSERT
- `idempotencyKey`: unique per donation, prevents duplicate processing
- `certificateNumber`: derived from receipt number, also unique
- `paymentId`: unique if present (mock payment reference)

---

## 3. Application Flows

### Donation Flow

```
1. Donor selects campaign + amount + type
2. Donor fills name/email/PAN
3. Donor reviews summary
4. Frontend generates UUID idempotencyKey
5. POST /api/donations with idempotencyKey
   ├── Check existing donation with same idempotencyKey → return if exists
   ├── Validate amount (₹100 – ₹10,00,000)
   ├── Generate receipt number atomically (PostgreSQL UPSERT)
   ├── Simulate payment (90% success rate)
   └── Create donation + update campaign in transaction
6. Frontend shows success/failure + PDF download buttons
```

### Eligibility Check Flow

```
1. Woman answers 6 questions (district, age, marital status, pregnancy, SHG, BPL)
2. POST /api/eligibility/check
3. Server loads all published schemes
4. Rule engine matches each scheme's eligibility JSON against answers
5. Returns matching schemes with explanation of which rules were satisfied
6. Disclaimer that results are indicative only
```

### Admin Scheme + AI Flow

```
1. Admin creates/edits scheme with bilingual content
2. Admin clicks "Generate AI Summary"
3. Server calls Gemini API with scheme info + prompt for simple Hindi
4. AI draft stored as summaryAiDraft (NOT published)
5. Admin reviews and clicks "Approve"
6. Approved summary moved to summaryHi and marked summaryApproved=true
7. Summary now visible to end users
```

If Gemini API key is missing or API fails → fallback summary generated locally.

---

## 4. AI Workflow & Limitations

- **Model**: Gemini 3.5 Flash Lite via the Google Generative Language REST API
- **Purpose**: Generate simple Hindi summaries of scheme information
- **Temperature**: 0.3 (low for factual content)
- **Safeguard**: AI output is ALWAYS a draft; requires admin approval before display
- **Fallback**: Template-based Hindi summary if the API key is missing, the API
  request fails, or the response does not contain usable text
- **Limitations**:
  - Cannot verify eligibility rules
  - May produce inaccurate translations
  - Requires human review for quality

---

## 5. Key UI/UX Decisions

- **Hindi-first**: Default language is Hindi; toggle to English available
- **Font**: Noto Sans Devanagari (Google Fonts) for excellent Hindi readability
- **Colors**: Restrained palette — primary green (#2d8a4e) for trust, terracotta (#c4622e) for warmth
- **Mobile-first**: All layouts responsive from 360px; large touch targets
- **Accessibility**: WCAG 2.1 AA — visible focus rings, semantic HTML, form labels, ARIA roles
- **Loading states**: Spinner on every async operation
- **Error states**: User-friendly messages with retry buttons
- **Disclaimers**: Prominent on every scheme page and eligibility result
- **FCRA notice**: Visible in donation flow blocking foreign cards

### Key screens

- **Home page**: Introduces the trust and provides direct paths to scheme
  discovery, eligibility checking, and donation. The Hindi-first layout keeps
  the primary actions understandable for the target audience.
- **Schemes page**: Lists published welfare schemes with category and district
  filters. Filtering is placed above the results so users can narrow a large
  scheme catalogue without navigating away.
- **Scheme detail page**: Presents the approved Hindi summary, full bilingual
  description, eligibility, benefits, documents, application process, source,
  and help-centre information in one place.
- **Eligibility finder**: Uses a short guided questionnaire and returns
  indicative matches with an explanation and disclaimer instead of presenting
  the result as an official decision.
- **Donation page**: Collects donor and PAN information, supports one-time or
  monthly test donations, and exposes receipt and 80G certificate downloads
  after a successful transaction.
- **Donor dashboard**: Shows the authenticated donor's donation history and
  provides access to generated documents.
- **Admin dashboard**: Gives administrators operational statistics, recent
  donations, scheme and campaign management, and the AI summary review flow.

---

## 6. Receipt Numbering & PDF Strategy

### Receipt Number Generation (Critical Requirement)

```sql
INSERT INTO receipt_sequences ("fiscalYear", "lastNumber")
VALUES ($1, 1)
ON CONFLICT ("fiscalYear")
DO UPDATE SET "lastNumber" = receipt_sequences."lastNumber" + 1
RETURNING "lastNumber" as next_number
```

- **Format**: `REC-YYYYZZZZ-000001` (fiscal year + padded sequence)
- **Atomicity**: PostgreSQL UPSERT guarantees unique numbers for committed
  transactions even under concurrent requests
- **Idempotency**: Each donation has a unique `idempotencyKey`; duplicate requests return existing record
- **Transaction**: Donation creation + campaign update wrapped in Prisma `$transaction`

### PDF Generation

- **Library**: PDFKit (pure JavaScript, no external dependencies)
- **Generated from**: Persisted donation records (never from request data)
- **PAN masking**: Only first 3 and last 2 characters shown
- **Disclaimers**: Every PDF marked "ILLUSTRATIVE — NOT LEGALLY VALID"
- **On-demand**: PDFs generated when downloaded, not stored on disk

---

## 7. Security Measures

| Measure                 | Implementation                              |
|-------------------------|---------------------------------------------|
| Password hashing        | bcrypt with 12 salt rounds                  |
| JWT authentication      | Bearer token in Authorization header        |
| Role-based access       | Middleware checks (requireAdmin, requireDonor) |
| Donor data isolation    | Ownership check on all donation queries     |
| Input validation        | Zod schemas on all POST/PUT endpoints       |
| Rate limiting           | 100 req/15min general, 20 req/15min auth    |
| Security headers        | Helmet middleware                            |
| CORS                    | Restricted to configured origin allowlist   |
| PAN protection          | Masked in PDFs, never exposed in list APIs  |
| No secrets in repo      | .env excluded via .gitignore                |

---

## 8. Assumptions

- Scheme eligibility rules are simplified for demo purposes
- Payment is simulated (mock 90% success rate)
- PAN format validation only (no actual verification)
- Single fiscal year sequence assumed
- Help centres are manually assigned to schemes
- AI summaries are basic and require human review
- All scheme data is illustrative and not verified government policy

---

## 9. Configuration and operational boundaries

- `DATABASE_URL` is the Prisma PostgreSQL connection string. Reserved
  characters in credentials must be percent-encoded in the URI; for example,
  `@` in a password becomes `%40`.
- `JWT_SECRET` and database credentials are deployment secrets and must not be
  committed or placed in frontend variables.
- `VITE_API_URL` is exposed in the browser bundle and must contain only the
  public backend `/api` URL, never a secret.
- The `/api/health` endpoint confirms that the serverless handler is reachable;
  it does not perform a database readiness check.
- Donation payment is simulated, and PDF output is illustrative rather than a
  legally valid receipt or certificate.

---

## 10. Features Excluded (Future Improvements)

- Real payment gateway integration (Razorpay/PayU)
- Form 10BD automated generation
- SMS/WhatsApp notifications
- Donor re-engagement campaigns
- Recurring monthly payment automation
- Multi-language support beyond Hindi/English
- Offline scheme browsing (PWA)
- Scheme application tracking
- Volunteer management module
- Analytics dashboard with charts
- Bulk receipt generation
- Export to Excel/CSV
