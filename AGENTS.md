# Payflow AI: Master Instructions for AI Agents & Developers

## 1. Project Summary (10-Line Brief)
1. **Product Name**: Payflow AI (Buyer Reliability Platform for Indian MSMEs).
2. **Core Mission**: Accelerate recovery of delayed B2B payments and forecast cash-flow shortages for small Indian suppliers.
3. **Core Mechanism**: Invoices & POs are ingested, due dates tracked, and buyer payment behaviors objectively analyzed.
4. **Headline 1**: **Buyer Reliability Score** (0-100 score relative to agreed payment terms, never weighted by invoice amount).
5. **Headline 2**: **Payment Risk Radar** (Predictive exposure categorization and cash shortfall warnings, always labeled as estimates).
6. **Auxiliary Tools**: AI invoice extraction, automated tone-calibrated reminder drafting (WhatsApp/Email), and formal dispute dossier packaging.
7. **Strict Architecture**: Next.js (App Router, Tailwind CSS, Recharts) in `/frontend` + FastAPI (SQLModel, Pydantic v2) in `/backend`.
8. **Communication**: Frontend interacts with backend strictly via typed API client at `frontend/src/lib/api.ts` (`NEXT_PUBLIC_API_BASE_URL`).
9. **Zero Auth / No Landing Page**: The app is built for a single seeded demo business. Root `/` redirects immediately to `/dashboard`.
10. **Agent Independence**: Backend is a typed skeleton with full mock data and stubs so partners can build backend features in isolation.

---

## 2. Invariant Rules (DO NOT BREAK)

> [!CRITICAL]
> **Auth and Landing Page are STRICTLY OUT OF SCOPE**
> - **Do NOT** build a landing page, marketing page, pricing page, or any public website.
> - **Do NOT** build login, signup, logout, forgot-password, user profiles, or account settings.
> - **Do NOT** add authentication or authorization of any kind: no JWT, sessions, OAuth, NextAuth, Clerk, Auth0, Firebase Auth, password hashing, User table, auth middleware, or auth headers.
> - The application starts directly at `/dashboard`. Root `/` redirects to `/dashboard`.
> - The entire application operates on ONE seeded demo business (`Kaveri Industrial Supplies`). Endpoints do not accept `business_id` or tokens.
> - Backend router endpoints MUST use `get_current_business()` in `app/core/deps.py`.

> [!CRITICAL]
> **API Contract & Schema Stability**
> - **Read `docs/API_CONTRACT.md` before touching any endpoint or API call.**
> - Never alter existing schema field names or response shapes. Frontend and tests rely on the exact contract.

---

## 3. Buyer Reliability Score Invariant Rules
1. **Relative to Terms Only**: Score measures payment behavior strictly relative to agreed credit terms (`payment_terms_days`), **never** weighted by invoice amount. A ₹10,00,000 invoice paid 5 days late has the exact same delay penalty as a ₹10,000 invoice paid 5 days late. Outstanding monetary exposure is tracked separately.
2. **Insufficient History**: If a buyer has fewer than 3 settled invoices, the score MUST return label `"Insufficient history"` and `null` numeric score. It must **NEVER** be labeled as "risky" or given a low default score.
3. **Disputed Invoices Excluded**: Any invoice marked in `DISPUTED` status is strictly excluded from score calculations and displayed as "under review".
4. **Naming Convention**: The metric is ALWAYS titled `"Buyer Reliability Score"`. Never refer to it as a "credit score", "credit rating", or "CIBIL score". It is a private behavioral assessment derived exclusively from the supplier's own ledger history.
5. **Estimates Disclaimer**: Output from the Payment Risk Radar and Cash-Flow Forecast are always labeled as `"ESTIMATES"` or `"PROJECTIONS"`, never guarantees or absolute predictions.
6. **No Accusatory Language**: Never use words like "fraud", "defaulter", "cheat", or "scam". Delays must be described factually: "overdue", "delayed payment", "high payment risk", "unfulfilled commitment".
7. **Score Transparency**: Every score payload must return `transactions_count` and `calculated_at` timestamp.
8. **Right to Challenge**: Suppliers can flag inaccurate records via `POST /api/buyers/{id}/records/challenge`.

---

## 4. Repository Map

