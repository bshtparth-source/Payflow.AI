from pydantic import BaseModel
from typing import Optional


class ReminderDraftRequest(BaseModel):
    invoice_id: str
    buyer_id: str
    tone: str = "FIRM"  # GENTLE, FIRM, FORMAL_DEMAND, LEGAL_NOTICE
    channel: str = "WHATSAPP"  # WHATSAPP, EMAIL, SMS


class ReminderDraftResponse(BaseModel):
    reminder_id: str
    channel: str
    tone: str
    subject: Optional[str] = None
    body: str
    recipient: str


class ReminderListItem(BaseModel):
    id: str
    invoice_id: str
    buyer_name: str
    channel: str
    tone: str
    sent_at: Optional[str] = None
    status: str
    subject: Optional[str] = None
    body: Optional[str] = None
