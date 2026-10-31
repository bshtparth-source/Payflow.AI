from fastapi import APIRouter, Depends
from typing import Dict, Any
from app.core.deps import get_current_business
from app.schemas.risk_radar import RiskRadarResponse
from app.services.risk_radar import get_risk_radar_analysis

router = APIRouter(prefix="/api/risk-radar", tags=["Payment Risk Radar"])


@router.get("", response_model=RiskRadarResponse)
def get_risk_radar(
    current_business: Dict[str, Any] = Depends(get_current_business),
) -> RiskRadarResponse:
    """
    Returns Payment Risk Radar analysis: aging buckets, risk breakdown, and priority recovery actions.
    Outputs are ESTIMATES based on buyer delay behavior.
    """
    res = get_risk_radar_analysis()
    return RiskRadarResponse(**res)
