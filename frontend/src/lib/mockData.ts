import {
  Business,
  Buyer,
  BuyerScore,
  DashboardSummary,
  Invoice,
  RiskRadarResponse,
  CashflowForecastResponse,
  Reminder,
  Dispute,
} from './types';

export const mockBusiness: Business = {
  id: 'biz_demo_001',
  name: 'Kaveri Industrial Supplies',
  legal_name: 'Kaveri Industrial Supplies & Engineering Pvt. Ltd.',
  gstin: '27AABCU9603R1ZM',
  pan: 'AABCU9603R',
  msme_reg_no: 'UDYAM-MH-03-0019284',
  city: 'Pune',
  state: 'Maharashtra',
  currency: 'INR',
};

export const mockBuyers: Buyer[] = [
  {
    id: 'buy_001',
    name: 'ABC Industries',
    legal_name: 'ABC Industries Limited',
    gstin: '27AAACA0000A1Z',
    city: 'Pune',
    state: 'Maharashtra',
    agreed_payment_terms_days: 30,
    total_invoiced_paise: 240000000,
    total_paid_paise: 235000000,
    outstanding_paise: 5000000, // ₹50,000
    overdue_paise: 0,
    avg_payment_delay_days: 1,
    invoices_count: 24,
    reliability_score: 94,
    reliability_tier: 'Highly reliable',
    disputed_count: 0,
  },
  {
    id: 'buy_002',
    name: 'Sharma Traders',
    legal_name: 'Sharma Traders & Co.',
    gstin: '07AABCS1234D1Z',
    city: 'Delhi',
    state: 'Delhi',
    agreed_payment_terms_days: 45,
    total_invoiced_paise: 180000000,
    total_paid_paise: 168000000,
    outstanding_paise: 12000000, // ₹1,20,000
    overdue_paise: 2500000,
    avg_payment_delay_days: 5,
    invoices_count: 19,
    reliability_score: 78,
    reliability_tier: 'Reliable',
    disputed_count: 0,
  },
  {
    id: 'buy_003',
    name: 'RK Enterprises',
    legal_name: 'RK Enterprises Pvt Ltd',
    gstin: '24AABCR9876E1Z',
    city: 'Ahmedabad',
    state: 'Gujarat',
    agreed_payment_terms_days: 30,
    total_invoiced_paise: 145000000,
    total_paid_paise: 135000000,
    outstanding_paise: 10000000, // ₹1,00,000
    overdue_paise: 4000000,
    avg_payment_delay_days: 12,
    invoices_count: 14,
    reliability_score: 68,
    reliability_tier: 'Moderate reliability',
    disputed_count: 0,
  },
  {
    id: 'buy_004',
    name: 'Metro Suppliers',
    legal_name: 'Metro Suppliers Hub LLP',
    gstin: '29AABCM4567F1Z',
    city: 'Bengaluru',
    state: 'Karnataka',
    agreed_payment_terms_days: 30,
    total_invoiced_paise: 160000000,
    total_paid_paise: 137000000,
    outstanding_paise: 23000000, // ₹2,30,000
    overdue_paise: 16000000,
    avg_payment_delay_days: 18,
    invoices_count: 11,
    reliability_score: 54,
    reliability_tier: 'Needs attention',
    disputed_count: 0,
  },
  {
    id: 'buy_005',
    name: 'Global Distributors',
    legal_name: 'Global Distributors India Ltd',
    gstin: '33AABCG1122H1Z',
    city: 'Chennai',
    state: 'Tamil Nadu',
    agreed_payment_terms_days: 30,
    total_invoiced_paise: 290000000,
    total_paid_paise: 255000000,
    outstanding_paise: 35000000, // ₹3,50,000
    overdue_paise: 35000000,
    avg_payment_delay_days: 45,
    invoices_count: 8,
    reliability_score: 31,
    reliability_tier: 'High payment risk',
    disputed_count: 1,
  },
  {
    id: 'buy_006',
    name: 'Nova Packaging',
    legal_name: 'Nova Packaging Solutions',
    gstin: '27AABCN8899K1Z',
    city: 'Thane',
    state: 'Maharashtra',
    agreed_payment_terms_days: 30,
    total_invoiced_paise: 40000000,
    total_paid_paise: 40000000,
    outstanding_paise: 0,
    overdue_paise: 0,
    avg_payment_delay_days: 0,
    invoices_count: 2,
    reliability_score: null,
    reliability_tier: 'Insufficient history',
    disputed_count: 0,
  },
];

