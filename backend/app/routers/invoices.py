from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Dict, Any, List, Optional
from app.core.deps import get_current_business
from app.schemas.invoice import (
    InvoiceListItem,
    InvoiceCreateRequest,
    InvoiceCreateResponse,
    InvoicePatchRequest,
    InvoicePatchResponse,
    InvoiceUploadRequest,
    InvoiceUploadResponse,
    PaymentRecordRequest,
    PaymentRecordResponse,
)
from app.services import invoices as invoice_service
from app.services import extraction as extraction_service

router = APIRouter(prefix="/api/invoices", tags=["Invoices"])


@router.get("", response_model=List[InvoiceListItem])
def list_invoices(
    buyer_id: Optional[str] = Query(None, description="Filter by buyer ID"),
    status: Optional[str] = Query(None, description="Filter by status (PAID, UNPAID, OVERDUE, DISPUTED)"),
    current_business: Dict[str, Any] = Depends(get_current_business),
) -> List[InvoiceListItem]:
    """
    Returns invoices with optional buyer and status filtering.
    """
    results = invoice_service.list_invoices(buyer_id=buyer_id, status=status)
    return [InvoiceListItem(**inv) for inv in results]


@router.post("", response_model=InvoiceCreateResponse, status_code=status.HTTP_201_CREATED)
def create_invoice(
    payload: InvoiceCreateRequest,
    current_business: Dict[str, Any] = Depends(get_current_business),
) -> InvoiceCreateResponse:
    """
    Registers a new invoice under agreed terms.
    """
    res = invoice_service.create_invoice(
        buyer_id=payload.buyer_id,
        invoice_number=payload.invoice_number,
        amount_paise=payload.amount_paise,
        issue_date=payload.issue_date,
        payment_terms_days=payload.payment_terms_days,
        items_summary=payload.items_summary,
    )
    return InvoiceCreateResponse(**res)


@router.patch("/{id}", response_model=InvoicePatchResponse)
def patch_invoice(
    id: str,
    payload: InvoicePatchRequest,
    current_business: Dict[str, Any] = Depends(get_current_business),
) -> InvoicePatchResponse:
    """
    Updates invoice status or administrative notes.
    """
    res = invoice_service.patch_invoice(invoice_id=id, status=payload.status, notes=payload.notes)
    return InvoicePatchResponse(**res)


@router.post("/upload", response_model=InvoiceUploadResponse)
def upload_invoice(
    payload: InvoiceUploadRequest,
    current_business: Dict[str, Any] = Depends(get_current_business),
) -> InvoiceUploadResponse:
    """
    AI Invoice & PO OCR extraction endpoint.
    Parses terms, invoice number, due date, amounts, and items.
    """
    res = extraction_service.extract_invoice_from_document(
        file_name=payload.file_name,
        file_type=payload.file_type,
        content_base64=payload.content_base64,
    )
    return InvoiceUploadResponse(**res)


@router.post("/{id}/payments", response_model=PaymentRecordResponse, status_code=status.HTTP_201_CREATED)
def record_invoice_payment(
    id: str,
    payload: PaymentRecordRequest,
    current_business: Dict[str, Any] = Depends(get_current_business),
) -> PaymentRecordResponse:
    """
    Records incoming payment transaction and calculates actual delay relative to due date.
    """
    res = invoice_service.record_payment(
        invoice_id=id,
        amount_paise=payload.amount_paise,
        paid_date=payload.paid_date,
        payment_mode=payload.payment_mode,
        reference_number=payload.reference_number,
    )
    return PaymentRecordResponse(**res)
