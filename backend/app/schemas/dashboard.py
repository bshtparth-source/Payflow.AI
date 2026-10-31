from pydantic import BaseModel
from typing import List, Dict


class UrgentAction(BaseModel):
    id: str
    type: str
    buyer_id: str
    buyer_name: str
    invoice_id: str
    amount_paise: int
    days_overdue: int
    recommended_action: str


class PortfolioBreakdown(BaseModel):
    highly_reliable: int
    reliable: int
    moderate_reliability: int
    needs_attention: int
    high_risk: int
    insufficient_history: int


class DashboardSummaryResponse(BaseModel):
    business_name: str
    total_receivables_paise: int
    overdue_receivables_paise: int
    overdue_percentage: float
    average_collection_days: float
    at_risk_capital_paise: int
    buyer_count: int
    portfolio_breakdown: PortfolioBreakdown
    urgent_actions: List[UrgentAction]
