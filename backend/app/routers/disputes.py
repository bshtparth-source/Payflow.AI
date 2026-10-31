from fastapi import APIRouter, Depends, status
from typing import Dict, Any, List
from app.core.deps import get_current_business
from app.schemas.dispute import (
    DisputeListItem,
    DisputeCreateRequest,
    DisputeCreateResponse,
    DisputePatchRequest,
    DisputePatchResponse,
    DisputePackResponse,
)
from app.services import disputes as dispute_service

router = APIRouter(prefix="/api/disputes", tags=["Disputes"])


@router.get("", response_model=List[DisputeListItem])
def list_disputes(
    current_business: Dict[str, Any] = Depends(get_current_business),
) -> List[DisputeListItem]:
    """
    Returns list of active and resolved invoice disputes.
    """
    results = dispute_service.list_disputes()
    return [DisputeListItem(**d) for d in results]


@router.post("", response_model=DisputeCreateResponse, status_code=status.HTTP_201_CREATED)
def create_dispute(
    payload: DisputeCreateRequest,
    current_business: Dict[str, Any] = Depends(get_current_business),
) -> DisputeCreateResponse:
    """
    Opens an invoice dispute, excluding it from Buyer Reliability Score calculations.
    """
    res = dispute_service.create_dispute(
        invoice_id=payload.invoice_id,
        buyer_id=payload.buyer_id,
        reason=payload.reason,
        disputed_amount_paise=payload.disputed_amount_paise,
        notes=payload.notes,
    )
    return DisputeCreateResponse(**res)


@router.patch("/{id}", response_model=DisputePatchResponse)
def patch_dispute(
    id: str,
    payload: DisputePatchRequest,
    current_business: Dict[str, Any] = Depends(get_current_business),
) -> DisputePatchResponse:
    """
    Updates dispute status (e.g., RESOLVED or ESCALATED).
    """
    res = dispute_service.patch_dispute(
        dispute_id=id,
        status=payload.status,
        resolution_notes=payload.resolution_notes,
    )
    return DisputePatchResponse(**res)


@router.get("/{id}/pack", response_model=DisputePackResponse)
def get_dispute_pack(
    id: str,
    current_business: Dict[str, Any] = Depends(get_current_business),
) -> DisputePackResponse:
    """
    Generates a structured dispute evidence dossier containing documents and chronological audit trail.
    """
    res = dispute_service.generate_dispute_pack(dispute_id=id)
    return DisputePackResponse(**res)
