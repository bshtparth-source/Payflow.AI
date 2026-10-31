export interface Business {
  id: string;
  name: string;
  legal_name: string;
  gstin: string;
  pan: string;
  msme_reg_no: string;
  city: string;
  state: string;
  currency: string;
}

export interface SubScores {
  on_time: number;
  delay: number;
  consistency: number;
  commitments: number;
  overdue_history: number;
}

export interface BuyerScore {
  buyer_id: string;
  buyer_name: string;
  score: number | null;
  tier: string;
  calculated_at: string;
  transactions_count: number;
  sub_scores: SubScores;
  weights: Record<string, number>;
  disclaimer: string;
}

export interface Buyer {
  id: string;
  name: string;
  legal_name: string;
  gstin: string;
  city: string;
  state: string;
  agreed_payment_terms_days: number;
  total_invoiced_paise: number;
  total_paid_paise: number;
  outstanding_paise: number;
  overdue_paise: number;
  avg_payment_delay_days: number;
  invoices_count: number;
  reliability_score?: number | null;
  reliability_tier?: string;
  disputed_count?: number;
}

export interface Invoice {
  id: string;
  buyer_id: string;
  buyer_name: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  amount_paise: number;
  paid_amount_paise: number;
  status: 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'DISPUTED';
  payment_terms_days: number;
  days_overdue: number;
  notes?: string;
}

export interface DashboardSummary {
  business: Business;
  metrics: {
    total_buyers: number;
    total_invoices: number;
    total_outstanding_paise: number;
    total_overdue_paise: number;
    invoices_at_risk_count: number;
    overdue_percentage: number;
  };
  buyers: Buyer[];
  recent_invoices: Invoice[];
  risk_distribution: {
    highly_reliable: number;
    reliable: number;
    moderate: number;
    needs_attention: number;
    high_risk: number;
    insufficient_history: number;
  };
}

export interface RiskBucket {
  tier: string;
  buyer_count: number;
  exposure_paise: number;
  avg_delay_days: number;
  buyers: Array<{
    buyer_id: string;
    buyer_name: string;
    exposure_paise: number;
    score: number | null;
    avg_delay_days: number;
    overdue_paise: number;
  }>;
}

export interface RiskRadarResponse {
  calculated_at: string;
  total_exposure_paise: number;
  high_risk_exposure_paise: number;
  buckets: RiskBucket[];
  shortfall_alerts: Array<{
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    buyer_name: string;
    message: string;
    recommended_action: string;
  }>;
}

export interface CashflowForecastBucket {
  period_label: string; // e.g. "Next 30 Days"
  projected_inflow_paise: number;
  scheduled_outflow_paise: number;
  net_surplus_deficit_paise: number;
  shortfall_risk: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface CashflowForecastResponse {
  forecast_date: string;
  projection_periods: CashflowForecastBucket[];
  summary: {
    total_inflow_30d_paise: number;
    total_inflow_60d_paise: number;
    total_inflow_90d_paise: number;
    estimated_working_capital_gap_paise: number;
  };
  disclaimer: string;
}

export interface Reminder {
  id: string;
  invoice_id: string;
  buyer_id: string;
  buyer_name: string;
  recipient_name: string;
  recipient_email?: string;
  recipient_phone?: string;
  channel: 'WHATSAPP' | 'EMAIL' | 'SMS';
  tone: 'GENTLE' | 'FIRM' | 'URGENT' | 'LEGAL_NOTICE';
  status: 'DRAFT' | 'SENT' | 'FAILED';
  subject?: string;
  message_body: string;
  scheduled_date?: string;
  created_at: string;
}

export interface Dispute {
  id: string;
  invoice_id: string;
  invoice_number: string;
  buyer_id: string;
  buyer_name: string;
  dispute_category: string;
  status: 'UNDER_REVIEW' | 'DOCUMENTATION_GATHERED' | 'SAMADHAAN_FILED' | 'RESOLVED';
  amount_disputed_paise: number;
  reason: string;
  created_at: string;
  documents_count: number;
  dossier_ready: boolean;
}
