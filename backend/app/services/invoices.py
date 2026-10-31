# FEATURE: F2 Invoice and overdue tracking
# STATUS: STUB (returns mock data)
# OWNER: <unassigned>
# CONTRACT: docs/API_CONTRACT.md#4-invoices--upload-extraction
# TODO: replace mock with real logic; DO NOT change the response schema

"""
Invoice lifecycle management and overdue aging tracking service.
Handles invoice creation, status transitions, dynamic overdue calculation, and payment reconciliation.
"""

from datetime import datetime, timezone, date, timedelta
from typing import Dict, Any, List, Optional
import uuid
from app.data.mock_loader import get_mock_data


def list_invoices(
    buyer_id: Optional[str] = None,
    status: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Retrieves invoices matching optional buyer or status filters.

    Inputs:
        - buyer_id: Optional[str]
        - status: Optional[str] ('PAID', 'UNPAID', 'OVERDUE', 'DISPUTED')

    Outputs:
        - List of dicts matching InvoiceListItem schema.
    """
    mock = get_mock_data()
    invoices = mock.get("invoices", [])
    if buyer_id:
        invoices = [inv for inv in invoices if inv.get("buyer_id") == buyer_id]
    if status:
        invoices = [inv for inv in invoices if inv.get("status") == status]
    return invoices


def create_invoice(
    buyer_id: str,
    invoice_number: str,
    amount_paise: int,
    issue_date: str,
    payment_terms_days: int = 30,
    items_summary: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Creates a new invoice record and sets due date.

    Inputs:
        - buyer_id: str
        - invoice_number: str
        - amount_paise: int (in paise)
        - issue_date: str (YYYY-MM-DD)
        - payment_terms_days: int (default 30)
        - items_summary: Optional[str]

    Outputs:
        - Dict conforming to InvoiceCreateResponse schema.
    """
    try:
        dt = date.fromisoformat(issue_date)
        due_date = (dt + timedelta(days=payment_terms_days)).isoformat()
    except Exception:
        due_date = issue_date

    return {
        "id": f"inv_{uuid.uuid4().hex[:6]}",
        "invoice_number": invoice_number,
        "buyer_id": buyer_id,
        "amount_paise": amount_paise,
        "due_date": due_date,
        "status": "UNPAID",
    }


def patch_invoice(
    invoice_id: str,
    status: Optional[str] = None,
    notes: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Updates invoice attributes, such as status or notes.
    """
    return {
        "id": invoice_id,
        "status": status or "OVERDUE",
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }


def record_payment(
    invoice_id: str,
    amount_paise: int,
    paid_date: str,
    payment_mode: str = "RTGS",
    reference_number: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Records an incoming payment against an invoice and calculates delay.
    """
    return {
        "payment_id": f"pay_{uuid.uuid4().hex[:6]}",
        "invoice_id": invoice_id,
        "amount_paise": amount_paise,
        "new_invoice_status": "PAID",
        "delay_days": -14,
    }
