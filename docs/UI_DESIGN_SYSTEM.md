# UI Design System & Content Guidelines: Payflow AI

## 1. Brand & Theme Colors

| Role | Color Name | Hex Code | Tailwind Equivalent | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Primary** | Indigo 700 | `#3730A3` | `indigo-700` | Brand header, primary buttons, active sidebar item, brand badges. |
| **Primary Hover** | Indigo 800 | `#312E81` | `indigo-800` | Button hover states, active accents. |
| **Accent** | Teal 600 | `#0D9488` | `teal-600` | CTAs, cash-flow inflow indicators, positive action pills. |
| **Accent Hover** | Teal 700 | `#0F766E` | `teal-700` | Accent button hover states. |
| **Background** | Slate 50 | `#F8FAFC` | `slate-50` | Global page background. |
| **Card / Surface** | Pure White | `#FFFFFF` | `white` | Cards, modals, tables, sidebar surfaces. |
| **Border / Divider**| Slate 200 | `#E2E8F0` | `slate-200` | Table borders, card outlines, separators. |
| **Text Primary** | Slate 900 | `#0F172A` | `slate-900` | Headings, primary metrics, high-emphasis text. |
| **Text Secondary**| Slate 500 | `#64748B` | `slate-500` | Subtitles, labels, metadata, disclaimers. |

---

## 2. Status Colors (Reliability Tiers & Invoices)

| Tier / Status | Hex Code | Background Tint | Border Tint | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Highly reliable** | `#16A34A` | `#DCFCE7` (`green-100`) | `#86EFAC` (`green-300`) | Score 90-100, Paid invoices |
| **Reliable** | `#65A30D` | `#ECFCCB` (`lime-100`) | `#BEF264` (`lime-300`) | Score 75-89 |
| **Moderate reliability**| `#D97706` | `#FEF3C7` (`amber-100`) | `#FCD34D` (`amber-300`) | Score 60-74, In Review / Disputed |
| **Needs attention** | `#EA580C` | `#FFEDD5` (`orange-100`) | `#FDBA74` (`orange-300`) | Score 40-59, 1-15d Overdue |
| **High payment risk** | `#DC2626` | `#FEE2E2` (`red-100`) | `#FCA5A5` (`red-300`) | Score <40, 30+d Overdue, Broken commitment |
| **Insufficient history**| `#64748B` | `#F1F5F9` (`slate-100`) | `#CBD5E1` (`slate-300`) | <3 invoices, Pending evaluation |

---

## 3. Typography & Formatting Rules

- **Font Family**: `Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`.
- **Currency Representation**:
  - Always display in Indian National Rupee (`₹`).
  - Format using the Indian numbering system: thousands, lakhs, and crores.
  - Example: `12000000 paise` $\to$ `₹1,20,000`.
  - Example: `5000000 paise` $\to$ `₹50,000`.
- **Date Representation**:
  - Display dates as readable Indian business standard: `DD MMM YYYY` (e.g. `14 Nov 2026`).

---

## 4. Content & Wording Rules (CRITICAL)

### Rule 1: Always "Buyer Reliability Score", Never "Credit Score"
- **Correct**: *"Buyer Reliability Score"*, *"Reliability Tier"*, *"Payment Reliability Assessment"*.
- **Forbidden**: *"Credit Score"*, *"Credit Rating"*, *"CIBIL Score"*, *"CIBIL Report"*.
- **Rationale**: This is a private, terms-relative behavioral assessment calculated strictly from the supplier's own ledger history.

### Rule 2: Objective & Factual, Never Accusatory
- **Forbidden Terms**: *"Fraud"*, *"Defaulter"*, *"Scam"*, *"Criminal"*, *"Cheat"*, *"Bad debtor"*.
- **Approved Terms**: *"Overdue payment"*, *"Delayed settlement"*, *"Payment commitment pending"*, *"High payment risk"*, *"Needs follow-up"*.

### Rule 3: Always Label Risk Radar & Cash-Flow as "ESTIMATES"
- Whenever displaying Risk Radar probabilities or Cash-flow forecasts, prominently present the disclaimer:
  > *"Estimates based on historical payment patterns, not a financial guarantee."*

### Rule 4: Always Show Score Context
- Every score badge or score view must display:
  - The numeric score or "N/A"
  - The tier badge
  - The `transactions_count` (e.g., `(18 invoices)`)
  - The disclaimer: *"Scores are private estimates from your own invoice history, not a credit rating."*

### Rule 5: Static Single-Tenant Business Badge
- The top navigation bar displays a static pill:
  `[🏢 Kaveri Industrial Supplies]` accompanied by `[⚡ Demo Data]`
- **No dropdown, no avatar, no logout option.**