export const mockInvoices: Invoice[] = [
  {
    id: 'inv_001',
    buyer_id: 'buy_005',
    buyer_name: 'Global Distributors',
    invoice_number: 'INV-2026-089',
    issue_date: '2026-08-15',
    due_date: '2026-09-14',
    amount_paise: 22000000, // ₹2,20,000
    paid_amount_paise: 0,
    status: 'OVERDUE',
    payment_terms_days: 30,
    days_overdue: 47,
    notes: 'PO #GD-9912. Multiple phone follow-ups ignored.',
  },
  {
    id: 'inv_002',
    buyer_id: 'buy_005',
    buyer_name: 'Global Distributors',
    invoice_number: 'INV-2026-094',
    issue_date: '2026-09-01',
    due_date: '2026-10-01',
    amount_paise: 13000000, // ₹1,30,000
    paid_amount_paise: 0,
    status: 'OVERDUE',
    payment_terms_days: 30,
    days_overdue: 30,
    notes: 'Batch consignment delivery.',
  },
  {
    id: 'inv_003',
    buyer_id: 'buy_004',
    buyer_name: 'Metro Suppliers',
    invoice_number: 'INV-2026-102',
    issue_date: '2026-09-10',
    due_date: '2026-10-10',
    amount_paise: 16000000, // ₹1,60,000
    paid_amount_paise: 0,
    status: 'OVERDUE',
    payment_terms_days: 30,
    days_overdue: 21,
    notes: 'Commitment given for payment by 25th October; missed.',
  },
  {
    id: 'inv_004',
    buyer_id: 'buy_004',
    buyer_name: 'Metro Suppliers',
    invoice_number: 'INV-2026-118',
    issue_date: '2026-10-05',
    due_date: '2026-11-04',
    amount_paise: 7000000, // ₹70,000
    paid_amount_paise: 0,
    status: 'ISSUED',
    payment_terms_days: 30,
    days_overdue: 0,
  },
  {
    id: 'inv_005',
    buyer_id: 'buy_002',
    buyer_name: 'Sharma Traders',
    invoice_number: 'INV-2026-099',
    issue_date: '2026-09-05',
    due_date: '2026-10-20',
    amount_paise: 12000000, // ₹1,20,000
    paid_amount_paise: 0,
    status: 'OVERDUE',
    payment_terms_days: 45,
    days_overdue: 11,
    notes: 'Partially settled in earlier cycle.',
  },
  {
    id: 'inv_006',
    buyer_id: 'buy_003',
    buyer_name: 'RK Enterprises',
    invoice_number: 'INV-2026-105',
    issue_date: '2026-09-18',
    due_date: '2026-10-18',
    amount_paise: 10000000, // ₹1,00,000
    paid_amount_paise: 0,
    status: 'OVERDUE',
    payment_terms_days: 30,
    days_overdue: 13,
  },
  {
    id: 'inv_007',
    buyer_id: 'buy_001',
    buyer_name: 'ABC Industries',
    invoice_number: 'INV-2026-115',
    issue_date: '2026-10-02',
    due_date: '2026-11-01',
    amount_paise: 5000000, // ₹50,000
    paid_amount_paise: 0,
    status: 'ISSUED',
    payment_terms_days: 30,
    days_overdue: 0,
  },
];

export const mockBuyerScores: Record<string, BuyerScore> = {
  buy_001: {
    buyer_id: 'buy_001',
    buyer_name: 'ABC Industries',
    score: 94,
    tier: 'Highly reliable',
    calculated_at: new Date().toISOString(),
    transactions_count: 24,
    sub_scores: {
      on_time: 96,
      delay: 98,
      consistency: 92,
      commitments: 95,
      overdue_history: 89,
    },
    weights: {
      on_time: 0.3,
      delay: 0.25,
      consistency: 0.15,
      commitments: 0.15,
      overdue_history: 0.15,
    },
    disclaimer: 'Scores are private estimates from your own invoice history, not a credit rating.',
  },
  buy_005: {
    buyer_id: 'buy_005',
    buyer_name: 'Global Distributors',
    score: 31,
    tier: 'High payment risk',
    calculated_at: new Date().toISOString(),
    transactions_count: 8,
    sub_scores: {
      on_time: 25,
      delay: 20,
      consistency: 35,
      commitments: 30,
      overdue_history: 45,
    },
    weights: {
      on_time: 0.3,
      delay: 0.25,
      consistency: 0.15,
      commitments: 0.15,
      overdue_history: 0.15,
    },
    disclaimer: 'Scores are private estimates from your own invoice history, not a credit rating.',
  },
  buy_006: {
    buyer_id: 'buy_006',
    buyer_name: 'Nova Packaging',
    score: null,
    tier: 'Insufficient history',
    calculated_at: new Date().toISOString(),
    transactions_count: 2,
    sub_scores: {
      on_time: 100,
      delay: 100,
      consistency: 100,
      commitments: 100,
      overdue_history: 100,
    },
    weights: {
      on_time: 0.3,
      delay: 0.25,
      consistency: 0.15,
      commitments: 0.15,
      overdue_history: 0.15,
    },
    disclaimer: 'Scores are private estimates from your own invoice history, not a credit rating.',
  },
};

