# Feature Board: Payflow AI

This document tracks all core capabilities, code ownership, target files, and acceptance criteria.
Teammates and AI agents: when picking up a feature, edit **only** the listed files, keep the response schemas identical to `docs/API_CONTRACT.md`, and update the status here.

---

## Feature Board Summary

| ID | Feature Name | Owner | Status | Files to Edit |
| :--- | :--- | :--- | :--- | :--- |
| **F1** | Invoice Extraction (AI) | `<unassigned>` | `STUB` | `backend/app/services/extraction.py`, `backend/app/routers/invoices.py` |
| **F2** | Invoice & Overdue Tracking | `<unassigned>` | `STUB` | `backend/app/services/invoices.py`, `backend/app/routers/invoices.py` |
| **F3** | Reminder Drafting | `<unassigned>` | `STUB` | `backend/app/services/reminders.py`, `backend/app/routers/reminders.py` |
| **F4** | Dispute Document Organiser | `<unassigned>` | `STUB` | `backend/app/services/disputes.py`, `backend/app/routers/disputes.py` |
| **F5** | Cash-Flow Forecast | `<unassigned>` | `STUB` | `backend/app/services/cashflow.py`, `backend/app/routers/cashflow.py` |
| **F6** | Payment Risk Radar | `<unassigned>` | `STUB` | `backend/app/services/risk_radar.py`, `backend/app/routers/risk_radar.py` |
| **F7** | Buyer Reliability Score DB Integration | `<unassigned>` | `IMPLEMENTED (Baseline)` | `backend/app/services/scoring.py`, `backend/app/routers/buyers.py` |

---

## Detailed Feature Specifications

### F1: Invoice Extraction (AI OCR)
- **Objective**: Parse uploaded invoice/PO files (PDF, PNG, JPG) using an LLM or OCR service into structured invoice metadata.
- **Contract**: `POST /api/invoices/upload` (`docs/API_CONTRACT.md#4-invoices--upload-extraction`)
- **Files to Edit**:
  - `backend/app/services/extraction.py`
  - `backend/app/routers/invoices.py`
  - `backend/tests/test_services_stubs.py` (enable `test_f1_invoice_extraction`)
- **Acceptance Criteria**:
  - Accepts PDF or image upload.
  - Extracts invoice number, issue date, payment terms, total amount in paise, buyer GSTIN, and line items.
  - Returns schema-compliant `InvoiceExtractionResponse`.

---

### F2: Invoice and Overdue Tracking
- **Objective**: Maintain invoice ledger, calculate dynamic `overdue_days` against current date, and handle payment settlements.
- **Contract**: `GET /api/invoices`, `POST /api/invoices`, `PATCH /api/invoices/{id}`, `POST /api/invoices/{id}/payments`
- **Files to Edit**:
  - `backend/app/services/invoices.py`
  - `backend/app/routers/invoices.py`
  - `backend/tests/test_services_stubs.py` (enable `test_f2_invoice_tracking`)
- **Acceptance Criteria**:
  - Automatically updates invoice status to `OVERDUE` when `current_date > due_date`.
  - Recording a payment sets `paid_amount_paise`, calculates `delay_days`, and updates invoice status to `PAID` or `PARTIALLY_PAID`.

---

### F3: Reminder Drafting
- **Objective**: Draft tone-calibrated WhatsApp and Email payment follow-ups based on days overdue and relationship tier.
- **Contract**: `POST /api/reminders/draft`, `GET /api/reminders` (`docs/API_CONTRACT.md#7-reminder-drafting-engine`)
- **Files to Edit**:
  - `backend/app/services/reminders.py`
  - `backend/app/routers/reminders.py`
  - `backend/tests/test_services_stubs.py` (enable `test_f3_reminder_drafting`)
- **Acceptance Criteria**:
  - Generates appropriate tone: `GENTLE` (before due date), `FIRM` (1-15 days overdue), `FORMAL_DEMAND` (16-45 days), `LEGAL_NOTICE` (45+ days with MSMED Act reference).
  - Returns ready-to-dispatch formatted body with recipient contact info.

---

### F4: Dispute Document Organiser
- **Objective**: Organize contested invoices, attach evidence documents, and generate a downloadable dispute dossier pack.
- **Contract**: `GET/POST /api/disputes`, `PATCH /api/disputes/{id}`, `GET /api/disputes/{id}/pack`
- **Files to Edit**:
  - `backend/app/services/disputes.py`
  - `backend/app/routers/disputes.py`
  - `backend/tests/test_services_stubs.py` (enable `test_f4_dispute_organiser`)
- **Acceptance Criteria**:
  - Marking an invoice disputed immediately flags `is_disputed=True` and excludes it from scoring.
  - Generates a compiled dossier structure listing timeline of PO, challan, invoice, and contestation notes.

---

### F5: Cash-Flow Forecast
- **Objective**: Aggregate receivables over 30/60 days, predict realization dates adjusted for buyer average delay, and highlight working capital shortfalls.
- **Contract**: `GET /api/cashflow/forecast` (`docs/API_CONTRACT.md#6-cash-flow-forecasting`)
- **Files to Edit**:
  - `backend/app/services/cashflow.py`
  - `backend/app/routers/cashflow.py`
  - `backend/tests/test_services_stubs.py` (enable `test_f5_cashflow_forecast`)
- **Acceptance Criteria**:
  - Incorporates historical average buyer delay to forecast realistic collection dates.
  - Returns `projected_shortfall_paise` and series for charting.
  - Carries the mandatory estimates disclaimer.

---

### F6: Payment Risk Radar
- **Objective**: Segment buyers into risk categories (Low, Medium, High, Critical) and calculate capital at risk.
- **Contract**: `GET /api/risk-radar` (`docs/API_CONTRACT.md#5-payment-risk-radar`)
- **Files to Edit**:
  - `backend/app/services/risk_radar.py`
  - `backend/app/routers/risk_radar.py`
  - `backend/tests/test_services_stubs.py` (enable `test_f6_payment_risk_radar`)
- **Acceptance Criteria**:
  - Computes aging breakdown across the 5 buckets.
  - Computes recovery probabilities and recommended actions.
  - Carries the mandatory estimates disclaimer.

---

### F7: Buyer Reliability Score Integration
- **Objective**: Pure function baseline mathematical engine connecting to DB models for live recalculation.
- **Contract**: `GET /api/buyers/{id}/score`, `POST /api/buyers/{id}/records/challenge`
- **Files to Edit**:
  - `backend/app/services/scoring.py` (Baseline pure function already implemented and tested)
  - `backend/app/routers/buyers.py`
  - `backend/tests/test_scoring.py`
- **Acceptance Criteria**:
  - Strictly implements 5 sub-scores (`on_time`, `delay`, `consistency`, `commitments`, `overdue_history`).
  - Enforces invariant rules: terms-relative only, <3 invoices -> "Insufficient history", exclude disputed invoices.
  - All unit tests pass.
