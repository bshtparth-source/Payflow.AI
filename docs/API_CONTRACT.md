# API Contract Specification: Payflow AI

Base URL: `http://localhost:8000` (Local) / Configurable via `NEXT_PUBLIC_API_BASE_URL` in Frontend.
All monetary amounts are integers in **paise** (`1 INR = 100 paise`).
All endpoints operate on the single seeded demo business. **No authentication headers or tokens are required.**

---

## 1. Health Check

### `GET /api/health`
Checks server operational readiness.
- **Request**: None
- **Response (200 OK)**:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "mode": "mock",
  "business": "Kaveri Industrial Supplies"
}
```

---

## 2. Dashboard

### `GET /api/dashboard/summary`
Retrieves aggregated MSME cash flow, portfolio health, and urgent collection actions.
- **Request**: None
- **Response (200 OK)**:
```json
{
  "business_name": "Kaveri Industrial Supplies",
  "total_receivables_paise": 87500000,
  "overdue_receivables_paise": 38000000,
  "overdue_percentage": 43.4,
  "average_collection_days": 37.5,
  "at_risk_capital_paise": 35000000,
  "buyer_count": 6,
  "portfolio_breakdown": {
    "highly_reliable": 1,
    "reliable": 1,
    "moderate_reliability": 1,
    "needs_attention": 1,
    "high_risk": 1,
    "insufficient_history": 1
  },
  "urgent_actions": [
    {
      "id": "act_01",
      "type": "PAYMENT_OVERDUE",
      "buyer_id": "buyer_05",
      "buyer_name": "Global Distributors",
      "invoice_id": "inv_005",
      "amount_paise": 35000000,
      "days_overdue": 45,
      "recommended_action": "Send Formal Demand Notice (MSMED reference)"
    },
    {
      "id": "act_02",
      "type": "COMMITMENT_BROKEN",
      "buyer_id": "buyer_04",
      "buyer_name": "Metro Suppliers",
      "invoice_id": "inv_004",
      "amount_paise": 23000000,
      "days_overdue": 18,
      "recommended_action": "Follow up on broken payment commitment from Oct 25"
    }
  ]
}
```

---

## 3. Buyers & Reliability Scoring

### `GET /api/buyers`
Returns a list of all buyers with their current reliability tier, score, and outstanding balance.
- **Query Params**: `search` (string, optional), `tier` (string, optional)
- **Response (200 OK)**:
```json
[
  {
    "id": "buyer_01",
    "name": "ABC Industries",
    "gstin": "27AAACA1234A1Z5",
    "contact_person": "Ramesh Gupta",
    "email": "finance@abcindustries.in",
    "phone": "+91 98200 12345",
    "agreed_terms_days": 30,
    "reliability_score": 94.0,
    "reliability_tier": "Highly reliable",
    "outstanding_exposure_paise": 5000000,
    "average_delay_days": 1.0,
    "transactions_count": 18,
    "active_disputes_count": 0
  },
  {
    "id": "buyer_02",
    "name": "Sharma Traders",
    "gstin": "27AABCS5678B1Z2",
    "contact_person": "Vikas Sharma",
    "email": "accounts@sharmatraders.co.in",
    "phone": "+91 98210 54321",
    "agreed_terms_days": 30,
    "reliability_score": 78.0,
    "reliability_tier": "Reliable",
    "outstanding_exposure_paise": 12000000,
    "average_delay_days": 5.0,
    "transactions_count": 12,
    "active_disputes_count": 0
  },
  {
    "id": "buyer_03",
    "name": "RK Enterprises",
    "gstin": "27AACCR9012C1Z8",
    "contact_person": "Rajesh Kulkarni",
    "email": "rk@rkenterprises.com",
    "phone": "+91 98190 99887",
    "agreed_terms_days": 45,
    "reliability_score": 68.0,
    "reliability_tier": "Moderate reliability",
    "outstanding_exposure_paise": 10000000,
    "average_delay_days": 12.0,
    "transactions_count": 8,
    "active_disputes_count": 0
  },
  {
    "id": "buyer_04",
    "name": "Metro Suppliers",
    "gstin": "27AABCM3456D1Z1",
    "contact_person": "Anand Mehra",
    "email": "billing@metrosuppliers.org",
    "phone": "+91 98330 11223",
    "agreed_terms_days": 30,
    "reliability_score": 54.0,
    "reliability_tier": "Needs attention",
    "outstanding_exposure_paise": 23000000,
    "average_delay_days": 18.0,
    "transactions_count": 15,
    "active_disputes_count": 1
  },
  {
    "id": "buyer_05",
    "name": "Global Distributors",
    "gstin": "27AACCG7890E1Z4",
    "contact_person": "Sunil Nair",
    "email": "payments@globaldistributors.com",
    "phone": "+91 98440 66778",
    "agreed_terms_days": 45,
    "reliability_score": 31.0,
    "reliability_tier": "High payment risk",
    "outstanding_exposure_paise": 35000000,
    "average_delay_days": 45.0,
    "transactions_count": 9,
    "active_disputes_count": 0
  },
  {
    "id": "buyer_06",
    "name": "Nova Packaging",
    "gstin": "27AABCN4567F1Z9",
    "contact_person": "Pooja Hegde",
    "email": "pooja@novapackaging.in",
    "phone": "+91 98770 33445",
    "agreed_terms_days": 30,
    "reliability_score": null,
    "reliability_tier": "Insufficient history",
    "outstanding_exposure_paise": 7500000,
    "average_delay_days": 0.0,
    "transactions_count": 2,
    "active_disputes_count": 0
  }
]
```

### `GET /api/buyers/{id}`
Returns details of a specific buyer, their payment history summary, and invoices.
- **Response (200 OK)**:
```json
{
  "id": "buyer_01",
  "name": "ABC Industries",
  "gstin": "27AAACA1234A1Z5",
  "contact_person": "Ramesh Gupta",
  "email": "finance@abcindustries.in",
  "phone": "+91 98200 12345",
  "agreed_terms_days": 30,
  "reliability_score": 94.0,
  "reliability_tier": "Highly reliable",
  "outstanding_exposure_paise": 5000000,
  "average_delay_days": 1.0,
  "transactions_count": 18,
  "on_time_percentage": 94.4,
  "broken_commitments_count": 0,
  "total_billed_paise": 95000000,
  "total_collected_paise": 90000000,
  "created_at": "2025-11-01T10:00:00Z"
}
```

### `GET /api/buyers/{id}/score`
Returns the granular sub-scores, calculation timestamp, and terms-relative breakdown.
- **Response (200 OK)**:
```json
{
  "buyer_id": "buyer_01",
  "buyer_name": "ABC Industries",
  "score": 94.0,
  "tier": "Highly reliable",
  "calculated_at": "2026-10-31T11:00:00Z",
  "transactions_count": 18,
  "sub_scores": {
    "on_time": 94.4,
    "delay": 98.3,
    "consistency": 95.0,
    "commitments": 100.0,
    "overdue_history": 85.0
  },
  "weights": {
    "on_time": 0.30,
    "delay": 0.25,
    "consistency": 0.15,
    "commitments": 0.15,
    "overdue_history": 0.15
  },
  "disclaimer": "Scores are private estimates from your own invoice history, not a credit rating."
}
```

### `POST /api/buyers/{id}/records/challenge`
Supplier flags an incorrect payment or delay record for audit/correction.
- **Request Body**:
```json
{
  "invoice_id": "inv_004",
  "payment_id": "pay_012",
  "reason": "Payment was received via RTGS on due date but bank clearance reflection delayed by 2 days due to holiday",
  "proposed_correction": "Mark settled date as 2026-10-20 instead of 2026-10-22"
}
```
- **Response (201 Created)**:
```json
{
  "challenge_id": "chal_901",
  "buyer_id": "buyer_04",
  "status": "PENDING",
  "message": "Challenge registered for audit. Score will adjust upon verification."
}
```

---

## 4. Invoices & Upload Extraction

### `GET /api/invoices`
Returns invoices with optional status/buyer filters.
- **Query Params**: `buyer_id` (optional), `status` (optional: `PAID`, `UNPAID`, `OVERDUE`, `DISPUTED`)
- **Response (200 OK)**:
```json
[
  {
    "id": "inv_001",
    "invoice_number": "INV-2026-001",
    "buyer_id": "buyer_01",
    "buyer_name": "ABC Industries",
    "amount_paise": 5000000,
    "paid_amount_paise": 0,
    "issue_date": "2026-10-15",
    "payment_terms_days": 30,
    "due_date": "2026-11-14",
    "status": "UNPAID",
    "overdue_days": 0,
    "is_disputed": false
  },
  {
    "id": "inv_005",
    "invoice_number": "INV-2026-089",
    "buyer_id": "buyer_05",
    "buyer_name": "Global Distributors",
    "amount_paise": 35000000,
    "paid_amount_paise": 0,
    "issue_date": "2026-08-17",
    "payment_terms_days": 30,
    "due_date": "2026-09-16",
    "status": "OVERDUE",
    "overdue_days": 45,
    "is_disputed": false
  }
]
```

### `POST /api/invoices`
Create a manual invoice entry.
- **Request Body**:
```json
{
  "buyer_id": "buyer_01",
  "invoice_number": "INV-2026-101",
  "amount_paise": 1500000,
  "issue_date": "2026-10-31",
  "payment_terms_days": 30
}
```
- **Response (201 Created)**:
```json
{
  "id": "inv_101",
  "invoice_number": "INV-2026-101",
  "buyer_id": "buyer_01",
  "amount_paise": 1500000,
  "due_date": "2026-11-30",
  "status": "UNPAID"
}
```

### `PATCH /api/invoices/{id}`
Update invoice details or status.
- **Request Body**:
```json
{
  "status": "OVERDUE",
  "notes": "Followed up via telephone"
}
```
- **Response (200 OK)**:
```json
{
  "id": "inv_101",
  "status": "OVERDUE",
  "updated_at": "2026-10-31T11:05:00Z"
}
```

### `POST /api/invoices/upload`
AI Invoice/PO OCR extraction stub.
- **Request**: Multipart file or JSON with base64/URL.
```json
{
  "file_name": "sample_invoice.pdf",
  "file_type": "application/pdf"
}
```
- **Response (200 OK)**:
```json
{
  "extracted": {
    "invoice_number": "INV-2026-092",
    "buyer_name": "ABC Industries",
    "buyer_gstin": "27AAACA1234A1Z5",
    "amount_paise": 7500000,
    "issue_date": "2026-10-28",
    "payment_terms_days": 30,
    "due_date": "2026-11-27",
    "line_items": [
      {
        "description": "High Tensile Fasteners (Grade 8.8)",
        "quantity": 500,
        "unit_price_paise": 15000
      }
    ]
  },
  "confidence": 0.98,
  "extraction_id": "ext_551"
}
```

### `POST /api/invoices/{id}/payments`
Record payment received for an invoice.
- **Request Body**:
```json
{
  "amount_paise": 5000000,
  "paid_date": "2026-10-31",
  "payment_mode": "RTGS",
  "reference_number": "UTR20261031987654"
}
```
- **Response (201 Created)**:
```json
{
  "payment_id": "pay_501",
  "invoice_id": "inv_001",
  "amount_paise": 5000000,
  "new_invoice_status": "PAID",
  "delay_days": -14
}
```

---

## 5. Payment Risk Radar

### `GET /api/risk-radar`
Returns exposure risk quadrants, aging buckets, and high-risk accounts. All data labeled as ESTIMATES.
- **Response (200 OK)**:
```json
{
  "disclaimer": "Payment Risk Radar calculations are predictive ESTIMATES based on historical delay trends and are not guarantees.",
  "total_exposure_paise": 87500000,
  "at_risk_paise": 58000000,
  "risk_breakdown": {
    "low_risk_paise": 17000000,
    "medium_risk_paise": 12500000,
    "high_risk_paise": 23000000,
    "critical_risk_paise": 35000000
  },
  "aging_buckets": [
    { "bucket": "Current (Not Due)", "amount_paise": 49500000, "invoices_count": 8 },
    { "bucket": "1 - 15 Days Overdue", "amount_paise": 10000000, "invoices_count": 2 },
    { "bucket": "16 - 30 Days Overdue", "amount_paise": 23000000, "invoices_count": 1 },
    { "bucket": "31 - 60 Days Overdue", "amount_paise": 0, "invoices_count": 0 },
    { "bucket": "60+ Days Overdue", "amount_paise": 35000000, "invoices_count": 1 }
  ],
  "radar_items": [
    {
      "buyer_id": "buyer_05",
      "buyer_name": "Global Distributors",
      "reliability_score": 31.0,
      "reliability_tier": "High payment risk",
      "outstanding_paise": 35000000,
      "days_overdue": 45,
      "risk_category": "CRITICAL",
      "projected_recovery_probability": 0.45,
      "recommended_action": "Issue formal MSMED section 15 interest demand notice"
    },
    {
      "buyer_id": "buyer_04",
      "buyer_name": "Metro Suppliers",
      "reliability_score": 54.0,
      "reliability_tier": "Needs attention",
      "outstanding_paise": 23000000,
      "days_overdue": 18,
      "risk_category": "HIGH",
      "projected_recovery_probability": 0.72,
      "recommended_action": "Follow up on broken payment commitment"
    }
  ]
}
```

---

## 6. Cash Flow Forecasting

### `GET /api/cashflow/forecast`
Returns 30/60 day projected inflows vs expected due dates and anticipated shortfalls.
- **Response (200 OK)**:
```json
{
  "disclaimer": "Cash-flow projections are ESTIMATES based on buyer historical delay patterns.",
  "projected_period_days": 60,
  "expected_total_inflow_paise": 87500000,
  "projected_realizable_paise": 62500000,
  "projected_delayed_shortfall_paise": 25000000,
  "forecast_series": [
    { "date": "2026-11-05", "nominal_due_paise": 15000000, "projected_inflow_paise": 14200000, "projected_gap_paise": 800000 },
    { "date": "2026-11-12", "nominal_due_paise": 20000000, "projected_inflow_paise": 16000000, "projected_gap_paise": 4000000 },
    { "date": "2026-11-19", "nominal_due_paise": 25000000, "projected_inflow_paise": 18500000, "projected_gap_paise": 6500000 },
    { "date": "2026-11-26", "nominal_due_paise": 17500000, "projected_inflow_paise": 10000000, "projected_gap_paise": 7500000 },
    { "date": "2026-12-03", "nominal_due_paise": 10000000, "projected_inflow_paise": 3800000, "projected_gap_paise": 6200000 }
  ]
}
```

---

## 7. Reminder Drafting Engine

### `POST /api/reminders/draft`
Generates a tone-calibrated reminder message draft.
- **Request Body**:
```json
{
  "invoice_id": "inv_004",
  "buyer_id": "buyer_04",
  "tone": "FIRM",
  "channel": "WHATSAPP"
}
```
- **Response (200 OK)**:
```json
{
  "reminder_id": "rem_901",
  "channel": "WHATSAPP",
  "tone": "FIRM",
  "subject": "Urgent: Payment Follow-up for Invoice INV-2026-077",
  "body": "Dear Accounts Team at Metro Suppliers, Invoice INV-2026-077 for ₹2,30,000 was due on Oct 13, 2026 and is now 18 days overdue. We kindly request an immediate update on the RTGS clearance date to avoid delivery holds on ongoing purchase orders.",
  "recipient": "+91 98330 11223"
}
```

### `GET /api/reminders`
Returns history of reminder drafts and dispatches.
- **Response (200 OK)**:
```json
[
  {
    "id": "rem_801",
    "invoice_id": "inv_005",
    "buyer_name": "Global Distributors",
    "channel": "EMAIL",
    "tone": "LEGAL_NOTICE",
    "sent_at": "2026-10-25T14:30:00Z",
    "status": "SENT"
  }
]
```

---

## 8. Disputes & Dossier Pack

### `GET /api/disputes`
Returns list of all active and resolved invoice disputes.
- **Response (200 OK)**:
```json
[
  {
    "id": "disp_01",
    "invoice_id": "inv_004",
    "invoice_number": "INV-2026-077",
    "buyer_id": "buyer_04",
    "buyer_name": "Metro Suppliers",
    "reason": "RATE_DISCREPANCY",
    "disputed_amount_paise": 3000000,
    "status": "OPEN",
    "notes": "Buyer claims quoted rate was ₹140/kg instead of ₹155/kg on PO",
    "opened_at": "2026-10-20T09:15:00Z",
    "documents_count": 2
  }
]
```

### `POST /api/disputes`
Open a dispute on an invoice (removes it from reliability score calculation).
- **Request Body**:
```json
{
  "invoice_id": "inv_003",
  "buyer_id": "buyer_03",
  "reason": "DAMAGED_GOODS",
  "disputed_amount_paise": 2000000,
  "notes": "Consignment reported 12 units damaged in transit."
}
```
- **Response (201 Created)**:
```json
{
  "id": "disp_02",
  "invoice_id": "inv_003",
  "status": "OPEN",
  "message": "Dispute logged. Invoice inv_003 is now excluded from Buyer Reliability Score calculations."
}
```

### `PATCH /api/disputes/{id}`
Update dispute status.
- **Request Body**:
```json
{
  "status": "RESOLVED",
  "resolution_notes": "Credit note CN-2026-09 issued for ₹20,000 difference."
}
```
- **Response (200 OK)**:
```json
{
  "id": "disp_01",
  "status": "RESOLVED",
  "resolved_at": "2026-10-31T11:10:00Z"
}
```

### `GET /api/disputes/{id}/pack`
Generates a downloadable structured evidence pack dossier.
- **Response (200 OK)**:
```json
{
  "dispute_id": "disp_01",
  "dossier_title": "Dispute Evidence Dossier - INV-2026-077 - Metro Suppliers",
  "generated_at": "2026-10-31T11:15:00Z",
  "summary": {
    "invoice_number": "INV-2026-077",
    "buyer_name": "Metro Suppliers",
    "disputed_amount_paise": 3000000,
    "total_invoice_amount_paise": 23000000
  },
  "documents": [
    {
      "id": "doc_101",
      "type": "PURCHASE_ORDER",
      "file_name": "PO-Metro-4421.pdf",
      "url": "https://storage.payflow.local/docs/PO-Metro-4421.pdf"
    },
    {
      "id": "doc_102",
      "type": "DELIVERY_CHALLAN",
      "file_name": "DC-Signed-8871.pdf",
      "url": "https://storage.payflow.local/docs/DC-Signed-8871.pdf"
    }
  ],
  "timeline": [
    { "date": "2026-09-15", "event": "Purchase Order PO-Metro-4421 received" },
    { "date": "2026-09-20", "event": "Goods dispatched with Delivery Challan DC-Signed-8871" },
    { "date": "2026-09-21", "event": "Tax Invoice INV-2026-077 issued" },
    { "date": "2026-10-20", "event": "Rate discrepancy dispute opened by buyer" }
  ]
}
```
