import pytest
from app.services import (
    extraction as extraction_service,
    invoices as invoice_service,
    reminders as reminder_service,
    disputes as dispute_service,
    cashflow as cashflow_service,
    risk_radar as risk_radar_service,
)


@pytest.mark.skip(reason="F1 Invoice Extraction (AI) is a stub. Turn on when implementing real OCR/LLM logic.")
def test_f1_invoice_extraction_service():
    """Partner test for F1: Real AI extraction from invoice PDF/image."""
    result = extraction_service.extract_invoice_from_document(
        file_name="invoice_test.pdf",
        file_type="application/pdf",
    )
    assert result["confidence"] > 0.90
    assert "invoice_number" in result["extracted"]
    assert result["extracted"]["amount_paise"] > 0


@pytest.mark.skip(reason="F2 Invoice and Overdue Tracking is a stub. Turn on when implementing real DB tracking.")
def test_f2_invoice_tracking_service():
    """Partner test for F2: Real DB invoice lifecycle & overdue calculations."""
    invoices = invoice_service.list_invoices()
    assert len(invoices) > 0
    created = invoice_service.create_invoice(
        buyer_id="buyer_01",
        invoice_number="INV-TEST-001",
        amount_paise=5000000,
        issue_date="2026-10-01",
    )
    assert created["status"] == "UNPAID"


@pytest.mark.skip(reason="F3 Reminder Drafting is a stub. Turn on when implementing real LLM drafting.")
def test_f3_reminder_drafting_service():
    """Partner test for F3: Tone-calibrated reminder drafting."""
    draft = reminder_service.draft_reminder(
        invoice_id="inv_005",
        buyer_id="buyer_05",
        tone="LEGAL_NOTICE",
        channel="EMAIL",
    )
    assert "MSMED" in draft["body"]
    assert draft["tone"] == "LEGAL_NOTICE"


@pytest.mark.skip(reason="F4 Dispute Document Organiser is a stub. Turn on when implementing real dossier builder.")
def test_f4_dispute_organiser_service():
    """Partner test for F4: Dispute pack dossier generation."""
    pack = dispute_service.generate_dispute_pack(dispute_id="disp_01")
    assert "documents" in pack
    assert len(pack["timeline"]) >= 3


@pytest.mark.skip(reason="F5 Cash-Flow Forecast is a stub. Turn on when implementing predictive model.")
def test_f5_cashflow_forecast_service():
    """Partner test for F5: Predictive cash-flow forecasting."""
    forecast = cashflow_service.get_cashflow_forecast(period_days=60)
    assert forecast["projected_period_days"] == 60
    assert len(forecast["forecast_series"]) > 0
    assert "ESTIMATES" in forecast["disclaimer"]


@pytest.mark.skip(reason="F6 Payment Risk Radar is a stub. Turn on when implementing risk matrix logic.")
def test_f6_payment_risk_radar_service():
    """Partner test for F6: Payment Risk Radar exposure analysis."""
    radar = risk_radar_service.get_risk_radar_analysis()
    assert len(radar["aging_buckets"]) == 5
    assert len(radar["radar_items"]) > 0
    assert "ESTIMATES" in radar["disclaimer"]
