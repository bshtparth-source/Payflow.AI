import seedData from './seed.json';
import {
  Business,
  Buyer,
  Invoice,
  Dispute,
  Reminder,
  DashboardSummary,
  RiskRadarResponse,
  CashflowForecastResponse,
  BuyerScore,
} from '@/lib/types';

/**
 * Fixed Reference Timestamp for MSME Ledger Ingestion.
 * Ensures consistent "days overdue" calculations between demo runs.
 */
export const AS_OF_DATE = '2026-10-31';

export const localBusiness: Business = seedData.business;

export const localBuyers: Buyer[] = seedData.buyers.map((b: any) => ({
  id: b.id,
  name: b.name,
  legal_name: b.legal_name || `${b.name} Pvt. Ltd.`,
  gstin: b.gstin,
  contact_person: b.contact_person,
  email: b.email,
  phone: b.phone,
  agreed_terms_days: b.agreed_terms_days,
  agreed_payment_terms_days: b.agreed_terms_days,
  reliability_score: b.reliability_score,
  reliability_tier: b.reliability_tier,
  outstanding_exposure_paise: b.outstanding_exposure_paise,
  outstanding_paise: b.outstanding_exposure_paise,
  overdue_paise:
    b.id === 'buyer_05'
      ? 35000000
      : b.id === 'buyer_04'
      ? 23000000
      : b.id === 'buyer_03'
      ? 10000000
      : 0,
  average_delay_days: b.average_delay_days,
  avg_payment_delay_days: b.average_delay_days,
  transactions_count: b.transactions_count,
  invoices_count: b.transactions_count,
  active_disputes_count: b.active_disputes_count || 0,
  disputed_count: b.active_disputes_count || 0,
  total_invoiced_paise: b.total_billed_paise || b.outstanding_exposure_paise * 3,
  total_paid_paise: b.total_collected_paise || b.outstanding_exposure_paise * 2,
}));

export const localInvoices: Invoice[] = seedData.invoices.map((inv: any) => ({
  id: inv.id,
  invoice_number: inv.invoice_number,
  buyer_id: inv.buyer_id,
  buyer_name: inv.buyer_name,
  amount_paise: inv.amount_paise,
  paid_amount_paise: inv.paid_amount_paise || 0,
  issue_date: inv.issue_date,
  payment_terms_days: inv.payment_terms_days,
  due_date: inv.due_date,
  status: inv.status,
  days_overdue: inv.overdue_days || 0,
  overdue_days: inv.overdue_days || 0,
  is_disputed: inv.is_disputed || false,
  items_summary: inv.items_summary,
}));

export const localDisputes: Dispute[] = seedData.disputes.map((d: any) => ({
  id: d.id,
  invoice_id: d.invoice_id,
  invoice_number: d.invoice_number,
  buyer_id: d.buyer_id,
  buyer_name: d.buyer_name,
  dispute_category: d.reason?.replace(/_/g, ' ') || 'Rate Discrepancy',
  status: d.status === 'OPEN' ? 'UNDER_REVIEW' : d.status,
  amount_disputed_paise: d.disputed_amount_paise,
  reason: d.notes,
  created_at: d.opened_at,
  documents_count: d.documents_count || (d.documents ? d.documents.length : 2),
  dossier_ready: true,
}));

export const localReminders: Reminder[] = seedData.reminders.map((r: any) => ({
  id: r.id,
  invoice_id: r.invoice_id,
  buyer_id: r.buyer_id,
  buyer_name: r.buyer_name,
  recipient_name: 'Accounts Manager',
  recipient_email: 'accounts@counterparty.com',
  recipient_phone: '+91 98000 12345',
  channel: r.channel,
  tone: r.tone,
  status: r.status,
  subject: r.subject,
  message_body: r.body,
  created_at: r.sent_at,
}));

export const localBuyerScores: Record<string, BuyerScore> = {
  buyer_01: {
    buyer_id: 'buyer_01',
    buyer_name: 'ABC Industries',
    score: 94.0,
    tier: 'Highly reliable',
    calculated_at: '2026-10-31T06:00:00Z',
    transactions_count: 18,
    sub_scores: { on_time: 96, delay: 98, consistency: 92, commitments: 95, overdue_history: 89 },
    weights: { on_time: 0.3, delay: 0.25, consistency: 0.15, commitments: 0.15, overdue_history: 0.15 },
    disclaimer: 'Scores are private estimates from your own invoice history, not a credit rating.',
  },
  buyer_02: {
    buyer_id: 'buyer_02',
    buyer_name: 'Sharma Traders',
    score: 78.0,
    tier: 'Reliable',
    calculated_at: '2026-10-31T06:00:00Z',
    transactions_count: 12,
    sub_scores: { on_time: 75, delay: 82, consistency: 78, commitments: 80, overdue_history: 76 },
    weights: { on_time: 0.3, delay: 0.25, consistency: 0.15, commitments: 0.15, overdue_history: 0.15 },
    disclaimer: 'Scores are private estimates from your own invoice history, not a credit rating.',
  },
  buyer_03: {
    buyer_id: 'buyer_03',
    buyer_name: 'RK Enterprises',
    score: 68.0,
    tier: 'Moderate reliability',
    calculated_at: '2026-10-31T06:00:00Z',
    transactions_count: 8,
    sub_scores: { on_time: 62, delay: 70, consistency: 65, commitments: 60, overdue_history: 72 },
    weights: { on_time: 0.3, delay: 0.25, consistency: 0.15, commitments: 0.15, overdue_history: 0.15 },
    disclaimer: 'Scores are private estimates from your own invoice history, not a credit rating.',
  },
  buyer_04: {
    buyer_id: 'buyer_04',
    buyer_name: 'Metro Suppliers',
    score: 54.0,
    tier: 'Needs attention',
    calculated_at: '2026-10-31T06:00:00Z',
    transactions_count: 15,
    sub_scores: { on_time: 40, delay: 55, consistency: 58, commitments: 50, overdue_history: 64 },
    weights: { on_time: 0.3, delay: 0.25, consistency: 0.15, commitments: 0.15, overdue_history: 0.15 },
    disclaimer: 'Scores are private estimates from your own invoice history, not a credit rating.',
  },
  buyer_05: {
    buyer_id: 'buyer_05',
    buyer_name: 'Global Distributors',
    score: 31.0,
    tier: 'High payment risk',
    calculated_at: '2026-10-31T06:00:00Z',
    transactions_count: 9,
    sub_scores: { on_time: 22, delay: 25, consistency: 40, commitments: 30, overdue_history: 42 },
    weights: { on_time: 0.3, delay: 0.25, consistency: 0.15, commitments: 0.15, overdue_history: 0.15 },
    disclaimer: 'Scores are private estimates from your own invoice history, not a credit rating.',
  },
  buyer_06: {
    buyer_id: 'buyer_06',
    buyer_name: 'Nova Packaging',
    score: null,
    tier: 'Insufficient history',
    calculated_at: '2026-10-31T06:00:00Z',
    transactions_count: 2,
    sub_scores: { on_time: 100, delay: 100, consistency: 100, commitments: 100, overdue_history: 100 },
    weights: { on_time: 0.3, delay: 0.25, consistency: 0.15, commitments: 0.15, overdue_history: 0.15 },
    disclaimer: 'Scores are private estimates from your own invoice history, not a credit rating.',
  },
};
