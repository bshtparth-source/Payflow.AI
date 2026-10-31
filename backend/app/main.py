from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.deps import DEMO_BUSINESS
from app.schemas.common import HealthResponse

# Routers
from app.routers import (
    dashboard,
    buyers,
    invoices,
    risk_radar,
    cashflow,
    reminders,
    disputes,
)

app = FastAPI(
    title="Payflow AI API",
    description=(
        "Intelligent Payment Recovery & Buyer Reliability Platform for Indian MSMEs. "
        "Provides Buyer Reliability Score, Payment Risk Radar, AI invoice parsing, "
        "automated tone-calibrated reminders, and dispute packaging. "
        "Auth is intentionally out of scope: all endpoints operate on a single seeded demo business."
    ),
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all feature routers
app.include_router(dashboard.router)
app.include_router(buyers.router)
app.include_router(invoices.router)
app.include_router(risk_radar.router)
app.include_router(cashflow.router)
app.include_router(reminders.router)
app.include_router(disputes.router)


@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
def health_check() -> HealthResponse:
    """
    Health check endpoint returning service operational status.
    """
    return HealthResponse(
        status="healthy",
        version=settings.VERSION,
        mode="mock" if settings.USE_MOCK_DATA else "live",
        business=DEMO_BUSINESS["name"],
    )


@app.get("/", include_in_schema=False)
def root_redirect():
    """
    API root information.
    """
    return {
        "project": "Payflow AI Backend",
        "documentation": "/docs",
        "health": "/api/health",
    }
