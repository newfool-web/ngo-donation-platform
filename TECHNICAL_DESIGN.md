# Technical Design Document
## Company A — Women's Welfare & Donation Platform

**GitHub:** https://github.com/newfool-web/ngo-donation-platform

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

- **Model**: Gemini 2.0 Flash via REST API
- **Purpose**: Generate simple Hindi summaries of scheme information
- **Temperature**: 0.3 (low for factual content)
- **Safeguard**: AI output is ALWAYS a draft; requires admin approval before display
- **Fallback**: Template-based Hindi summary if API unavailable
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
- **Atomicity**: PostgreSQL UPSERT guarantees no gaps or duplicates even under concurrent requests
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
| CORS                    | Restricted to configured origin             |
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

## 9. Features Excluded (Future Improvements)

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
