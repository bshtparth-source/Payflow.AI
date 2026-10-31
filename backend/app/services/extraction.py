# FEATURE: F1 Invoice extraction (AI)
# STATUS: STUB (returns mock data)
# OWNER: <unassigned>
# CONTRACT: docs/API_CONTRACT.md#4-invoices--upload-extraction
# TODO: replace mock with real logic; DO NOT change the response schema

"""
Invoice & Purchase Order OCR extraction service.
Extracts structured payment terms, amounts, dates, and line items from uploaded documents.
"""

from typing import Dict, Any, Optional
import uuid


def extract_invoice_from_document(
    file_name: str,
    file_type: str = "application/pdf",
    content_base64: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Parses an uploaded invoice or PO document using AI/OCR models.

    Inputs:
        - file_name: str (e.g., 'invoice_oct_2026.pdf')
        - file_type: str (e.g., 'application/pdf', 'image/png')
        - content_base64: Optional[str] base64-encoded document bytes

    Outputs:
        - Dict conforming to InvoiceUploadResponse schema:
            - extracted: Dict with invoice_number, buyer_name, buyer_gstin, amount_paise,
              issue_date, payment_terms_days, due_date, line_items
            - confidence: float (0.0 to 1.0)
            - extraction_id: str

    Edge Cases to Handle in Real Implementation:
        - Scanned handwritten or blurred invoices.
        - Multiple tax rates (CGST, SGST, IGST) vs basic item totals.
        - Missing or ambiguous credit terms (fallback to agreed buyer default).
    """
    # STUB: Returns schema-compliant mock data
    return {
        "extracted": {
            "invoice_number": "INV-2026-092",
            "buyer_name": "ABC Industries",
            "buyer_gstin": "27AAACA1234A1Z5",
            "amount_paise": 7500000,
            "issue_date": "2026-10-28",
            "payment_terms_days": 30,
            "due_date": "2026-11-27",
            "line_items": [
                {
                    "description": "High Tensile Fasteners (Grade 8.8)",
                    "quantity": 500,
                    "unit_price_paise": 15000,
                }
            ],
        },
        "confidence": 0.98,
        "extraction_id": f"ext_{uuid.uuid4().hex[:8]}",
    }
