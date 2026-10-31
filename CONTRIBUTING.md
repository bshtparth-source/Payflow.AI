# Contributing to Payflow AI

Welcome to the **Payflow AI** repository! We are building an intelligent payment-recovery and cash-flow platform for Indian MSMEs.

---

## 1. Development Workflow

1. **Standalone Next.js App**:
   - The entire application lives in `/frontend`.
   - Install dependencies: `npm install` inside `/frontend`.
   - Run dev server: `npm run dev` (opens on `http://localhost:3000`).
2. **Local Demo Data & Analytics**:
   - The single source of truth is `frontend/src/data/seed.json` and `frontend/src/data/index.ts`.
   - All computed metrics (overdue aging, priority rankings, cash-flow projections) live in `frontend/src/lib/analytics.ts`.
   - Do NOT alter counterparty names, invoice numbers, or historical records without updating corresponding tests.
3. **AI Chat Assistant (Gemini)**:
   - System prompt and grounding context live in `frontend/src/lib/assistant-prompt.ts`.
   - API route handler is at `frontend/src/app/api/chat/route.ts`.
   - See `docs/AI_ASSISTANT.md` for guidelines on prompt design and the priority scoring formula.

---

## 2. Invariant Rules (DO NOT BREAK)

- **Zero Auth**: Do not add login, sessions, JWT, tokens, or auth headers. Root `/` redirects to `/dashboard`.
- **No Landing Page**: Root `/` strictly redirects to `/dashboard`.
- **Paise for Currency**: Store all currency amounts as integers in paise (`₹1 = 100 paise`).
- **Score Integrity**: Respect the rules in `docs/SCORING_SPEC.md` (terms-relative only, <3 settled invoices = "Insufficient history", exclude disputed invoices).
- **Never Commit Secrets**: Keep `.env.local` git-ignored. Use `frontend/.env.example` as a template.

---

## 3. Git Rules & Branches

- Keep Git commits small, self-contained, and meaningful:
  - `feat(assistant): add Gemini AI chat with grounded ledger prompt`
  - `feat(frontend): add cash flow forecast chart view`
  - `fix(invoices): correct overdue days calculation`
- **Do NOT push directly to `master` without user confirmation.**
