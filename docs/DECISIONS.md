# Architecture Decision Records (ADRs): Payflow AI

## ADR-001: No Landing Page, No Authentication (Direct Dashboard Start)
- **Status**: Accepted
- **Context**: For the hackathon scope, building landing pages, marketing funnels, and complex auth (JWT, sessions, OAuth, password reset, user tables) drains time away from core payment recovery innovation. Teammates building backend features want simplicity and zero friction with token headers.
- **Decision**: 
  - Exclude all authentication and authorization infrastructure.
  - Exclude landing pages, pricing pages, and marketing routes.
  - Route `/` immediately redirects to `/dashboard`.
  - The app operates on a single seeded demo business entity (`Kaveri Industrial Supplies`).
  - Backend router dependencies use `app/core/deps.py:get_current_business()`.

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
  - An overdue ₹10,000 invoice carries the exact same behavioral penalty as an overdue ₹10,00,000 invoice.
  - Outstanding exposure is tracked and surfaced as a separate metric.

---

## ADR-004: Pure Function Baseline for Reliability Scoring
- **Status**: Accepted
- **Context**: The scoring engine is the core intellectual property of the platform and needs to be easily testable, tunable, and verifiable without database connection overhead.
- **Decision**: 
  - Implement `app/services/scoring.py` as a pure Python function receiving simple data structures or schemas.
  - Provide comprehensive unit tests in `tests/test_scoring.py` validating 100% of mathematical edge cases.

---

## ADR-005: Single Typed API Client in Frontend
- **Status**: Accepted
- **Context**: Frontend pages shouldn't make haphazard `fetch` calls with hardcoded URLs.
- **Decision**: 
  - All network communication with the backend is routed through `frontend/src/lib/api.ts`.
  - Endpoints and return types are strictly typed against TypeScript interfaces mirroring backend Pydantic schemas.
