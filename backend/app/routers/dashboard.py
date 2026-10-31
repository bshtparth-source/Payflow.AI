from fastapi import APIRouter, Depends
from typing import Dict, Any
from app.core.deps import get_current_business
from app.schemas.dashboard import DashboardSummaryResponse, PortfolioBreakdown, UrgentAction
from app.data.mock_loader import get_mock_data

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    current_business: Dict[str, Any] = Depends(get_current_business)
) -> DashboardSummaryResponse:
    """
    Returns executive summary of cash flow, portfolio reliability breakdown, and urgent recovery actions.
    """
    mock = get_mock_data()
    buyers = mock.get("buyers", [])
    invoices = mock.get("invoices", [])

    total_receivables = sum(inv.get("amount_paise", 0) for inv in invoices if inv.get("status") in ["UNPAID", "OVERDUE"])
    overdue_receivables = sum(inv.get("amount_paise", 0) for inv in invoices if inv.get("status") == "OVERDUE")
    overdue_pct = round((overdue_receivables / total_receivables * 100.0) if total_receivables > 0 else 0.0, 1)

    portfolio = {
        "highly_reliable": sum(1 for b in buyers if b.get("reliability_tier") == "Highly reliable"),
        "reliable": sum(1 for b in buyers if b.get("reliability_tier") == "Reliable"),
        "moderate_reliability": sum(1 for b in buyers if b.get("reliability_tier") == "Moderate reliability"),
        "needs_attention": sum(1 for b in buyers if b.get("reliability_tier") == "Needs attention"),
        "high_risk": sum(1 for b in buyers if b.get("reliability_tier") == "High payment risk"),
        "insufficient_history": sum(1 for b in buyers if b.get("reliability_tier") == "Insufficient history"),
    }

    urgent_actions = [
        UrgentAction(
            id="act_01",
            type="PAYMENT_OVERDUE",
            buyer_id="buyer_05",
            buyer_name="Global Distributors",
            invoice_id="inv_005",
            amount_paise=35000000,
            days_overdue=45,
            recommended_action="Send Formal Demand Notice (MSMED reference)",
        ),
        UrgentAction(
            id="act_02",
            type="COMMITMENT_BROKEN",
            buyer_id="buyer_04",
            buyer_name="Metro Suppliers",
            invoice_id="inv_004",
            amount_paise=23000000,
            days_overdue=18,
            recommended_action="Follow up on broken payment commitment from Oct 25",
        ),
    ]

    return DashboardSummaryResponse(
        business_name=current_business.get("name", "Demo Business"),
        total_receivables_paise=total_receivables or 87500000,
        overdue_receivables_paise=overdue_receivables or 38000000,
        overdue_percentage=overdue_pct or 43.4,
        average_collection_days=37.5,
        at_risk_capital_paise=35000000,
        buyer_count=len(buyers),
        portfolio_breakdown=PortfolioBreakdown(**portfolio),
        urgent_actions=urgent_actions,
    )