```
Payflow.AI/
├── AGENTS.md                                # This file: master guidance for agents
├── CLAUDE.md, GEMINI.md, .github/           # Agent short pointers
├── README.md, CONTRIBUTING.md               # Repo documentation & setup guides
├── docs/                                    # System specs & documentation
│   ├── PRODUCT.md                           # Problem space, personas, features, non-goals
│   ├── ARCHITECTURE.md                      # Architecture diagram, data flow, folder map
│   ├── DATA_MODEL.md                        # SQLModel schema & entity definitions
│   ├── API_CONTRACT.md                      # Full REST API endpoints, schemas, mock samples
│   ├── SCORING_SPEC.md                      # Mathematical scoring rules, sub-scores, weights
│   ├── UI_DESIGN_SYSTEM.md                  # Colors, typography, status badges, wording rules
│   ├── FEATURES.md                          # F1-F7 features board & assignees
│   └── DECISIONS.md                         # Architecture Decision Records (ADRs)
├── design/stitch-exports/                   # Design reference files
├── frontend/                                # Next.js 14/15 App Router app
│   ├── src/app/                             # App Router pages (redirects / to /dashboard)
│   ├── src/components/                      # UI components & layouts
│   ├── src/lib/api.ts                       # Typed API client connecting to backend
│   └── src/lib/types.ts                     # TypeScript types matching API_CONTRACT.md
└── backend/                                 # FastAPI application
    ├── app/main.py                          # FastAPI setup, CORS, route registration
    ├── app/core/config.py                   # Pydantic Settings
    ├── app/core/deps.py                     # get_current_business() stub
    ├── app/models/                          # SQLModel database tables (paise integer amounts)
    ├── app/schemas/                         # Pydantic v2 schemas
    ├── app/routers/                         # API routers for all resources
    ├── app/services/                        # Business logic & services
    │   └── scoring.py                       # Pure function baseline implementation (tested)
    ├── app/data/seed.json                   # 6 demo buyers & realistic Indian MSME records
    └── tests/                               # pytest test suite
```

---

## 5. How to Run Frontend and Backend

### Backend (Python 3.10+)
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate | Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- Interactive Swagger docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/health`

### Frontend (Node.js 18+)
```bash
cd frontend
npm install
npm run dev
```
- Application dashboard: `http://localhost:3000` (auto-redirects to `/dashboard`)

---

## 6. How to Implement a Feature (For Partner AI Agents)

1. **Locate your Task**: Open `docs/FEATURES.md` and find your assigned Feature ID (e.g., `F1`, `F3`, `F5`).
2. **Review the Contract**: Consult `docs/API_CONTRACT.md` for the corresponding endpoint specifications and payload structures.
3. **Touch Only Assigned Files**: Modify **only** the files specified in `docs/FEATURES.md` for your feature ID.
4. **Preserve Schemas**: Do **NOT** change schema field names or response types in `app/schemas/` or `frontend/src/lib/types.ts`.
5. **Update Service Header**: Every service file in `backend/app/services/` contains a required header:
   ```python
   # FEATURE: <ID and name, e.g. F3 Reminder drafting>
   # STATUS: IMPLEMENTED (was STUB)
   # OWNER: <Your name or agent ID>
   # CONTRACT: docs/API_CONTRACT.md#reminders
   # TODO: replace mock with real logic; DO NOT change the response schema
   ```
6. **Activate Tests**: In `backend/tests/test_services_stubs.py`, find your feature's test and remove `@pytest.mark.skip`. Ensure `pytest` passes.
7. **Update Board**: In `docs/FEATURES.md`, change the feature's status from `STUB` to `IN_PROGRESS` or `COMPLETED`.

---

## 7. Code Style & Engineering Standards
- **Currency**: All monetary amounts in the database and API payloads MUST be stored as integers in **paise** (`1 INR = 100 paise`). The frontend formats paise into Indian numbering notation (e.g. ₹1,20,000).
- **Date Format**: ISO 8601 strings (`YYYY-MM-DD` or `YYYY-MM-DDTHH:MM:SSZ`).
- **Python**: PEP 8 style, type annotations on all function parameters and return values.
- **TypeScript**: Strict mode enabled, no explicit `any`.
- **Never Commit Secrets**: All keys (LLM API keys, DB credentials) must be loaded through environment variables. Use `.env.example` as a template.
