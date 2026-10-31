from datetime import datetime, date
from typing import Optional
from sqlmodel import SQLModel, Field


class Business(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: str
    legal_name: str
    gstin: str
    pan: str
    msme_reg_no: Optional[str] = None
    city: str
    state: str
    currency: str = "INR"
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Buyer(SQLModel, table=True):
    id: str = Field(primary_key=True)
    business_id: str = Field(foreign_key="business.id")
    name: str
    gstin: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    agreed_terms_days: int = 30
    reliability_score: Optional[float] = None
    reliability_tier: str = "Insufficient history"
    outstanding_exposure_paise: int = 0
    average_delay_days: float = 0.0
    transactions_count: int = 0
    active_disputes_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class PurchaseOrder(SQLModel, table=True):
    id: str = Field(primary_key=True)
    buyer_id: str = Field(foreign_key="buyer.id")
    po_number: str
    po_date: date
    total_amount_paise: int
    file_url: Optional[str] = None
    status: str = "ISSUED"  # ISSUED, FULFILLED, CANCELLED


class Invoice(SQLModel, table=True):
    id: str = Field(primary_key=True)
    buyer_id: str = Field(foreign_key="buyer.id")
    po_id: Optional[str] = Field(default=None, foreign_key="purchaseorder.id")
    invoice_number: str
    issue_date: date
    payment_terms_days: int = 30
    due_date: date
    amount_paise: int
    paid_amount_paise: int = 0
    status: str = "UNPAID"  # PAID, UNPAID, OVERDUE, PARTIALLY_PAID, DISPUTED
    overdue_days: int = 0
    is_disputed: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Payment(SQLModel, table=True):
    id: str = Field(primary_key=True)
    invoice_id: str = Field(foreign_key="invoice.id")
    amount_paise: int
    paid_date: date
    payment_mode: str = "NEFT"  # NEFT, RTGS, UPI, CHEQUE
    reference_number: Optional[str] = None
    delay_days: int = 0


class PaymentCommitment(SQLModel, table=True):
    id: str = Field(primary_key=True)
    invoice_id: str = Field(foreign_key="invoice.id")
    buyer_id: str = Field(foreign_key="buyer.id")
    promised_date: date
    kept: Optional[bool] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Dispute(SQLModel, table=True):
    id: str = Field(primary_key=True)
    invoice_id: str = Field(foreign_key="invoice.id", unique=True)
    buyer_id: str = Field(foreign_key="buyer.id")
    reason: str  # DAMAGED_GOODS, RATE_DISCREPANCY, QUANTITY_SHORTAGE, DELIVERY_DELAY, TAX_INVOICE_ERROR, OTHER
    status: str = "OPEN"  # OPEN, IN_REVIEW, RESOLVED, ESCALATED
    disputed_amount_paise: int = 0
    notes: Optional[str] = None
    opened_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None


class DisputeDocument(SQLModel, table=True):
    id: str = Field(primary_key=True)
    dispute_id: str = Field(foreign_key="dispute.id")
    file_name: str
    file_url: str
    document_type: str  # PURCHASE_ORDER, DELIVERY_CHALLAN, LR_COPY, EMAIL_THREAD, INSPECTION_NOTE
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)


class Reminder(SQLModel, table=True):
    id: str = Field(primary_key=True)
    invoice_id: str = Field(foreign_key="invoice.id")
    buyer_id: str = Field(foreign_key="buyer.id")
    channel: str = "WHATSAPP"  # WHATSAPP, EMAIL, SMS
    tone: str = "FIRM"  # GENTLE, FIRM, FORMAL_DEMAND, LEGAL_NOTICE
    subject: Optional[str] = None
    body: str
    sent_at: Optional[datetime] = None
    status: str = "DRAFT"  # DRAFT, SENT, DELIVERED, FAILED


class RecordChallenge(SQLModel, table=True):
    id: str = Field(primary_key=True)
    buyer_id: str = Field(foreign_key="buyer.id")
    invoice_id: Optional[str] = None
    payment_id: Optional[str] = None
    reason: str
    proposed_correction: str
    status: str = "PENDING"  # PENDING, ACCEPTED, REJECTED
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ScoreSnapshot(SQLModel, table=True):
    id: str = Field(primary_key=True)
    buyer_id: str = Field(foreign_key="buyer.id")
    score: Optional[float] = None
    tier: str
    on_time_subscore: Optional[float] = None
    delay_subscore: Optional[float] = None
    consistency_subscore: Optional[float] = None
    commitments_subscore: Optional[float] = None
    overdue_history_subscore: Optional[float] = None
    transactions_count: int = 0
    snapshot_date: date = Field(default_factory=date.today)


class CashflowForecast(SQLModel, table=True):
    id: str = Field(primary_key=True)
    forecast_date: date
    projected_inflow_paise: int
    expected_delayed_paise: int
    projected_shortfall_paise: int
    confidence_score: float = 0.85
    created_at: datetime = Field(default_factory=datetime.utcnow)
