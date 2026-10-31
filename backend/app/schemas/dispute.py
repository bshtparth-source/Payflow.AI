from pydantic import BaseModel
from typing import List, Optional


class DisputeListItem(BaseModel):
    id: str
    invoice_id: str
    invoice_number: str
    buyer_id: str
    buyer_name: str
    reason: str
    disputed_amount_paise: int
    status: str
    notes: Optional[str] = None
    opened_at: str
    documents_count: int = 0


class DisputeCreateRequest(BaseModel):
    invoice_id: str
    buyer_id: str
    reason: str
    disputed_amount_paise: int
    notes: Optional[str] = None


class DisputeCreateResponse(BaseModel):
    id: str
    invoice_id: str
    status: str = "OPEN"
    message: str


class DisputePatchRequest(BaseModel):
    status: str
    resolution_notes: Optional[str] = None


class DisputePatchResponse(BaseModel):
    id: str
    status: str
    resolved_at: Optional[str] = None


class DisputeDocItem(BaseModel):
    id: str
    type: str
    file_name: str
    url: str


class DisputeTimelineItem(BaseModel):
    date: str
    event: str


class DisputeSummary(BaseModel):
    invoice_number: str
    buyer_name: str
    disputed_amount_paise: int
    total_invoice_amount_paise: int


class DisputePackResponse(BaseModel):
    dispute_id: str
    dossier_title: str
    generated_at: str
    summary: DisputeSummary
    documents: List[DisputeDocItem]
    timeline: List[DisputeTimelineItem]
