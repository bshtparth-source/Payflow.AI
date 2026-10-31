from pydantic import BaseModel, Field
from typing import Optional, Dict


class BuyerListItem(BaseModel):
    id: str
    name: str
    gstin: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    agreed_terms_days: int
    reliability_score: Optional[float] = None
    reliability_tier: str
    outstanding_exposure_paise: int
    average_delay_days: float
    transactions_count: int
    active_disputes_count: int = 0


class BuyerDetailResponse(BaseModel):
    id: str
    name: str
    gstin: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    agreed_terms_days: int
    reliability_score: Optional[float] = None
    reliability_tier: str
    outstanding_exposure_paise: int
    average_delay_days: float
    transactions_count: int
    on_time_percentage: float
    broken_commitments_count: int
    total_billed_paise: int
    total_collected_paise: int
    created_at: str


class BuyerSubScores(BaseModel):
    on_time: Optional[float] = None
    delay: Optional[float] = None
    consistency: Optional[float] = None
    commitments: Optional[float] = None
    overdue_history: Optional[float] = None


class BuyerWeights(BaseModel):
    on_time: float
    delay: float
    consistency: float
    commitments: float
    overdue_history: float


class BuyerScoreResponse(BaseModel):
    buyer_id: str
    buyer_name: str
    score: Optional[float] = None
    tier: str
    calculated_at: str
    transactions_count: int
    sub_scores: BuyerSubScores
    weights: BuyerWeights
    disclaimer: str = "Scores are private estimates from your own invoice history, not a credit rating."


class RecordChallengeRequest(BaseModel):
    invoice_id: Optional[str] = None
    payment_id: Optional[str] = None
    reason: str
    proposed_correction: str


class RecordChallengeResponse(BaseModel):
    challenge_id: str
    buyer_id: str
    status: str = "PENDING"
    message: str
