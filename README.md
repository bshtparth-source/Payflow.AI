# Payflow AI (Buyer Reliability Platform)

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)](https://vercel.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC?logo=tailwind-css)](https://tailwindcss.com)

**Payflow AI** is an intelligent payment-recovery and cash-flow platform specifically tailored for Indian MSMEs waiting on delayed B2B payments. The platform ingests invoices and purchase orders, extracts terms, predicts cash-flow shortfalls, drafts tone-calibrated recovery reminders, organizes formal dispute dossiers, and computes an objective **Buyer Reliability Score** for counterparty buyers.

> [!IMPORTANT]
> **Strict Non-Goals / Scope Directives:**
> - **No Landing Page**: The app opens directly at `/dashboard`. Root `/` immediately redirects to `/dashboard`.
> - **No Login / No Auth**: All authentication, registration, user tables, JWTs, and session tokens are intentionally out of scope. The entire application operates seamlessly for one seeded demo business.

---

## 🚀 Key Features

1. **Buyer Reliability Score (0–100)**: Objective scoring relative to agreed payment terms (`payment_terms_days`), strictly independent of invoice monetary amounts.
2. **Payment Risk Radar**: Forward-looking predictive realization modeling categorizing open receivables into low, medium, and high payment risk buckets.
3. **Cash Flow Forecaster**: 30/60/90-day liquidity runway estimates comparing expected collections against supplier working capital needs.
4. **AI Invoice Extraction**: OCR-assisted ingestion of purchase orders and invoices extracting dates, amounts, and credit terms.
5. **Tone-Calibrated Reminders**: Automated follow-up drafts across gentle, firm, urgent, and legal escalation stages with WhatsApp and Email previews.
6. **Dispute Document Organizer**: Dossier compilation linking POs, delivery challans, and disputed invoices for MSME Samadhaan escalation.

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
│   ├── DATA_MODEL.md              # SQLModel schema (INR paise representation)
│   ├── API_CONTRACT.md            # REST API endpoints, schemas, request/response examples
│   ├── SCORING_SPEC.md            # Mathematical scoring formula, sub-scores, weights
│   ├── UI_DESIGN_SYSTEM.md        # Tokens, status colors, typography, wording rules
│   ├── FEATURES.md                # Feature implementation board (F1 - F7)
│   └── DECISIONS.md               # Architecture decision records (ADRs)
├── design/stitch-exports/         # Stitch HTML & screenshot exports
├── frontend/                      # Next.js App Router frontend
│   ├── src/app/                   # App Router pages (redirects / -> /dashboard)
│   ├── src/components/            # UI components (sidebar, topbar, charts, gauges)
│   ├── src/lib/api.ts             # Typed API client
│   └── src/lib/types.ts           # Shared TypeScript interfaces
└── backend/                       # Python FastAPI backend
    ├── app/main.py                # App entrypoint & CORS
    ├── app/core/config.py         # App settings & env configuration
    ├── app/core/deps.py           # get_current_business() stub
    ├── app/models/                # SQLModel database tables
    ├── app/schemas/               # Pydantic v2 schemas
    ├── app/routers/               # REST API route handlers
    ├── app/services/              # Service implementations & stubs
    │   └── scoring.py             # Pure function scoring engine (tested)
    ├── app/data/seed.json         # Realistic Indian MSME seed data
    └── tests/                     # pytest test suite
```

---

## 🛠️ Local Development Quickstart

### Prerequisites
- Node.js 18+ (Node 20+ recommended)
- Python 3.10+

### 1. Backend Setup
```bash
cd backend
python -m venv .venv
# Activate virtualenv:
# Windows (PowerShell): .venv\Scripts\Activate.ps1
# Linux / macOS: source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# Run FastAPI dev server:
uvicorn app.main:app --reload --port 8000
```
- Interactive API Docs (Swagger UI): `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Health check: `http://localhost:8000/api/health`
- Run test suite: `pytest`

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local

# Run Next.js dev server:
npm run dev
```
- Open `http://localhost:3000` — lands directly on the **Dashboard** (`/dashboard`).

---

## 🚢 Deployment Guide

### Deploying Frontend on Vercel
The frontend is configured for zero-friction Vercel deployment:
1. In the Vercel dashboard, import the repository: `https://github.com/bshtparth-source/Payflow.AI`.
2. Set **Root Directory** to `frontend`.
3. Framework Preset will auto-detect as **Next.js**.
4. Configure Environment Variables:
   - `NEXT_PUBLIC_API_BASE_URL`: The URL of your deployed backend (e.g. `https://payflow-api.onrender.com` or `http://localhost:8000` for local testing).
5. Click **Deploy**.

### Deploying Backend
The FastAPI backend can be deployed independently to Render, Railway, Fly.io, or AWS:
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables**:
  - `CORS_ORIGINS`: Comma-separated allowed origins (e.g. `http://localhost:3000,https://payflow-ai.vercel.app`)
  - `USE_MOCK_DATA`: Set to `true` (default) for mock responses or `false` when connecting to live database.

---

## 🤝 How Teammates & Partners Pick Up a Feature

All backend endpoints are pre-wired, typed, and return schema-valid mock data. Feature services are stubbed with skipped unit tests.

To implement a feature:
1. Open [`docs/FEATURES.md`](file:///docs/FEATURES.md) and pick your feature (e.g., `F1 Invoice extraction`, `F3 Reminder drafting`, `F5 Cash-flow forecast`).
2. Read [`docs/API_CONTRACT.md`](file:///docs/API_CONTRACT.md) to understand the exact payload requirements.
3. Open the corresponding service file in `backend/app/services/` (e.g. `app/services/reminders.py`).
4. Replace the mock implementation with real logic (e.g. connecting an LLM, OCR engine, or database query).
5. **DO NOT change the response schema or function signature.**
6. Open `backend/tests/test_services_stubs.py`, remove `@pytest.mark.skip`, and verify tests pass:
   ```bash
   pytest backend/tests/test_services_stubs.py
   ```
7. Update the service file header and mark `STATUS: IMPLEMENTED` in `docs/FEATURES.md`.

---

## ⚖️ License
MIT License. Built for hackathon demonstration.
