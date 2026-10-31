# PayFlow AI Assistant: Architecture & Prompt Specification

## 1. Overview
The PayFlow AI Assistant (`/assistant`) is an integrated decision-support agent designed for small business owners and finance heads using PayFlow AI. It translates raw MSME ledger history, overdue aging, and behavioral settlement metrics into instant, actionable recovery decisions.

The assistant is powered by Google's Gemini models via the official `@google/genai` TypeScript SDK and operates through a secure, streaming Next.js Route Handler (`/api/chat`).

---

## 2. Architecture & Data Flow

```
┌────────────────────────────────────────────────────────┐
│                   Next.js Client                       │
│    (/assistant, suggested chips, ?q= deep-links)      │
└──────────────────────────┬─────────────────────────────┘
                           │ POST { messages: [...] }
                           ▼
┌────────────────────────────────────────────────────────┐
│         Route Handler (/api/chat - nodejs)             │
│  - IP Rate Limiting (20 req/min)                       │
│  - Character Limit Guard (max 1,000 chars/msg)        │
│  - Trims to last 10 messages                           │
│  - Reads local ledger + analytics facts                │
└──────────────────────────┬─────────────────────────────┘
                           │ System Instruction with COMPUTED_FACTS
                           ▼
┌────────────────────────────────────────────────────────┐
│                  Google Gemini API                     │
│        Model: gemini-3.5-flash / gemini-2.5-flash      │
│        Temperature: 0.2 (deterministic facts)          │
└──────────────────────────┬─────────────────────────────┘
                           │ Plain-text Chunk Stream
                           ▼
┌────────────────────────────────────────────────────────┐
│                   Next.js Client                       │
│  - Real-time chunk accumulation & UI auto-scroll       │
│  - Markdown rendering (react-markdown)                 │
└────────────────────────────────────────────────────────┘
```

---

## 3. Grounding & Data Injection Strategy

To ensure zero hallucination and 100% mathematical fidelity:
1. **No LLM Arithmetic**: The AI is never asked to calculate sums, overdue days, or percentages dynamically.
2. **Precomputed Ledger Facts (`COMPUTED_FACTS`)**: `frontend/src/lib/analytics.ts` computes all ledger metrics in advance:
   - `as_of_date`: Fixed constant (`2026-10-31`).
   - `totals`: Total buyers (6), total invoices (15), total outstanding (₹9,25,000), total overdue (₹6,80,000), overdue percentage (73.5%), at-risk capital (₹3,50,000), and active disputes (1).
   - `buyer_priority_ranking`: Exhaustive array of all buyers ranked by normalized priority score.
   - `top_priority_buyer`: Global Distributors.
3. **Raw Ledger Context**: Raw buyer details, invoice items, dispute entries, and reminder drafts are injected into the system instruction for granular reference (invoice numbers, dates, payment terms).

---

## 4. Priority Ranking Formula

The ranking formula prioritizes counterparty follow-up based on overdue severity, aging duration, and behavioral reliability:

$$\text{Priority Score} = 0.50 \times \left(\frac{\text{Buyer Overdue Amount}}{\text{Max Overdue Amount}}\right) + 0.30 \times \left(\frac{\text{Buyer Oldest Overdue Days}}{\text{Max Oldest Overdue Days}}\right) + 0.20 \times \left(\frac{100 - \text{Buyer Reliability Score}}{100}\right)$$

### Key Invariant Rules for Priority:
1. **Overdue Term (50% Weight)**: Normalized against the maximum overdue balance across all buyers in the ledger (`₹3,50,000` for Global Distributors).
2. **Aging Term (30% Weight)**: Normalized against the longest overdue delay (`45 days` for Global Distributors).
3. **Score Deficit Term (20% Weight)**: Inversely proportional to the Buyer Reliability Score.
4. **Insufficient History Handling**: For counterparties with fewer than 3 settled transactions (e.g., Nova Packaging), their score is `null`. The score factor defaults to a neutral `0.50` and the buyer is **never** categorized as risky.

### Current Ledger Ranking:
| Rank | Buyer | Overdue (₹) | Oldest Overdue | Reliability Score | Priority Score | Status |
|:---:|:---|:---:|:---:|:---:|:---:|:---|
| **1** | **Global Distributors** | ₹3,50,000 | 45 days | 31.0/100 | **0.9380** | High payment risk |
| **2** | **Metro Suppliers** | ₹2,30,000 | 18 days | 54.0/100 | **0.5406** | Needs attention (1 dispute) |
| **3** | **RK Enterprises** | ₹1,00,000 | 15 days | 68.0/100 | **0.3069** | Moderate reliability |
| **4** | **Nova Packaging** | ₹0 | 0 days | *null* | **0.1000** | Insufficient history |
| **5** | **Sharma Traders** | ₹0 | 0 days | 78.0/100 | **0.0440** | Reliable |
| **6** | **ABC Industries** | ₹0 | 0 days | 94.0/100 | **0.0120** | Highly reliable |

