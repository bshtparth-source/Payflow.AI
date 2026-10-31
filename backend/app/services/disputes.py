# FEATURE: F4 Dispute document organiser
# STATUS: STUB (returns mock data)
# OWNER: <unassigned>
# CONTRACT: docs/API_CONTRACT.md#8-disputes--dossier-pack
# TODO: replace mock with real logic; DO NOT change the response schema

"""
Dispute tracking and evidentiary dossier pack generation service.
Isolates disputed invoices from scoring and compiles documentary proof (PO, challan, invoices).
"""

from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import uuid
from app.data.mock_loader import get_mock_data


def list_disputes() -> List[Dict[str, Any]]:
    """
    Returns list of open and active disputes.
    """
    mock = get_mock_data()
    return mock.get("disputes", [])


def create_dispute(
    invoice_id: str,
    buyer_id: str,
    reason: str,
    disputed_amount_paise: int,
    notes: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Opens a dispute for an invoice, marking it as excluded from reliability score.
    """
    return {
        "id": f"disp_{uuid.uuid4().hex[:6]}",
        "invoice_id": invoice_id,
        "status": "OPEN",
        "message": f"Dispute logged. Invoice {invoice_id} is now excluded from Buyer Reliability Score calculations.",
    }


def patch_dispute(
    dispute_id: str,
    status: str,
    resolution_notes: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Updates dispute status (e.g., RESOLVED or ESCALATED).
    """
    return {
        "id": dispute_id,
        "status": status,
        "resolved_at": datetime.now(timezone.utc).isoformat() if status == "RESOLVED" else None,
    }


def generate_dispute_pack(dispute_id: str) -> Dict[str, Any]:
    """
    Generates a structured evidentiary pack dossier containing timeline, POs, and challans.
    """
    return {
        "dispute_id": dispute_id,
        "dossier_title": f"Dispute Evidence Dossier - {dispute_id}",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "summary": {
            "invoice_number": "INV-2026-077",
            "buyer_name": "Metro Suppliers",
            "disputed_amount_paise": 3000000,
            "total_invoice_amount_paise": 23000000,
        },
        "documents": [
            {
                "id": "doc_101",
                "type": "PURCHASE_ORDER",
                "file_name": "PO-Metro-441.pdf",
                "url": "https://storage.payflow.local/docs/PO-Metro-441.pdf",
            },
            {
                "id": "doc_102",
                "type": "DELIVERY_CHALLAN",
                "file_name": "DC-Signed-8871.pdf",
                "url": "https://storage.payflow.local/docs/DC-Signed-8871.pdf",
            },
        ],
        "timeline": [
            {"date": "2026-09-15", "event": "Purchase Order PO-Metro-441 received"},
            {"date": "2026-09-20", "event": "Goods dispatched with Delivery Challan DC-Signed-8871"},
            {"date": "2026-09-21", "event": "Tax Invoice INV-2026-077 issued"},
            {"date": "2026-10-20", "event": "Rate discrepancy dispute opened by buyer"},
        ],
    }
