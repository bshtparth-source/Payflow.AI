# FEATURE: F7 Buyer Reliability Score integration with DB
# STATUS: IMPLEMENTED (Baseline pure function)
# OWNER: Payflow Core Team
# CONTRACT: docs/API_CONTRACT.md#3-buyers--reliability-scoring
# TODO: Connect baseline pure function to live database models; DO NOT change the response schema

"""
Baseline pure function implementation for calculating the Buyer Reliability Score.
All calculations are relative to agreed payment terms and invariant of invoice amounts.
"""

from datetime import datetime, timezone
import statistics
from typing import Dict, Any, List, Optional


def get_tier_label(score: Optional[float]) -> str:
    """
    Classifies a 0-100 score into standardized reliability tiers.
    """
    if score is None:
        return "Insufficient history"
    if score >= 90.0:
        return "Highly reliable"
    if score >= 75.0:
        return "Reliable"
    if score >= 60.0:
        return "Moderate reliability"
    if score >= 40.0:
        return "Needs attention"
    return "High payment risk"


def calculate_buyer_reliability_score(
    settled_invoices: List[Dict[str, Any]],
    active_invoices: Optional[List[Dict[str, Any]]] = None,
    commitments: Optional[List[Dict[str, Any]]] = None,
    buyer_id: str = "unknown",
    buyer_name: str = "Unknown Buyer",
) -> Dict[str, Any]:
    """
    Calculates the 0-100 Buyer Reliability Score as a pure mathematical function.

    Inputs:
        - settled_invoices: List of dicts representing paid invoices:
            - delay_days: int (paid_date - due_date; <= 0 is on-time, > 0 is late)
            - is_disputed: bool (disputed invoices are strictly excluded)
        - active_invoices: List of dicts representing unpaid/current invoices:
            - is_overdue: bool
            - is_disputed: bool
        - commitments: Optional list of payment commitments:
            - kept: Optional[bool] (True if kept, False if broken)
        - buyer_id: str
        - buyer_name: str

    Outputs:
        - Dict adhering to BuyerScoreResponse schema:
            buyer_id, buyer_name, score, tier, calculated_at, transactions_count,
            sub_scores, weights, disclaimer

    Edge Cases Handled:
        - Disputed invoices excluded from all calculations.
        - Fewer than 3 settled invoices returns score=None and tier="Insufficient history".
        - Absence of commitments dynamically redistributes weight to the other 4 components.
        - Negative delays (early payments) capped at 0 delay penalty.
        - Standard deviation of single invoice or zero variance handled gracefully.
    """
    calculated_at = datetime.now(timezone.utc).isoformat()

    # Rule: Disputed invoices are excluded and shown as 'under review'
    valid_settled = [
        inv for inv in settled_invoices if not inv.get("is_disputed", False)
    ]
    transactions_count = len(valid_settled)

    # Rule: Fewer than 3 settled invoices -> label "Insufficient history", no numeric score, never "risky"
    if transactions_count < 3:
        return {
            "buyer_id": buyer_id,
            "buyer_name": buyer_name,
            "score": None,
            "tier": "Insufficient history",
            "calculated_at": calculated_at,
            "transactions_count": transactions_count,
            "sub_scores": {
                "on_time": None,
                "delay": None,
                "consistency": None,
                "commitments": None,
                "overdue_history": None,
            },
            "weights": {
                "on_time": 0.30,
                "delay": 0.25,
                "consistency": 0.15,
                "commitments": 0.15,
                "overdue_history": 0.15,
            },
            "disclaimer": "Scores are private estimates from your own invoice history, not a credit rating.",
        }

    # 1. On-time payment sub-score (30% base weight): % of settled invoices paid on or before due date
    on_time_count = sum(1 for inv in valid_settled if inv.get("delay_days", 0) <= 0)
    sub_on_time = round((on_time_count / transactions_count) * 100.0, 1)

    # 2. Average payment delay sub-score (25% base weight):
    # 100 at <=0 days late, falling linearly to 0 at 60+ days late
    delay_values = [max(0, inv.get("delay_days", 0)) for inv in valid_settled]
    avg_delay = sum(delay_values) / len(delay_values)
    sub_delay = round(max(0.0, min(100.0, 100.0 - (avg_delay / 60.0) * 100.0)), 1)

    # 3. Payment consistency sub-score (15% base weight):
    # Standard deviation of delay days (spread). Lower std dev = higher predictability.
    raw_delays = [inv.get("delay_days", 0) for inv in valid_settled]
    if len(raw_delays) > 1:
        std_dev = statistics.stdev(raw_delays)
    else:
        std_dev = 0.0
    sub_consistency = round(max(0.0, min(100.0, 100.0 - (std_dev * 3.0))), 1)

    # 4. Broken commitments sub-score (15% base weight):
    # 100 minus % of promised payment dates missed. If none recorded, exclude and redistribute weight.
    valid_commitments = [c for c in (commitments or []) if c.get("kept") is not None]
    has_commitments = len(valid_commitments) > 0

    if has_commitments:
        missed = sum(1 for c in valid_commitments if c.get("kept") is False)
        sub_commitments = round(max(0.0, min(100.0, 100.0 - (missed / len(valid_commitments)) * 100.0)), 1)
    else:
        sub_commitments = None

    # 5. Historical overdue behaviour sub-score (15% base weight):
    # Penalty for invoices that went 30+ days overdue and for current overdue ratio
    severe_overdue_count = sum(1 for inv in valid_settled if inv.get("delay_days", 0) >= 30)
    severe_penalty = (severe_overdue_count / transactions_count) * 50.0

    valid_active = [inv for inv in (active_invoices or []) if not inv.get("is_disputed", False)]
    if valid_active:
        active_overdue_count = sum(1 for inv in valid_active if inv.get("is_overdue", False))
        current_overdue_penalty = (active_overdue_count / len(valid_active)) * 50.0
    else:
        current_overdue_penalty = 0.0

    sub_overdue_history = round(max(0.0, min(100.0, 100.0 - severe_penalty - current_overdue_penalty)), 1)

    # Dynamic Weight Allocation
    if has_commitments:
        weights = {
            "on_time": 0.30,
            "delay": 0.25,
            "consistency": 0.15,
            "commitments": 0.15,
            "overdue_history": 0.15,
        }
        composite = (
            sub_on_time * weights["on_time"]
            + sub_delay * weights["delay"]
            + sub_consistency * weights["consistency"]
            + sub_commitments * weights["commitments"]
            + sub_overdue_history * weights["overdue_history"]
        )
    else:
        # Redistribute 15% across remaining 85%
        w_on_time = round(0.30 / 0.85, 3)
        w_delay = round(0.25 / 0.85, 3)
        w_consistency = round(0.15 / 0.85, 3)
        w_overdue = round(1.0 - (w_on_time + w_delay + w_consistency), 3)

        weights = {
            "on_time": w_on_time,
            "delay": w_delay,
            "consistency": w_consistency,
            "commitments": 0.0,
            "overdue_history": w_overdue,
        }
        composite = (
            sub_on_time * w_on_time
            + sub_delay * w_delay
            + sub_consistency * w_consistency
            + sub_overdue_history * w_overdue
        )

    final_score = round(max(0.0, min(100.0, composite)), 1)
    tier = get_tier_label(final_score)

    return {
        "buyer_id": buyer_id,
        "buyer_name": buyer_name,
        "score": final_score,
        "tier": tier,
        "calculated_at": calculated_at,
        "transactions_count": transactions_count,
        "sub_scores": {
            "on_time": sub_on_time,
            "delay": sub_delay,
            "consistency": sub_consistency,
            "commitments": sub_commitments,
            "overdue_history": sub_overdue_history,
        },
        "weights": weights,
        "disclaimer": "Scores are private estimates from your own invoice history, not a credit rating.",
    }
