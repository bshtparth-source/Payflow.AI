# Contributing to Payflow AI

Welcome to the **Payflow AI** repository! We are building an intelligent payment-recovery and cash-flow platform for Indian MSMEs.

---

## 1. Quick Handoff Workflow for Backend Contributors

1. **Pick a Feature**:
   - Open `docs/FEATURES.md` and claim an unassigned feature ID (`F1` through `F7`).
   - Read the corresponding contract section in `docs/API_CONTRACT.md`.
2. **Edit Only Assigned Files**:
   - Modify only the service file in `backend/app/services/<feature>.py` and corresponding router if needed.
   - **Do NOT** change Pydantic request/response schemas in `backend/app/schemas/`. The frontend depends on these schemas.
3. **Update Service Header**:
   - Update the metadata header at the top of the service file:
     ```python
     # FEATURE: F3 Reminder drafting
     # STATUS: IN_PROGRESS (was STUB)
     # OWNER: <Your Name / Handle>
     # CONTRACT: docs/API_CONTRACT.md#7-reminder-drafting-engine
     # TODO: replace mock with real logic; DO NOT change the response schema
     ```
4. **Enable Pytest**:
   - Open `backend/tests/test_services_stubs.py`, find your test, and remove the `@pytest.mark.skip` decorator.
   - Run tests: `pytest` inside `backend/`.
5. **Mark Done**:
   - Update `docs/FEATURES.md` status to `COMPLETED`.

---

## 2. Invariant Rules

- **Zero Auth**: Do not add login, sessions, JWT, tokens, or auth headers. Routers must use `get_current_business()` from `app/core/deps.py`.
- **No Landing Page**: Root `/` strictly redirects to `/dashboard`.
- **Paise for Currency**: Store all currency amounts as integers in paise (`₹1 = 100 paise`).
- **Score Integrity**: Respect the rules in `docs/SCORING_SPEC.md` (terms-relative only, <3 settled invoices = "Insufficient history", exclude disputed invoices).
- **Never Commit Secrets**: Keep `.env` files git-ignored. Use `.env.example` as a template.

---

## 3. Git Rules & Branches

- Keep Git commits small, self-contained, and meaningful:
  - `feat(scoring): add pure function baseline with unit tests`
  - `feat(frontend): add cash flow forecast chart view`
  - `fix(invoices): correct overdue days calculation`
- **Do NOT push directly to `main` without confirmation.**
