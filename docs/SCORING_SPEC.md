# Buyer Reliability Score Specification: Payflow AI

## 1. Core Principles & Invariants

1. **Relative to Terms Only**: Score measures payment behavior strictly relative to agreed credit terms (`payment_terms_days`), **never** weighted by invoice amount. A ₹10,00,000 invoice paid 5 days late has the exact same delay penalty as a ₹10,000 invoice paid 5 days late. Outstanding monetary exposure is tracked separately.
2. **Insufficient History Guard**: If a buyer has fewer than 3 settled invoices, the score MUST return label `"Insufficient history"` and `null` numeric score. It must **NEVER** be labeled as "risky" or given a low default score.
3. **Disputed Invoices Excluded**: Any invoice marked in `DISPUTED` status is strictly excluded from score calculations and displayed as "under review".
4. **Naming Convention**: The metric is ALWAYS titled `"Buyer Reliability Score"`. Never refer to it as a "credit score", "credit rating", or "CIBIL score". It is a private behavioral assessment derived exclusively from the supplier's own ledger history.
5. **Score Transparency**: Every score response includes `transactions_count` and `calculated_at` timestamp.
6. **Contestability**: Suppliers can challenge and adjust incorrect payment records.

---

## 2. Mathematical Score Composition

The composite Buyer Reliability Score is a weighted combination of 5 sub-scores on a normalized 0 to 100 scale:

| Component | Default Weight | Description |
| :--- | :---: | :--- |
| **On-Time Payment %** (`on_time`) | 30% | Proportion of settled invoices paid on or before agreed due date. |
| **Average Delay** (`delay`) | 25% | Severity of average payment delay past credit terms. |
| **Payment Consistency** (`consistency`) | 15% | Predictability of payment timing (standard deviation of delay). |
| **Broken Commitments** (`commitments`) | 15% | Adherence to promised payment commitments. |
| **Overdue History** (`overdue_history`) | 15% | Penalties for severe overdue breaches (30+ days) and current ratio. |

### Dynamic Redistribution Rule for Commitments:
If a buyer has no recorded payment commitments, the `commitments` component (15%) is excluded, and its weight is proportionally redistributed across the remaining 4 components:
- `on_time`: $30 / 85 \approx 35.29\%$
- `delay`: $25 / 85 \approx 29.41\%$
- `consistency`: $15 / 85 \approx 17.65\%$
- `overdue_history`: $15 / 85 \approx 17.65\%$

---

## 3. Sub-Score Formulas (0 to 100)

### 3.1 On-Time Payment Sub-Score (`on_time`)
$$\text{on\_time} = \left( \frac{\text{Settled Invoices with } \text{delay\_days} \le 0}{\text{Total Settled Invoices}} \right) \times 100$$

### 3.2 Average Delay Sub-Score (`delay`)
Let $\overline{d} = \text{mean}(\max(0, \text{delay\_days}))$.
$$\text{delay} = \max\left(0, 100 - \left( \frac{\overline{d}}{60} \right) \times 100\right)$$
- If average delay $\le 0$ days: Score = 100.
- If average delay = 15 days: Score = 75.
- If average delay = 30 days: Score = 50.
- If average delay $\ge 60$ days: Score = 0.

### 3.3 Payment Consistency Sub-Score (`consistency`)
Measures the standard deviation $\sigma$ of delay days across settled invoices. Predictable payers score higher:
$$\text{consistency} = \max\left(0, \min\left(100, 100 - (\sigma \times 3.0)\right)\right)$$
- If $\sigma = 0$ (pays on the exact same relative schedule every time): Score = 100.
- If $\sigma = 10$: Score = 70.
- If $\sigma \ge 33.3$: Score = 0.

### 3.4 Broken Commitments Sub-Score (`commitments`)
If total commitments recorded $N_{\text{comm}} > 0$:
$$\text{commitments} = \max\left(0, 100 - \left( \frac{\text{Missed Commitments}}{N_{\text{comm}}} \right) \times 100\right)$$
If $N_{\text{comm}} = 0$: `None` (triggers weight redistribution).

### 3.5 Overdue History Sub-Score (`overdue_history`)
Penalizes invoices that went into deep delinquency ($\ge 30$ days late) and accounts currently carrying high overdue exposure:
$$\text{severe\_penalty} = \left( \frac{\text{Invoices with delay} \ge 30 \text{ days}}{\text{Total Invoices}} \right) \times 50$$
$$\text{current\_overdue\_ratio} = \frac{\text{Current Overdue Invoices}}{\max(1, \text{Total Active Invoices})} \times 50$$
$$\text{overdue\_history} = \max(0, 100 - \text{severe\_penalty} - \text{current\_overdue\_ratio})$$

---

## 4. Reliability Tiers & Visual Indicators

| Score Range | Tier Label | Color Hex | Recommended Credit Policy |
| :---: | :--- | :--- | :--- |
| **90 - 100** | **Highly reliable** | `#16A34A` (Green) | Standard/relaxed credit limits, priority shipping. |
| **75 - 89** | **Reliable** | `#65A30D` (Lime) | Standard credit terms (30-45 days), routine reminders. |
| **60 - 74** | **Moderate reliability** | `#D97706` (Amber) | Monitor exposure closely, follow up 5 days before due date. |
| **40 - 59** | **Needs attention** | `#EA580C` (Orange) | Restrict additional credit, require advance or PDC before dispatch. |
| **0 - 39** | **High payment risk** | `#DC2626` (Red) | Advance payment / COD only, immediate formal recovery steps. |
| **N/A (< 3 invoices)** | **Insufficient history** | `#64748B` (Slate) | Baseline onboarding terms, require prompt settlement on initial orders. |

---

## 5. Seed Dataset Benchmark Cases

| Buyer Name | Score | Tier Label | Outstanding | Avg Delay | Invoices Count |
| :--- | :---: | :--- | :---: | :---: | :---: |
| **ABC Industries** | **94** | Highly reliable | ₹50,000 | 1 day | 18 |
| **Sharma Traders** | **78** | Reliable | ₹1,20,000 | 5 days | 12 |
| **RK Enterprises** | **68** | Moderate reliability | ₹1,00,000 | 12 days | 8 |
| **Metro Suppliers** | **54** | Needs attention | ₹2,30,000 | 18 days | 15 |
| **Global Distributors** | **31** | High payment risk | ₹3,50,000 | 45 days | 9 |
| **Nova Packaging** | **null** | Insufficient history | ₹75,000 | 0 days | 2 |

---

## 6. Priority Ranking Formula (Actionable Recovery Order)

To prioritize buyer follow-up across overdue balance, delinquency aging, and score deficits:

$$\text{Priority Score} = 0.50 \times \left(\frac{\text{Buyer Overdue Amount}}{\text{Max Overdue Amount}}\right) + 0.30 \times \left(\frac{\text{Buyer Oldest Overdue Days}}{\text{Max Oldest Overdue Days}}\right) + 0.20 \times \left(\frac{100 - \text{Score}}{100}\right)$$

- For buyers with "Insufficient history", the score term is set to a neutral `0.50` and the buyer is never labeled as risky.
- Detailed in `docs/AI_ASSISTANT.md`.
