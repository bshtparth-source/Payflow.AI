from pydantic import BaseModel
from typing import Optional, List


class InvoiceListItem(BaseModel):
    id: str
    invoice_number: str
    buyer_id: str
    buyer_name: str
    amount_paise: int
    paid_amount_paise: int = 0
    issue_date: str
    payment_terms_days: int
    due_date: str
    status: str
    overdue_days: int = 0
    is_disputed: bool = False
    items_summary: Optional[str] = None


class InvoiceCreateRequest(BaseModel):
    buyer_id: str
    invoice_number: str
    amount_paise: int
    issue_date: str
    payment_terms_days: int = 30
    items_summary: Optional[str] = None


class InvoiceCreateResponse(BaseModel):
    id: str
    invoice_number: str
    buyer_id: str
    amount_paise: int
    due_date: str
    status: str = "UNPAID"


class InvoicePatchRequest(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None


class InvoicePatchResponse(BaseModel):
    id: str
    status: str
    updated_at: str


class ExtractedLineItem(BaseModel):
    description: str
    quantity: int
    unit_price_paise: int


class ExtractedInvoiceData(BaseModel):
    invoice_number: str
    buyer_name: str
    buyer_gstin: Optional[str] = None
    amount_paise: int
    issue_date: str
    payment_terms_days: int
    due_date: str
    line_items: List[ExtractedLineItem] = []


class InvoiceUploadRequest(BaseModel):
    file_name: str
    file_type: str = "application/pdf"
    content_base64: Optional[str] = None


class InvoiceUploadResponse(BaseModel):
    extracted: ExtractedInvoiceData
    confidence: float
    extraction_id: str


class PaymentRecordRequest(BaseModel):
    amount_paise: int
    paid_date: str
    payment_mode: str = "RTGS"
    reference_number: Optional[str] = None


class PaymentRecordResponse(BaseModel):
    payment_id: str
    invoice_id: str
    amount_paise: int
    new_invoice_status: str
    delay_days: int
