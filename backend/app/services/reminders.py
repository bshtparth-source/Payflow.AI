# FEATURE: F3 Reminder drafting
# STATUS: STUB (returns mock data)
# OWNER: <unassigned>
# CONTRACT: docs/API_CONTRACT.md#7-reminder-drafting-engine
# TODO: replace mock with real logic; DO NOT change the response schema

"""
Intelligent collection reminder drafting service.
Generates tone-calibrated, context-aware payment reminders for WhatsApp, Email, and SMS.
"""

from typing import Dict, Any, List
import uuid
from app.data.mock_loader import get_mock_data


def draft_reminder(
    invoice_id: str,
    buyer_id: str,
    tone: str = "FIRM",
    channel: str = "WHATSAPP",
) -> Dict[str, Any]:
    """
    Drafts an automated collection reminder calibrated by overdue severity and tone.

    Inputs:
        - invoice_id: str
        - buyer_id: str
        - tone: str ('GENTLE', 'FIRM', 'FORMAL_DEMAND', 'LEGAL_NOTICE')
        - channel: str ('WHATSAPP', 'EMAIL', 'SMS')

    Outputs:
        - Dict conforming to ReminderDraftResponse schema:
            reminder_id, channel, tone, subject, body, recipient

    Tone Rules:
        - GENTLE: Courtesy pre-due date reminder.
        - FIRM: Professional follow-up for 1-15 days overdue.
        - FORMAL_DEMAND: Escalation for 16-45 days overdue referencing purchase terms.
        - LEGAL_NOTICE: 45+ days overdue, cites MSMED Act Section 15 & 16 compound interest.
    """
    mock = get_mock_data()
    buyer = next((b for b in mock.get("buyers", []) if b["id"] == buyer_id), None)
    buyer_name = buyer["name"] if buyer else "Valued Buyer"
    recipient = (buyer.get("phone") if channel == "WHATSAPP" else buyer.get("email")) or "+91 98000 00000"

    if tone == "LEGAL_NOTICE":
        subject = f"Statutory Demand Notice under MSMED Act Section 15 - Invoice {invoice_id}"
        body = (
            f"Formal Notice: Payment for invoice {invoice_id} billed to {buyer_name} is overdue beyond "
            "statutory limits. In accordance with Section 15 & 16 of the MSMED Act, 2006, interest is "
            "compounded with monthly rests at three times the RBI bank rate. Immediate clearance requested."
        )
    elif tone == "GENTLE":
        subject = f"Courtesy Payment Reminder: Invoice {invoice_id}"
        body = (
            f"Dear Team at {buyer_name}, this is a gentle courtesy reminder that invoice {invoice_id} "
            "will be maturing shortly. Thank you for your continued partnership."
        )
    else:  # FIRM / FORMAL_DEMAND
        subject = f"Urgent: Payment Follow-up for Invoice {invoice_id}"
        body = (
            f"Dear Accounts Team at {buyer_name}, invoice {invoice_id} is overdue. "
            "We kindly request an immediate update on the RTGS clearance date to avoid delivery holds "
            "on ongoing orders."
        )

    return {
        "reminder_id": f"rem_{uuid.uuid4().hex[:6]}",
        "channel": channel,
        "tone": tone,
        "subject": subject,
        "body": body,
        "recipient": recipient,
    }


def list_reminders() -> List[Dict[str, Any]]:
    """
    Retrieves sent and drafted reminder records.
    """
    mock = get_mock_data()
    return mock.get("reminders", [])