export const mockDashboardSummary: DashboardSummary = {
  business: mockBusiness,
  metrics: {
    total_buyers: 6,
    total_invoices: 64,
    total_outstanding_paise: 85000000, // ₹8,50,000 (₹8.5L)
    total_overdue_paise: 58000000, // ₹5,80,000 (₹5.8L)
    invoices_at_risk_count: 7,
    overdue_percentage: 68,
  },
  buyers: mockBuyers,
  recent_invoices: mockInvoices,
  risk_distribution: {
    highly_reliable: 1,
    reliable: 1,
    moderate: 1,
    needs_attention: 1,
    high_risk: 1,
    insufficient_history: 1,
  },
};

export const mockRiskRadar: RiskRadarResponse = {
  calculated_at: new Date().toISOString(),
  total_exposure_paise: 85000000,
  high_risk_exposure_paise: 58000000,
  buckets: [
    {
      tier: 'High payment risk',
      buyer_count: 1,
      exposure_paise: 35000000, // ₹3.5L
      avg_delay_days: 45,
      buyers: [
        {
          buyer_id: 'buy_005',
          buyer_name: 'Global Distributors',
          exposure_paise: 35000000,
          score: 31,
          avg_delay_days: 45,
          overdue_paise: 35000000,
        },
      ],
    },
    {
      tier: 'Needs attention',
      buyer_count: 1,
      exposure_paise: 23000000, // ₹2.3L
      avg_delay_days: 18,
      buyers: [
        {
          buyer_id: 'buy_004',
          buyer_name: 'Metro Suppliers',
          exposure_paise: 23000000,
          score: 54,
          avg_delay_days: 18,
          overdue_paise: 16000000,
        },
      ],
    },
    {
      tier: 'Moderate reliability',
      buyer_count: 1,
      exposure_paise: 10000000, // ₹1.0L
      avg_delay_days: 12,
      buyers: [
        {
          buyer_id: 'buy_003',
          buyer_name: 'RK Enterprises',
          exposure_paise: 10000000,
          score: 68,
          avg_delay_days: 12,
          overdue_paise: 4000000,
        },
      ],
    },
    {
      tier: 'Reliable',
      buyer_count: 1,
      exposure_paise: 12000000, // ₹1.2L
      avg_delay_days: 5,
      buyers: [
        {
          buyer_id: 'buy_002',
          buyer_name: 'Sharma Traders',
          exposure_paise: 12000000,
          score: 78,
          avg_delay_days: 5,
          overdue_paise: 2500000,
        },
      ],
    },
    {
      tier: 'Highly reliable',
      buyer_count: 1,
      exposure_paise: 5000000, // ₹50k
      avg_delay_days: 1,
      buyers: [
        {
          buyer_id: 'buy_001',
          buyer_name: 'ABC Industries',
          exposure_paise: 5000000,
          score: 94,
          avg_delay_days: 1,
          overdue_paise: 0,
        },
      ],
    },
    {
      tier: 'Insufficient history',
      buyer_count: 1,
      exposure_paise: 0,
      avg_delay_days: 0,
      buyers: [
        {
          buyer_id: 'buy_006',
          buyer_name: 'Nova Packaging',
          exposure_paise: 0,
          score: null,
          avg_delay_days: 0,
          overdue_paise: 0,
        },
      ],
    },
  ],
  shortfall_alerts: [
    {
      severity: 'HIGH',
      buyer_name: 'Global Distributors',
      message: '₹3,50,000 overdue past 45 days. High probability of delayed realization affecting mid-month payroll.',
      recommended_action: 'Issue formal demand notice with delivery receipts and schedule direct director-level review.',
    },
    {
      severity: 'MEDIUM',
      buyer_name: 'Metro Suppliers',
      message: '₹2,30,000 outstanding with payment commitment broken on 25th October.',
      recommended_action: 'Send automated WhatsApp firm reminder requesting revised NEFT/RTGS transaction reference.',
    },
  ],
};

