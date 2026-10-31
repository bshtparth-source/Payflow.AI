# Payflow AI: Master Instructions for AI Agents & Developers

## 1. Project Summary (10-Line Brief)
1. **Product Name**: Payflow AI (Buyer Reliability Platform for Indian MSMEs).
2. **Core Mission**: Accelerate recovery of delayed B2B payments and forecast cash-flow shortages for small Indian suppliers.
3. **Core Mechanism**: Invoices & POs are ingested, due dates tracked, and buyer payment behaviors objectively analyzed.
4. **Headline 1**: **Buyer Reliability Score** (0-100 score relative to agreed payment terms, never weighted by invoice amount).
5. **Headline 2**: **Payment Risk Radar** (Predictive exposure categorization and cash shortfall warnings, always labeled as estimates).
6. **Headline 3**: **AI Assistant (Gemini)** (Context-grounded assistant answering questions on receivables, overdue rankings, and drafting reminders).
7. **Strict Architecture**: Pure Next.js (App Router, Tailwind CSS, Recharts) in `/frontend` (Vercel Root Directory = `frontend`). No Python backend or DB.
8. **Data Layer**: High-fidelity local demo data in `frontend/src/data/` with pure analytics in `frontend/src/lib/analytics.ts` (`AS_OF_DATE = "2026-10-31"`).
9. **Zero Auth / No Landing Page**: The app is built for a single seeded demo business (`Kaveri Industrial Supplies`). Root `/` redirects immediately to `/dashboard`.
10. **LLM Integration**: Streaming Next.js Route Handler at `/api/chat` using `@google/genai` with deterministic ledger prompt grounding.

---

## 2. Invariant Rules (DO NOT BREAK)

> [!CRITICAL]
> **Auth and Landing Page are STRICTLY OUT OF SCOPE**
> - **Do NOT** build a landing page, marketing page, pricing page, or any public website.
> - **Do NOT** build login, signup, logout, forgot-password, user profiles, or account settings.
> - **Do NOT** add authentication or authorization of any kind: no JWT, sessions, OAuth, NextAuth, Clerk, Auth0, Firebase Auth, password hashing, User table, auth middleware, or auth headers.
> - The application starts directly at `/dashboard`. Root `/` redirects to `/dashboard`.
> - The entire application operates on ONE seeded demo business (`Kaveri Industrial Supplies`).
> - The top bar shows a static business badge (no avatar dropdown, no logout).

> [!CRITICAL]
> **Local Demo Data & Visual Stability**
> - Single source of truth is `frontend/src/data/seed.json` and `frontend/src/data/index.ts`.
> - Derived metrics (totals, aging, priority rankings) are computed via pure functions in `frontend/src/lib/analytics.ts`.
> - The typed client in `frontend/src/lib/api.ts` returns local data immediately so all UI components, gauges, charts, and tables render identically without network failure.

---

## 3. Buyer Reliability Score Invariant Rules
1. **Relative to Terms Only**: Score measures payment behavior strictly relative to agreed credit terms (`payment_terms_days`), **never** weighted by invoice amount. A ₹10,00,000 invoice paid 5 days late has the exact same delay penalty as a ₹10,000 invoice paid 5 days late. Outstanding monetary exposure is tracked separately.
2. **Insufficient History**: If a buyer has fewer than 3 settled invoices, the score MUST return label `"Insufficient history"` and `null` numeric score. It must **NEVER** be labeled as "risky" or given a low default score.
3. **Disputed Invoices Excluded**: Any invoice marked in `DISPUTED` status is strictly excluded from score calculations and displayed as "under review".
4. **Naming Convention**: The metric is ALWAYS titled `"Buyer Reliability Score"`. Never refer to it as a "credit score", "credit rating", or "CIBIL score". It is a private behavioral assessment derived exclusively from the supplier's own ledger history.
5. **Estimates Disclaimer**: Output from the Payment Risk Radar and Cash-Flow Forecast are always labeled as `"ESTIMATES"` or `"PROJECTIONS"`, never guarantees or absolute predictions.
6. **No Accusatory Language**: Never use words like "fraud", "defaulter", "cheat", or "scam". Delays must be described factually: "overdue", "delayed payment", "high payment risk", "unfulfilled commitment".
7. **Score Transparency**: Every score payload must return `transactions_count` and `calculated_at` timestamp.
8. **Right to Challenge**: Suppliers can flag inaccurate records via the record challenge dialog.

