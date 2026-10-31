from typing import Dict, Any

# Auth is intentionally out of scope. To add auth later, change only this function.
# The entire platform operates on one seeded demo business.
# API endpoints do not accept a business_id or an auth token.

DEMO_BUSINESS: Dict[str, Any] = {
    "id": "biz_demo_001",
    "name": "Kaveri Industrial Supplies",
    "legal_name": "Kaveri Industrial Supplies & Engineering Pvt. Ltd.",
    "gstin": "27AABCU9603R1ZM",
    "pan": "AABCU9603R",
    "msme_reg_no": "UDYAM-MH-03-0019284",
    "city": "Pune",
    "state": "Maharashtra",
    "currency": "INR",
}


def get_current_business() -> Dict[str, Any]:
    """
    Returns the single seeded demo business.
    Auth is intentionally out of scope. To add auth later, change only this function.
    """
    return DEMO_BUSINESS