export const mockCashflowForecast: CashflowForecastResponse = {
  forecast_date: new Date().toISOString(),
  projection_periods: [
    {
      period_label: 'Next 15 Days (1-15 Nov)',
      projected_inflow_paise: 17000000, // ₹1.7L
      scheduled_outflow_paise: 24000000, // ₹2.4L
      net_surplus_deficit_paise: -7000000, // -₹70,000 deficit
      shortfall_risk: 'HIGH',
    },
    {
      period_label: 'Mid-Term (16-30 Nov)',
      projected_inflow_paise: 38000000, // ₹3.8L
      scheduled_outflow_paise: 29000000, // ₹2.9L
      net_surplus_deficit_paise: 9000000, // +₹90,000 surplus
      shortfall_risk: 'LOW',
    },
    {
      period_label: 'Days 31–60 (Dec 2026)',
      projected_inflow_paise: 42000000, // ₹4.2L
      scheduled_outflow_paise: 35000000, // ₹3.5L
      net_surplus_deficit_paise: 7000000, // +₹70,000 surplus
      shortfall_risk: 'LOW',
    },
    {
      period_label: 'Days 61–90 (Jan 2027)',
      projected_inflow_paise: 31000000, // ₹3.1L
      scheduled_outflow_paise: 32000000, // ₹3.2L
      net_surplus_deficit_paise: -1000000, // -₹10,000
      shortfall_risk: 'MEDIUM',
    },
  ],
  summary: {
    total_inflow_30d_paise: 55000000,
    total_inflow_60d_paise: 97000000,
    total_inflow_90d_paise: 128000000,
    estimated_working_capital_gap_paise: 7000000,
  },
  disclaimer: 'Projections are behavioral estimates computed from historical realization intervals, not bank guarantees.',
};

export const mockReminders: Reminder[] = [
  {
    id: 'rem_001',
    invoice_id: 'inv_001',
    buyer_id: 'buy_005',
    buyer_name: 'Global Distributors',
    recipient_name: 'Accounts Manager',
    recipient_email: 'accounts@globaldistributors.in',
    recipient_phone: '+91 98401 23456',
    channel: 'WHATSAPP',
    tone: 'URGENT',
    status: 'DRAFT',
    subject: 'Urgent: Overdue Settlement Request for Invoice #INV-2026-089 (₹2,20,000)',
    message_body:
      'Dear Accounts Team at Global Distributors, invoice #INV-2026-089 for ₹2,20,000 was due on 14-Sep-2026 and is now 47 days overdue. Kindly share the UTR / payment confirmation by 5:00 PM today to avoid operational suspension.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'rem_002',
    invoice_id: 'inv_003',
    buyer_id: 'buy_004',
    buyer_name: 'Metro Suppliers',
    recipient_name: 'Suresh Kumar',
    recipient_email: 'suresh@metrosuppliers.com',
    recipient_phone: '+91 98801 67890',
    channel: 'EMAIL',
    tone: 'FIRM',
    status: 'DRAFT',
    subject: 'Follow-up regarding broken commitment for Invoice #INV-2026-102 (₹1,60,000)',
    message_body:
      'Dear Suresh ji, we refer to our discussion regarding Invoice #INV-2026-102 due on 10-Oct-2026. The promised RTGS transaction on 25th October has not been reflected in our account. Please release payment today.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'rem_003',
    invoice_id: 'inv_005',
    buyer_id: 'buy_002',
    buyer_name: 'Sharma Traders',
    recipient_name: 'Amit Sharma',
    recipient_email: 'amit@sharmatraders.in',
    recipient_phone: '+91 98110 54321',
    channel: 'WHATSAPP',
    tone: 'GENTLE',
    status: 'DRAFT',
    subject: 'Courtesy reminder: Invoice #INV-2026-099 due for settlement',
    message_body:
      'Namaste Amit ji, this is a courteous note that Invoice #INV-2026-099 (₹1,20,000) was due on 20-Oct-2026. Please confirm if the payment run is scheduled for this week.',
    created_at: new Date().toISOString(),
  },
];

export const mockDisputes: Dispute[] = [
  {
    id: 'disp_001',
    invoice_id: 'inv_001',
    invoice_number: 'INV-2026-089',
    buyer_id: 'buy_005',
    buyer_name: 'Global Distributors',
    dispute_category: 'Delayed Payment Refusal',
    status: 'UNDER_REVIEW',
    amount_disputed_paise: 22000000, // ₹2,20,000
    reason: 'Buyer claims consignment was received late; signed LR copy confirms on-time delivery.',
    created_at: '2026-10-12T10:00:00Z',
    documents_count: 4,
    dossier_ready: true,
  },
  {
    id: 'disp_002',
    invoice_id: 'inv_006',
    invoice_number: 'INV-2026-074',
    buyer_id: 'buy_003',
    buyer_name: 'RK Enterprises',
    dispute_category: 'Rate Difference',
    status: 'DOCUMENTATION_GATHERED',
    amount_disputed_paise: 3500000, // ₹35,000
    reason: 'Discrepancy between PO unit rate ₹420 and billed rate ₹450 due to raw material GST amendment.',
    created_at: '2026-10-20T14:30:00Z',
    documents_count: 2,
    dossier_ready: false,
  },
];
