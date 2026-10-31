from fastapi import APIRouter, Depends, Query
from typing import Dict, Any
from app.core.deps import get_current_business
from app.schemas.cashflow import CashflowForecastResponse
from app.services.cashflow import get_cashflow_forecast

router = APIRouter(prefix="/api/cashflow", tags=["Cash Flow"])


@router.get("/forecast", response_model=CashflowForecastResponse)
def get_cashflow(
    period_days: int = Query(60, description="Projection window in days (30, 60, 90)"),
    current_business: Dict[str, Any] = Depends(get_current_business),
) -> CashflowForecastResponse:
    """
    Returns 30/60-day predictive cash inflow trajectory and anticipated working capital shortfalls.
    Outputs are ESTIMATES based on buyer delay behavior.
    """
    res = get_cashflow_forecast(period_days=period_days)
    return CashflowForecastResponse(**res)
