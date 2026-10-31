# Architecture Decision Records (ADRs): Payflow AI

## ADR-001: No Landing Page, No Authentication (Direct Dashboard Start)
- **Status**: Accepted
- **Context**: For the hackathon scope, building landing pages, marketing funnels, and complex auth (JWT, sessions, OAuth, password reset, user tables) drains time away from core payment recovery innovation. Teammates building backend features want simplicity and zero friction with token headers.
- **Decision**: 
  - Exclude all authentication and authorization infrastructure.
  - Exclude landing pages, pricing pages, and marketing routes.
  - Route `/` immediately redirects to `/dashboard`.
  - The app operates on a single seeded demo business entity (`Kaveri Industrial Supplies`).

---

## ADR-002: Integer Storage in Paise for All Monetary Values
- **Status**: Accepted
- **Context**: Storing currency as floating-point numbers causes precision drift during financial aggregation and invoice reconciliation.
- **Decision**: 
  - All database columns and API fields representing money are strictly 64-bit integers in **paise** (`1 INR = 100 paise`).
  - The frontend formatters handle conversion to Rupee display with Indian numbering notation (Lakhs/Crores).

---

## ADR-003: Pure Terms-Relative Scoring Invariant
- **Status**: Accepted
- **Context**: Some credit models unfairly weight large invoices, skewing scores when a small supplier delivers a large capital order. An MSME's trust in a buyer is determined by whether the buyer respects the agreed payment terms.
- **Decision**: 
  - The Buyer Reliability Score measures payment delay days strictly relative to invoice `payment_terms_days`.
  - An overdue ₹10,000 invoice carries the exact same behavioral penalty as an overdue ₹10,00000 invoice.
  - Outstanding exposure is tracked and surfaced as a separate metric.

---

## ADR-004: Pure Function Baseline for Reliability Scoring
- **Status**: Accepted
- **Context**: The scoring engine is the core intellectual property of the platform and needs to be easily testable, tunable, and verifiable without database connection overhead.
- **Decision**: 
  - Implement scoring calculations as pure functions receiving simple data structures or schemas.
  - Maintain consistent mathematical rules across both Python prototypes and TypeScript local engines.

---

## ADR-005: Single Typed API Client in Frontend
- **Status**: Superseded by ADR-006
- **Context**: Frontend pages shouldn't make haphazard `fetch` calls with hardcoded URLs.
- **Decision**: 
  - All data retrieval is routed through `frontend/src/lib/api.ts`.
  - Endpoints and return types are strictly typed against TypeScript interfaces.

---

## ADR-006: Standalone Next.js Architecture with Local Demo Data & Gemini AI Assistant
- **Status**: Accepted
- **Context**: Maintaining a separate Python FastAPI backend, database migrations, and two independently deployed cloud services introduced unnecessary friction and latency for demo/recording reliability. The frontend UI was already complete, beautiful, and self-sufficient.
- **Decision**:
  - Completely remove the Python `backend/` directory, virtual environment, and SQLite dependencies.
  - Transition the entire repository into a standalone Next.js App Router application in `/frontend` (Vercel Root Directory = `frontend`).
  - Anchor the data layer to pre-loaded, high-fidelity demo records in `frontend/src/data/seed.json` with a fixed ledger date `AS_OF_DATE = "2026-10-31"`.
  - Re-implement `frontend/src/lib/api.ts` as an in-memory client reading from local data, preserving every method name and signature so existing pages require zero visual or structural changes.
  - Implement derived ledger statistics, aging, and multi-factor follow-up rankings as pure functions in `frontend/src/lib/analytics.ts`.
  - Embed a live AI Chat Assistant (`/assistant`) powered by the official `@google/genai` SDK via a streaming Next.js Route Handler (`/api/chat`).
  - Pre-inject computed facts into the system instruction (`frontend/src/lib/assistant-prompt.ts`) to enforce 100% factual accuracy with zero LLM math hallucination.
- **Consequences**:
  - The entire application builds and runs with a single command (`npm run dev`), eliminating all cross-service network flakiness.
  - Zero DB connection errors or cold start latencies during recordings.
  - The AI assistant delivers instant, verifiable answers grounded in the ledger data.
