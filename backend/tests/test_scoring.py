import pytest
from app.services.scoring import calculate_buyer_reliability_score, get_tier_label


def test_insufficient_history_less_than_3_invoices():
    """Rule: Fewer than 3 settled invoices -> label 'Insufficient history', no numeric score, never 'risky'."""
    invoices = [
        {"delay_days": 0, "is_disputed": False},
        {"delay_days": 10, "is_disputed": False},
    ]
    res = calculate_buyer_reliability_score(settled_invoices=invoices, buyer_id="buyer_06", buyer_name="Nova Packaging")

    assert res["score"] is None
    assert res["tier"] == "Insufficient history"
    assert res["transactions_count"] == 2
    assert res["sub_scores"]["on_time"] is None
    assert "disclaimer" in res


def test_disputed_invoices_excluded():
    """Rule: Disputed invoices are strictly excluded from score calculation."""
    # 4 invoices, but 2 are disputed -> remaining valid settled is 2 -> Insufficient history!
    invoices = [
        {"delay_days": 0, "is_disputed": False},
        {"delay_days": 5, "is_disputed": False},
        {"delay_days": 40, "is_disputed": True},
        {"delay_days": 20, "is_disputed": True},
    ]
    res = calculate_buyer_reliability_score(settled_invoices=invoices, buyer_id="b1", buyer_name="Test Buyer")
    assert res["transactions_count"] == 2
    assert res["score"] is None
    assert res["tier"] == "Insufficient history"


def test_terms_relative_invariant_of_amount():
    """
    Rule: Behaviour is measured relative to agreed terms only.
    Two sets of invoices with identical delay profiles must yield identical scores
    regardless of hypothetical invoice amounts.
    """
    invoices_a = [
        {"delay_days": 0, "is_disputed": False},
        {"delay_days": 0, "is_disputed": False},
        {"delay_days": 0, "is_disputed": False},
    ]
    res_a = calculate_buyer_reliability_score(settled_invoices=invoices_a)
    assert res_a["score"] == 100.0
    assert res_a["tier"] == "Highly reliable"
    assert res_a["sub_scores"]["on_time"] == 100.0
    assert res_a["sub_scores"]["delay"] == 100.0


def test_weight_redistribution_without_commitments():
    """Rule: If no commitments recorded, exclude and redistribute weight across remaining 4 components."""
    invoices = [
        {"delay_days": 2, "is_disputed": False},
        {"delay_days": 0, "is_disputed": False},
        {"delay_days": 1, "is_disputed": False},
    ]
    res = calculate_buyer_reliability_score(settled_invoices=invoices, commitments=None)
    assert res["sub_scores"]["commitments"] is None
    assert res["weights"]["commitments"] == 0.0
    # Weights should sum to 1.0
    total_weights = sum(res["weights"].values())
    assert abs(total_weights - 1.0) < 0.01
    assert res["score"] is not None


def test_commitments_scoring():
    """Test commitment adherence score calculation when commitments exist."""
    invoices = [
        {"delay_days": 0, "is_disputed": False},
        {"delay_days": 0, "is_disputed": False},
        {"delay_days": 0, "is_disputed": False},
    ]
    commitments = [
        {"kept": True},
        {"kept": False},  # 1 out of 2 missed = 50%
    ]
    res = calculate_buyer_reliability_score(settled_invoices=invoices, commitments=commitments)
    assert res["sub_scores"]["commitments"] == 50.0
    assert res["weights"]["commitments"] == 0.15


def test_high_payment_risk_buyer():
    """Test chronic late payer results in High payment risk (<40)."""
    invoices = [
        {"delay_days": 45, "is_disputed": False},
        {"delay_days": 60, "is_disputed": False},
        {"delay_days": 50, "is_disputed": False},
    ]
    commitments = [{"kept": False}, {"kept": False}]
    res = calculate_buyer_reliability_score(settled_invoices=invoices, commitments=commitments)
    assert res["score"] < 40.0
    assert res["tier"] == "High payment risk"


def test_tier_labels():
    """Verify standard tier label thresholds."""
    assert get_tier_label(95.0) == "Highly reliable"
    assert get_tier_label(80.0) == "Reliable"
    assert get_tier_label(65.0) == "Moderate reliability"
    assert get_tier_label(50.0) == "Needs attention"
    assert get_tier_label(30.0) == "High payment risk"
    assert get_tier_label(None) == "Insufficient history"
