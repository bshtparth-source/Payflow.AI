# Product Specification: Payflow AI

## 1. Problem Statement
Indian Micro, Small, and Medium Enterprises (MSMEs) form the backbone of the economy, yet over 60% face existential cash-flow stress due to delayed B2B payments. While section 15 of the MSMED Act stipulates payment within 45 days, suppliers routinely wait 90 to 180 days. 

Suppliers lack:
1. **Objective Buyer Behavioral Intelligence**: They cannot differentiate between buyers who pay late systematically versus those with temporary liquidity delays.
2. **Predictive Cash Shortfall Radar**: Inability to forecast working capital gaps before payroll or raw material orders bounce.
3. **Professional Collection Infrastructure**: Manual, awkward WhatsApp reminders, missing dispute audit trails, and broken verbal promises.
4. **Instant Actionable Recovery Guidance**: Time-poor owners need immediate clarity on which counterparty to follow up with first and how to communicate effectively.

---

## 2. Target Users
- **Primary Persona**: Indian MSME Owner, Managing Director, or Finance Partner running manufacturing, trading, distribution, or job-work operations (annual turnover ₹50 Lakh to ₹25 Crore).
- **Current Behavior**: Maintains accounts in Tally or Excel, conducts payment follow-ups via sporadic phone calls and WhatsApp messages, lacks formal credit-risk tracking.

---

## 3. Product Features

### Headline Feature 1: Buyer Reliability Score
A private, objective 0-100 behavioral score computed solely from the supplier's actual invoice settlement history with each buyer.
- Evaluated **strictly relative to agreed credit terms** (e.g. 30, 45, or 60 days).
- Invariant: A ₹50,000 late payment carries the exact same delay penalty as a ₹5,00,000 late payment. Monetary exposure is tracked independently.
- Tiers: Highly reliable (90-100), Reliable (75-89), Moderate reliability (60-74), Needs attention (40-59), High payment risk (<40), and Insufficient history (<3 settled invoices).

### Headline Feature 2: Payment Risk Radar
A forward-looking cash protection matrix that projects upcoming payment delays and identifies high-exposure accounts before default occurs.
- Evaluates overdue aging buckets: Current, 1-15 days, 16-30 days, 31-60 days, and 60+ days.
- Forecasts probability of delay and estimates capital at risk.
- **Always labeled as an ESTIMATE**, never an absolute guarantee.

### Headline Feature 3: AI Chat Assistant (Gemini)
An integrated natural-language financial copilot powered by Google Gemini via `@google/genai`:
- Grounded deterministically with precomputed ledger facts (`COMPUTED_FACTS`) to prevent hallucination.
- Instantly answers prioritized recovery queries (e.g. "Which customer should I follow up with first?", "Who are my riskiest buyers and why?").
- Evaluates priority using an objective multi-factor formula combining overdue amount, oldest overdue duration, and reliability deficit.
- Multi-lingual support: replies in the user's language and script (English, Hindi, Hinglish).
- Generates polished, tone-calibrated WhatsApp & Email payment reminders with exact invoice details.

### Auxiliary Capabilities
- **Invoice & PO Extraction (Simulated)**: Ingestion of purchase orders and invoices extracting dates, amounts, and credit terms.
- **Automated Reminder Drafting**: Contextual WhatsApp and Email communication templates categorized by tone: Gentle Reminder (pre-due), Firm Follow-up (1-15 days overdue), Formal Demand (16-45 days), and Legal Notice (45+ days MSMED reference).
- **Dispute Docket Organizer**: Centralizes contested invoices, reasons (pricing mismatch, damaged goods, delivery delay), supporting communications, and generates a formal dispute evidence pack.
- **Cash-Flow Forecast**: 30-to-90 day visual projection comparing expected receivables against fixed obligations.

---

## 4. Non-Goals (Strict Scope Exclusions)

> [!WARNING]
> The following capabilities are explicitly out of scope for this hackathon release:
> 1. **No Landing / Marketing Page**: The application has no public home page, marketing hero, feature tour, or pricing page. Root `/` redirects directly to `/dashboard`.
> 2. **No Authentication / Authorization**: No login, sign-up, password reset, session cookies, JWT headers, OAuth (Google/GitHub), Clerk/Auth0/Firebase SDKs, or User database tables.
> 3. **No Multi-Tenancy**: The application exclusively loads a single seeded demo MSME (`Kaveri Industrial Supplies`). Endpoints never require `business_id` parameters.
> 4. **No External Bureau Reporting**: The Buyer Reliability Score is not an external credit score (like CIBIL or Experian) and is never shared outside the supplier's private dashboard.
