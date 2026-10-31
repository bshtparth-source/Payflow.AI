# Payflow AI: GitHub Copilot Instructions

This repository is configured as a standalone Next.js App Router project (located in `frontend/`) with no Python backend and no database.
Pre-loaded demo data (`frontend/src/data/`) and pure derived analytics (`frontend/src/lib/analytics.ts`) power the entire application.
A live AI Assistant is powered by the Gemini API via `@google/genai` (see `docs/AI_ASSISTANT.md`).

Master guidelines, strict no-auth/no-landing-page constraints, and invariant rules are defined in:
-> AGENTS.md (at repo root)
