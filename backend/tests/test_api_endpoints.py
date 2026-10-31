import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["business"] == "Kaveri Industrial Supplies"


def test_dashboard_summary():
    response = client.get("/api/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_receivables_paise" in data
    assert "portfolio_breakdown" in data
    assert len(data["urgent_actions"]) > 0


def test_buyers_list_and_details():
    response = client.get("/api/buyers")
    assert response.status_code == 200
    buyers = response.json()
    assert len(buyers) == 6
    buyer_names = [b["name"] for b in buyers]
    assert "ABC Industries" in buyer_names
    assert "Nova Packaging" in buyer_names

    # Check buyer detail
    b1_res = client.get("/api/buyers/buyer_01")
    assert b1_res.status_code == 200
    assert b1_res.json()["name"] == "ABC Industries"

    # Check buyer score
    score_res = client.get("/api/buyers/buyer_01/score")
    assert score_res.status_code == 200
    score_data = score_res.json()
    assert score_data["score"] == 94.0
    assert score_data["tier"] == "Highly reliable"
    assert "transactions_count" in score_data

    # Check Nova Packaging (insufficient history)
    nova_score = client.get("/api/buyers/buyer_06/score").json()
    assert nova_score["score"] is None
    assert nova_score["tier"] == "Insufficient history"


def test_challenge_record():
    payload = {
        "invoice_id": "inv_004",
        "reason": "Payment clearance was delayed by bank holiday",
        "proposed_correction": "Mark settled date as 2026-10-20",
    }
    response = client.post("/api/buyers/buyer_04/records/challenge", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "PENDING"
    assert "challenge_id" in data


def test_invoices_endpoints():
    # List invoices
    res = client.get("/api/invoices")
    assert res.status_code == 200
    invoices = res.json()
    assert len(invoices) >= 6

    # Create invoice
    new_inv = {
        "buyer_id": "buyer_01",
        "invoice_number": "INV-TEST-999",
        "amount_paise": 5000000,
        "issue_date": "2026-10-31",
        "payment_terms_days": 30,
    }
    create_res = client.post("/api/invoices", json=new_inv)
    assert create_res.status_code == 201
    assert create_res.json()["status"] == "UNPAID"

    # Patch invoice
    patch_res = client.patch(f"/api/invoices/{invoices[0]['id']}", json={"status": "OVERDUE"})
    assert patch_res.status_code == 200

    # Invoice upload OCR stub
    upload_res = client.post("/api/invoices/upload", json={"file_name": "test.pdf"})
    assert upload_res.status_code == 200
    assert "extracted" in upload_res.json()

    # Invoice payment
    pay_res = client.post(
        f"/api/invoices/{invoices[0]['id']}/payments",
        json={"amount_paise": 5000000, "paid_date": "2026-10-31", "payment_mode": "RTGS"},
    )
    assert pay_res.status_code == 201
    assert pay_res.json()["new_invoice_status"] == "PAID"


def test_risk_radar_endpoint():
    response = client.get("/api/risk-radar")
    assert response.status_code == 200
    data = response.json()
    assert "ESTIMATES" in data["disclaimer"]
    assert "aging_buckets" in data
    assert len(data["aging_buckets"]) == 5


def test_cashflow_endpoint():
    response = client.get("/api/cashflow/forecast?period_days=60")
    assert response.status_code == 200
    data = response.json()
    assert "ESTIMATES" in data["disclaimer"]
    assert len(data["forecast_series"]) > 0


def test_reminders_endpoints():
    # Draft reminder
    draft_res = client.post(
        "/api/reminders/draft",
        json={"invoice_id": "inv_004", "buyer_id": "buyer_04", "tone": "FIRM", "channel": "WHATSAPP"},
    )
    assert draft_res.status_code == 200
    assert "reminder_id" in draft_res.json()

    # List reminders
    list_res = client.get("/api/reminders")
    assert list_res.status_code == 200
    assert len(list_res.json()) > 0


def test_disputes_endpoints():
    # List disputes
    res = client.get("/api/disputes")
    assert res.status_code == 200
    disputes = res.json()
    assert len(disputes) > 0

    # Create dispute
    create_res = client.post(
        "/api/disputes",
        json={
            "invoice_id": "inv_003",
            "buyer_id": "buyer_03",
            "reason": "DAMAGED_GOODS",
            "disputed_amount_paise": 2000000,
        },
    )
    assert create_res.status_code == 201

    # Get dispute pack
    pack_res = client.get(f"/api/disputes/{disputes[0]['id']}/pack")
    assert pack_res.status_code == 200
    assert "documents" in pack_res.json()