---

## 4. Priority Ranking Formula (For Follow-Up & AI Assistant)

To determine which customer should be followed up with first:

$$\text{Priority Score} = 0.50 \times \left(\frac{\text{Buyer Overdue Amount}}{\text{Max Overdue Amount}}\right) + 0.30 \times \left(\frac{\text{Buyer Oldest Overdue Days}}{\text{Max Oldest Overdue Days}}\right) + 0.20 \times \left(\frac{100 - \text{Score}}{100}\right)$$

- For buyers with "Insufficient history", the score factor defaults to `0.50` and the buyer is never called risky.
- **Top Priority #1**: **Global Distributors** (₹3,50,000 overdue, 45 days late, Score: 31.0/100, Priority Score: 0.938).
- For complete details, see `docs/AI_ASSISTANT.md`.

---

## 5. Repository Map

```
Payflow.AI/
├── AGENTS.md                                # Master guidance for AI agents
├── CLAUDE.md, GEMINI.md, .github/           # Agent short pointers
├── README.md, CONTRIBUTING.md               # Repo documentation & setup guides
├── docs/                                    # Architecture & design documentation
│   ├── PRODUCT.md                           # Problem space, personas, features, non-goals
│   ├── ARCHITECTURE.md                      # Architecture diagram, data flow, folder map
│   ├── DATA_MODEL.md                        # TypeScript models & ledger schemas
│   ├── AI_ASSISTANT.md                      # Gemini AI prompt design, priority formula & demo QA
│   ├── SCORING_SPEC.md                      # Mathematical scoring rules, sub-scores, weights
│   ├── UI_DESIGN_SYSTEM.md                  # Colors, typography, status badges, wording rules
│   └── DECISIONS.md                         # Architecture Decision Records (ADRs)
├── design/stitch-exports/                   # Design reference files
└── frontend/                                # Next.js 14 App Router application
    ├── src/app/                             # App Router pages (/dashboard, /assistant, etc.)
    │   ├── api/chat/route.ts                # Streaming Gemini AI route handler
    │   ├── assistant/page.tsx               # Dedicated AI chat UI with suggested chips
    │   ├── buyers/                          # Buyers portfolio & buyer detail views
    │   ├── dashboard/                       # Overview dashboard
    │   ├── invoices/                        # Invoices list & upload flow
    │   ├── risk-radar/                      # Risk radar & exposure categorisation
    │   ├── cashflow/                        # Cashflow forecast projection view
    │   ├── reminders/                       # Tone-calibrated reminder drafting
    │   └── disputes/                        # Dispute dossiers & evidence packaging
    ├── src/components/                      # UI components (Sidebar, Header, ScoreGauge, etc.)
    ├── src/data/                            # Single source of truth demo data (seed.json, index.ts)
    ├── src/lib/analytics.ts                 # Derived ledger metrics & priority calculation
    ├── src/lib/assistant-prompt.ts          # Gemini system prompt builder with injected facts
    ├── src/lib/api.ts                       # Typed client reading from local data
    └── src/lib/types.ts                     # TypeScript interfaces matching ledger entities
```

---

## 6. How to Run Frontend

```bash
cd frontend
npm install
npm run dev
```

- Application dashboard: `http://localhost:3000` (auto-redirects `/` to `/dashboard`)
- AI Assistant: `http://localhost:3000/assistant`

### Environment Configuration:
Create `frontend/.env.local`:
```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-3.5-flash
```
*(If unset, the AI Assistant provides a clean fallback message without crashing).*

---

## 7. Code Style & Engineering Standards
- **Currency**: All monetary amounts are stored as integers in **paise** (`1 INR = 100 paise`). The frontend formats paise into Indian numbering notation (e.g. ₹1,20,000 or ₹8.5L).
- **Date Format**: ISO 8601 strings (`YYYY-MM-DD` or `YYYY-MM-DDTHH:MM:SSZ`), anchored to fixed `AS_OF_DATE = "2026-10-31"`.
- **TypeScript**: Strict mode enabled, no explicit `any`.
- **Never Commit Secrets**: `GEMINI_API_KEY` must never be logged, sent to the browser, or committed to git.
