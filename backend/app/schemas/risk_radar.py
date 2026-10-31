from pydantic import BaseModel
from typing import List, Optional


class RiskBreakdown(BaseModel):
    low_risk_paise: int
    medium_risk_paise: int
    high_risk_paise: int
    critical_risk_paise: int


class AgingBucket(BaseModel):
    bucket: str
    amount_paise: int
    invoices_count: int


class RadarItem(BaseModel):
    buyer_id: str
    buyer_name: str
    reliability_score: Optional[float] = None
    reliability_tier: str
    outstanding_paise: int
    days_overdue: int
    risk_category: str  # LOW, MEDIUM, HIGH, CRITICAL
    projected_recovery_probability: float
    recommended_action: str


class RiskRadarResponse(BaseModel):
    disclaimer: str = "Payment Risk Radar calculations are predictive ESTIMATES based on historical delay trends and are not guarantees."
    total_exposure_paise: int
    at_risk_paise: int
    risk_breakdown: RiskBreakdown
    aging_buckets: List[AgingBucket]
    radar_items: List[RadarItem]
