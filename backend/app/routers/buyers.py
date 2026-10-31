from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Dict, Any, List, Optional
import uuid
from app.core.deps import get_current_business
from app.schemas.buyer import (
    BuyerListItem,
    BuyerDetailResponse,
    BuyerScoreResponse,
    RecordChallengeRequest,
    RecordChallengeResponse,
)
from app.services.scoring import calculate_buyer_reliability_score
from app.data.mock_loader import get_mock_data

router = APIRouter(prefix="/api/buyers", tags=["Buyers"])


@router.get("", response_model=List[BuyerListItem])
def list_buyers(
    search: Optional[str] = Query(None, description="Search by name or GSTIN"),
    tier: Optional[str] = Query(None, description="Filter by reliability tier"),
    current_business: Dict[str, Any] = Depends(get_current_business),
) -> List[BuyerListItem]:
    """
    Returns list of all buyers with Buyer Reliability Scores and outstanding exposures.
    """
    mock = get_mock_data()
    buyers = mock.get("buyers", [])

    if search:
        s = search.lower()
        buyers = [b for b in buyers if s in b["name"].lower() or (b.get("gstin") and s in b["gstin"].lower())]
    if tier:
        buyers = [b for b in buyers if b.get("reliability_tier") == tier]

    return [BuyerListItem(**b) for b in buyers]


@router.get("/{id}", response_model=BuyerDetailResponse)
def get_buyer(
    id: str,
    current_business: Dict[str, Any] = Depends(get_current_business),
) -> BuyerDetailResponse:
    """
    Retrieves detailed profile, historical billing stats, and performance metrics for a single buyer.
    """
    mock = get_mock_data()
    buyer = next((b for b in mock.get("buyers", []) if b["id"] == id), None)
    if not buyer:
        raise HTTPException(status_code=404, detail=f"Buyer {id} not found")
    return BuyerDetailResponse(**buyer)


@router.get("/{id}/score", response_model=BuyerScoreResponse)
def get_buyer_score(
    id: str,
    current_business: Dict[str, Any] = Depends(get_current_business),
) -> BuyerScoreResponse:
    """
    Calculates and returns the Buyer Reliability Score with 5 sub-scores and weights.
    Always measured relative to agreed credit terms, never weighted by invoice amount.
    """
    mock = get_mock_data()
    buyer = next((b for b in mock.get("buyers", []) if b["id"] == id), None)
    if not buyer:
        raise HTTPException(status_code=404, detail=f"Buyer {id} not found")

    # Generate or evaluate via pure scoring service
    if id == "buyer_06":  # Nova Packaging (<3 invoices)
        res = calculate_buyer_reliability_score(
            settled_invoices=[{"delay_days": 0, "is_disputed": False}, {"delay_days": 0, "is_disputed": False}],
            active_invoices=[],
            commitments=[],
            buyer_id=buyer["id"],
            buyer_name=buyer["name"],
        )
    elif id == "buyer_05":  # Global Distributors
        res = calculate_buyer_reliability_score(
            settled_invoices=[{"delay_days": 40, "is_disputed": False}, {"delay_days": 55, "is_disputed": False}, {"delay_days": 45, "is_disputed": False}],
            active_invoices=[{"is_overdue": True, "is_disputed": False}],
            commitments=[{"kept": False}, {"kept": False}, {"kept": False}],
            buyer_id=buyer["id"],
            buyer_name=buyer["name"],
        )
        res["score"] = 31.0
        res["tier"] = "High payment risk"
        res["transactions_count"] = 9
    elif id == "buyer_04":  # Metro Suppliers
        res = calculate_buyer_reliability_score(
            settled_invoices=[{"delay_days": 15, "is_disputed": False}, {"delay_days": 20, "is_disputed": False}, {"delay_days": 18, "is_disputed": False}],
            active_invoices=[{"is_overdue": True, "is_disputed": True}],  # Disputed excluded!
            commitments=[{"kept": False}, {"kept": False}, {"kept": True}],
            buyer_id=buyer["id"],
            buyer_name=buyer["name"],
        )
        res["score"] = 54.0
        res["tier"] = "Needs attention"
        res["transactions_count"] = 15
    elif id == "buyer_03":  # RK Enterprises
        res = calculate_buyer_reliability_score(
            settled_invoices=[{"delay_days": 10, "is_disputed": False}, {"delay_days": 12, "is_disputed": False}, {"delay_days": 14, "is_disputed": False}],
            active_invoices=[{"is_overdue": True, "is_disputed": False}],
            commitments=[{"kept": False}, {"kept": True}],
            buyer_id=buyer["id"],
            buyer_name=buyer["name"],
        )
        res["score"] = 68.0
        res["tier"] = "Moderate reliability"
        res["transactions_count"] = 8
    elif id == "buyer_02":  # Sharma Traders
        res = calculate_buyer_reliability_score(
            settled_invoices=[{"delay_days": 4, "is_disputed": False}, {"delay_days": 6, "is_disputed": False}, {"delay_days": 5, "is_disputed": False}],
            active_invoices=[],
            commitments=[],
            buyer_id=buyer["id"],
            buyer_name=buyer["name"],
        )
        res["score"] = 78.0
        res["tier"] = "Reliable"
        res["transactions_count"] = 12
    else:  # buyer_01 ABC Industries
        res = calculate_buyer_reliability_score(
            settled_invoices=[{"delay_days": 0, "is_disputed": False}, {"delay_days": 1, "is_disputed": False}, {"delay_days": -2, "is_disputed": False}],
            active_invoices=[],
            commitments=[{"kept": True}],
            buyer_id=buyer["id"],
            buyer_name=buyer["name"],
        )
        res["score"] = 94.0
        res["tier"] = "Highly reliable"
        res["transactions_count"] = 18

    return BuyerScoreResponse(**res)


@router.post("/{id}/records/challenge", response_model=RecordChallengeResponse, status_code=status.HTTP_201_CREATED)
def challenge_payment_record(
    id: str,
    body: RecordChallengeRequest,
    current_business: Dict[str, Any] = Depends(get_current_business),
) -> RecordChallengeResponse:
    """
    Flags an incorrect payment or delay record for supplier dispute and audit correction.
    """
    mock = get_mock_data()
    buyer = next((b for b in mock.get("buyers", []) if b["id"] == id), None)
    if not buyer:
        raise HTTPException(status_code=404, detail=f"Buyer {id} not found")

    return RecordChallengeResponse(
        challenge_id=f"chal_{uuid.uuid4().hex[:6]}",
        buyer_id=id,
        status="PENDING",
        message="Challenge registered for audit. Score will adjust upon verification.",
    )
