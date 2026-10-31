from fastapi import APIRouter, Depends
from typing import Dict, Any, List
from app.core.deps import get_current_business
from app.schemas.reminder import ReminderDraftRequest, ReminderDraftResponse, ReminderListItem
from app.services import reminders as reminder_service

router = APIRouter(prefix="/api/reminders", tags=["Reminders"])


@router.post("/draft", response_model=ReminderDraftResponse)
def draft_reminder(
    payload: ReminderDraftRequest,
    current_business: Dict[str, Any] = Depends(get_current_business),
) -> ReminderDraftResponse:
    """
    Generates an automated, tone-calibrated reminder message draft.
    """
    res = reminder_service.draft_reminder(
        invoice_id=payload.invoice_id,
        buyer_id=payload.buyer_id,
        tone=payload.tone,
        channel=payload.channel,
    )
    return ReminderDraftResponse(**res)


@router.get("", response_model=List[ReminderListItem])
def list_reminders(
    current_business: Dict[str, Any] = Depends(get_current_business),
) -> List[ReminderListItem]:
    """
    Retrieves history of reminder dispatches and drafts.
    """
    results = reminder_service.list_reminders()
    return [ReminderListItem(**r) for r in results]