---

## 5. System Prompt Invariants & Behavioral Guidelines

1. **Strictly Grounded**: Answer only from provided facts. If information is absent, say so directly. Never invent counterparties or amounts.
2. **Language Mirroring**: Respond in the same language and script as the query (English, Hindi, or Hinglish).
3. **Decision-Oriented Structure**:
   - Direct conclusion or recommendation in the first sentence.
   - 2 to 4 bullet points with exact figures and data references.
   - Exactly one suggested next action.
4. **Terminology**:
   - Always call it **"Buyer Reliability Score"** (0-100). Never "credit score", "credit rating", or "CIBIL score".
   - Never use accusatory words such as "fraud", "defaulter", "cheat", or "scam". Delays must be described factually ("overdue past agreed terms", "delayed payment").
5. **Dispute Isolation**: Invoices in `DISPUTED` status are labeled as "under review" and excluded from reliability calculations.
6. **Estimates Disclaimer**: All forecasts and projections are explicitly labeled as behavioral estimates, not financial guarantees.
7. **Reminder Drafting**: Follow-up reminders must be polite, professional, and contain exact invoice numbers, due dates, and INR amounts.

---

## 6. The 5 Core Demo Questions & Expected Outputs

### 1. "Which customer should I follow up with first?"
- **Top Answer**: Global Distributors (Rank #1, Priority Score: 0.938).
- **Reasons**:
  - Highest overdue exposure in ledger: ₹3,50,000 (51.5% of total overdue balance).
  - Longest payment delay: 45 days overdue (due 15-Sep-2026).
  - Lowest reliability score: 31.0/100 ("High payment risk", based on 9 settled invoices).
- **Next Action**: Issue formal demand notice with delivery receipts and schedule director-level follow-up.

### 2. "Who are my riskiest buyers and why?"
- **Answer**:
  - **Global Distributors** (Score: 31/100, High payment risk): ₹3,50,000 overdue by 45 days; broken payment timelines across 9 transactions.
  - **Metro Suppliers** (Score: 54/100, Needs attention): ₹2,30,000 overdue by 18 days; broken commitment on 25-Oct; 1 invoice (INV-2026-004) under active dispute review.
  - *Clarification on Nova Packaging*: Nova has ₹75,000 outstanding but is categorized as "Insufficient history" (2 transactions) and is **not** risky.

### 3. "How much money is overdue in total?"
- **Answer**:
  - Total Overdue: **₹6,80,000** out of ₹9,25,000 total receivables (**73.5%** overdue).
  - Concentrated across 3 buyers: Global Distributors (₹3.50L), Metro Suppliers (₹2.30L), and RK Enterprises (₹1.00L).
  - On-time / within terms: ₹2,45,000 (Sharma Traders ₹1.20L, Nova Packaging ₹75K, ABC Industries ₹50K).

### 4. "Why is Metro Suppliers' score what it is?"
- **Answer**:
  - Score: **54.0/100 ("Needs attention")** based on 15 tracked transactions.
  - Sub-scores: On-time settlement (48/100), Delay severity (52/100), Commitment fulfillment (40/100 due to broken RTGS commitment on 25-Oct).
  - Note: Invoice INV-2026-004 (₹2,30,000) has an active dispute under review, which is isolated from score penalties.

### 5. "Draft a polite reminder for Global Distributors"
- **Answer**:
  - Channel: WhatsApp or Email.
  - Formatted message addressing the Accounts Team at Global Distributors regarding Invoice #INV-2026-005 for ₹3,50,000 due 15-Sep-2026 (45 days overdue). Polite, professional request for UTR or bank transfer confirmation.

---

## 7. Configuration & Environment Variables

Create `frontend/.env.local`:
```env
# Gemini API Key (Get from Google AI Studio)
GEMINI_API_KEY=your_gemini_api_key_here

# Default Gemini Model
GEMINI_MODEL=gemini-3.5-flash
```

When `GEMINI_API_KEY` is not present, the assistant returns a graceful fallback message without crashing or returning 500 errors.
