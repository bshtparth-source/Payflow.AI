# Payflow AI (Buyer Reliability Platform)

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)](https://vercel.com)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC?logo=tailwind-css)](https://tailwindcss.com)
[![Gemini API](https://img.shields.io/badge/Google_Gemini-3.5_Flash-4285F4?logo=google)](https://ai.google.dev)

**Payflow AI** is an intelligent payment-recovery and cash-flow platform specifically tailored for Indian MSMEs waiting on delayed B2B payments. The platform tracks invoice aging relative to agreed terms, predicts cash-flow shortfalls, drafts tone-calibrated recovery reminders, organizes formal dispute dossiers, computes an objective **Buyer Reliability Score** for counterparty buyers, and provides an integrated **AI Assistant** grounded in ledger data.

> [!IMPORTANT]
> **Strict Non-Goals / Scope Directives:**
> - **No Landing Page**: The app opens directly at `/dashboard`. Root `/` immediately redirects to `/dashboard`.
> - **No Login / No Auth**: All authentication, registration, user tables, JWTs, and session tokens are intentionally out of scope. The entire application operates seamlessly for one seeded demo business (`Kaveri Industrial Supplies`).
> - **Pure Next.js Architecture**: Zero external database and zero Python backend. Runs entirely on high-fidelity local demo data with derived analytics and a streaming Next.js Route Handler for the AI assistant.

---

## 🚀 Key Features

1. **Buyer Reliability Score (0–100)**: Objective scoring relative to agreed payment terms (`payment_terms_days`), strictly independent of invoice monetary amounts.
2. **Payment Risk Radar**: Forward-looking predictive realization modeling categorizing open receivables into low, medium, and high payment risk buckets.
3. **AI Chat Assistant (Gemini)**: Embedded decision-support assistant answering natural language questions on receivables, overdue rankings, and drafting reminders from verified ledger data.
4. **Cash Flow Forecaster**: 30/60/90-day liquidity runway estimates comparing expected collections against supplier working capital needs.
5. **AI Invoice Extraction**: OCR-assisted ingestion of purchase orders and invoices extracting dates, amounts, and credit terms.
6. **Tone-Calibrated Reminders**: Automated follow-up drafts across gentle, firm, urgent, and legal escalation stages with WhatsApp and Email previews.
7. **Dispute Document Organizer**: Dossier compilation linking POs, delivery challans, and disputed invoices for MSME Samadhaan escalation.

---

## 📂 Repository Structure

```
Payflow.AI/
├── AGENTS.md                      # Master guidance for AI agents & contributors
├── CLAUDE.md, GEMINI.md           # Quick references for specific AI tools
├── .github/copilot-instructions.md
├── README.md                      # This documentation
├── CONTRIBUTING.md                # Development standards & guidelines
├── docs/                          # Specifications & architecture docs
│   ├── PRODUCT.md                 # Problem statement, users, headline features, non-goals
│   ├── ARCHITECTURE.md            # Architecture diagram (mermaid), data flow, folder map
│   ├── DATA_MODEL.md              # TypeScript models & ledger schemas
│   ├── AI_ASSISTANT.md            # Gemini prompt specification, priority formula & demo QA
│   ├── SCORING_SPEC.md            # Mathematical scoring formula, sub-scores, weights
│   ├── UI_DESIGN_SYSTEM.md        # Tokens, status colors, typography, wording rules
│   └── DECISIONS.md               # Architecture decision records (ADRs)
├── design/stitch-exports/         # Stitch HTML & screenshot exports
└── frontend/                      # Standalone Next.js App Router frontend
    ├── src/app/                   # App Router pages (/dashboard, /assistant, etc.)
    │   ├── api/chat/route.ts      # Streaming Gemini AI route handler
    │   ├── assistant/page.tsx     # Dedicated AI assistant chat interface
    │   ├── buyers/                # Buyers portfolio & buyer detail views
    │   ├── dashboard/             # Overview dashboard
    │   ├── invoices/              # Invoices list & upload flow
    │   ├── risk-radar/            # Risk radar & exposure categorization
    │   ├── cashflow/              # Cashflow forecast projection view
    │   ├── reminders/             # Tone-calibrated reminder drafting
    │   └── disputes/              # Dispute dossiers & evidence packaging
    ├── src/components/            # UI components (sidebar, topbar, charts, gauges)
    ├── src/data/                  # Single source of truth demo data (seed.json, index.ts)
    ├── src/lib/analytics.ts       # Derived ledger metrics & priority calculations
    ├── src/lib/assistant-prompt.ts# Gemini prompt builder with ledger data injection
    ├── src/lib/gemini.ts          # Server-only Google GenAI client instance
    ├── src/lib/api.ts             # Typed local client
    └── src/lib/types.ts           # TypeScript interfaces matching ledger entities
```

---

## 🛠️ Local Development Quickstart

### Prerequisites
- Node.js 20+
- npm (comes with Node)

### Setup Instructions
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Add your Gemini API key from [Google AI Studio](https://aistudio.google.com/):
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-3.5-flash
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` (automatically redirects to `/dashboard`).

---

## 🚢 Deployment to Vercel

Deploy the application to Vercel in seconds:
- **Framework Preset**: `Next.js`
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (default)
- **Environment Variables**:
  - `GEMINI_API_KEY`: Your Gemini API key (*required for live AI responses*)
  - `GEMINI_MODEL`: `gemini-3.5-flash` (*optional, defaults to `gemini-3.5-flash`*)
