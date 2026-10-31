import {
  Buyer,
  BuyerScore,
  CashflowForecastResponse,
  DashboardSummary,
  Dispute,
  Invoice,
  Reminder,
  RiskRadarResponse,
} from './types';
import {
  localBusiness,
  localBuyers,
  localInvoices,
  localDisputes,
  localReminders,
  localBuyerScores,
  AS_OF_DATE,
} from '@/data';
import { computeLedgerFacts } from './analytics';

// In-memory state for mutative interactions during demo recordings
let inMemoryInvoices = [...localInvoices];
let inMemoryDisputes = [...localDisputes];
let inMemoryReminders = [...localReminders];

export const api = {
  // Dashboard Summary
  async getDashboardSummary(): Promise<DashboardSummary> {
    const facts = computeLedgerFacts();

    const portfolioBreakdown = {
      highly_reliable: 0,
      reliable: 0,
      moderate_reliability: 0,
      needs_attention: 0,
      high_risk: 0,
      insufficient_history: 0,
    };

    localBuyers.forEach((b) => {
      switch (b.reliability_tier) {
        case 'Highly reliable':
          portfolioBreakdown.highly_reliable += 1;
          break;
        case 'Reliable':
          portfolioBreakdown.reliable += 1;
          break;
        case 'Moderate reliability':
          portfolioBreakdown.moderate_reliability += 1;
          break;
        case 'Needs attention':
          portfolioBreakdown.needs_attention += 1;
          break;
        case 'High payment risk':
          portfolioBreakdown.high_risk += 1;
          break;
        default:
          portfolioBreakdown.insufficient_history += 1;
          break;
      }
    });

    const urgentActions = facts.buyer_priority_ranking
      .filter((b) => b.overdue_paise > 0)
      .slice(0, 2)
      .map((b, idx) => ({
        id: `act_0${idx + 1}`,
        type: b.oldest_overdue_days > 30 ? 'PAYMENT_OVERDUE' : 'COMMITMENT_BROKEN',
        buyer_id: b.buyer_id,
        buyer_name: b.name,
        invoice_id: b.buyer_id === 'buyer_05' ? 'inv_005' : 'inv_004',
        amount_paise: b.overdue_paise,
        days_overdue: b.oldest_overdue_days,
        recommended_action:
          b.buyer_id === 'buyer_05'
            ? 'Send Formal Demand Notice (MSMED reference)'
            : 'Follow up on broken payment commitment from Oct 25',
      }));

    return {
      business_name: facts.business.name,
      total_receivables_paise: facts.totals.total_outstanding_paise,
      overdue_receivables_paise: facts.totals.total_overdue_paise,
      overdue_percentage: facts.totals.overdue_percentage,
      average_collection_days: 37.5,
      at_risk_capital_paise: facts.totals.at_risk_capital_paise,
      buyer_count: facts.totals.total_buyers,
      portfolio_breakdown: portfolioBreakdown,
      urgent_actions: urgentActions,
      business: localBusiness,
      buyers: localBuyers,
      recent_invoices: inMemoryInvoices,
    };
  },

  // Buyers
  async getBuyers(): Promise<Buyer[]> {
    return localBuyers;
  },

  async getBuyer(id: string): Promise<Buyer> {
    const buyer = localBuyers.find((b) => b.id === id);
    if (!buyer) return localBuyers[0];
    return buyer;
  },

  async getBuyerScore(id: string): Promise<BuyerScore> {
    const score = localBuyerScores[id];
    if (score) return score;

    const buyer = localBuyers.find((b) => b.id === id) || localBuyers[0];
    return {
      buyer_id: buyer.id,
      buyer_name: buyer.name,
      score: buyer.reliability_score ?? null,
      tier: buyer.reliability_tier || 'Reliable',
      calculated_at: `${AS_OF_DATE}T06:00:00Z`,
      transactions_count: buyer.transactions_count || 12,
      sub_scores: { on_time: 80, delay: 75, consistency: 70, commitments: 80, overdue_history: 70 },
      weights: { on_time: 0.3, delay: 0.25, consistency: 0.15, commitments: 0.15, overdue_history: 0.15 },
      disclaimer: 'Scores are private estimates from your own invoice history, not a credit rating.',
    };
  },

  async challengeBuyerRecord(
    id: string,
    payload: { invoice_id?: string; challenge_type: string; reason: string }
  ): Promise<{ status: string; challenge_id: string; message: string }> {
    return {
      status: 'SUBMITTED',
      challenge_id: 'ch_' + Math.random().toString(36).substring(7),
      message: 'Payment record challenge recorded successfully for review.',
    };
  },

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    return inMemoryInvoices;
  },

  async createInvoice(payload: Partial<Invoice>): Promise<Invoice> {
    const newInv: Invoice = {
      id: 'inv_' + Date.now(),
      buyer_id: payload.buyer_id || 'buyer_04',
      buyer_name: payload.buyer_name || 'Metro Suppliers',
      invoice_number: payload.invoice_number || `INV-${Date.now()}`,
      issue_date: payload.issue_date || AS_OF_DATE,
      due_date: payload.due_date || '2026-11-30',
      amount_paise: payload.amount_paise || 18500000,
      paid_amount_paise: 0,
      status: 'ISSUED',
      payment_terms_days: payload.payment_terms_days || 30,
      days_overdue: 0,
      overdue_days: 0,
      items_summary: payload.items_summary || 'Precision Fabricated Structural Components',
    };
    inMemoryInvoices = [newInv, ...inMemoryInvoices];
    return newInv;
  },

  async updateInvoice(id: string, payload: Partial<Invoice>): Promise<Invoice> {
    const idx = inMemoryInvoices.findIndex((i) => i.id === id);
    if (idx !== -1) {
      inMemoryInvoices[idx] = { ...inMemoryInvoices[idx], ...payload };
      return inMemoryInvoices[idx];
    }
    return inMemoryInvoices[0];
  },

  async uploadInvoiceDocument(formData: FormData): Promise<{
    file_name: string;
    extracted_data: {
      buyer_name: string;
      invoice_number: string;
      amount_paise: number;
      issue_date: string;
      payment_terms_days: number;
      due_date: string;
    };
    confidence_score: number;
  }> {
    const file = formData.get('file') as File | null;
    const fileName = file ? file.name : 'uploaded_invoice.pdf';

    return {
      file_name: fileName,
      extracted_data: {
        buyer_name: 'Metro Suppliers',
        invoice_number: 'INV-2026-OCT-88',
        amount_paise: 18500000, // ₹1,85,000
        issue_date: '2026-10-15',
        payment_terms_days: 30,
        due_date: '2026-11-14',
      },
      confidence_score: 0.94,
    };
  },

  async recordInvoicePayment(
    id: string,
    payload: { amount_paise: number; payment_date: string; reference_no?: string }
  ): Promise<{ status: string; new_paid_amount_paise: number }> {
    const idx = inMemoryInvoices.findIndex((i) => i.id === id);
    let newPaid = payload.amount_paise;
    if (idx !== -1) {
      newPaid = inMemoryInvoices[idx].paid_amount_paise + payload.amount_paise;
      inMemoryInvoices[idx] = {
        ...inMemoryInvoices[idx],
        paid_amount_paise: newPaid,
        status: newPaid >= inMemoryInvoices[idx].amount_paise ? 'PAID' : 'PARTIALLY_PAID',
      };
    }
    return {
      status: 'PAID',
      new_paid_amount_paise: newPaid,
    };
  },

  // Risk Radar
  async getRiskRadar(): Promise<RiskRadarResponse> {
    const facts = computeLedgerFacts();

    const buckets = [
      {
        tier: 'High payment risk',
        buyer_count: 1,
        exposure_paise: 35000000,
        avg_delay_days: 45,
        buyers: [
          {
            buyer_id: 'buyer_05',
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
        exposure_paise: 23000000,
        avg_delay_days: 18,
        buyers: [
          {
            buyer_id: 'buyer_04',
            buyer_name: 'Metro Suppliers',
            exposure_paise: 23000000,
            score: 54,
            avg_delay_days: 18,
            overdue_paise: 23000000,
          },
        ],
      },
      {
        tier: 'Moderate reliability',
        buyer_count: 1,
        exposure_paise: 10000000,
        avg_delay_days: 12,
        buyers: [
          {
            buyer_id: 'buyer_03',
            buyer_name: 'RK Enterprises',
            exposure_paise: 10000000,
            score: 68,
            avg_delay_days: 12,
            overdue_paise: 10000000,
          },
        ],
      },
      {
        tier: 'Reliable',
        buyer_count: 1,
        exposure_paise: 12000000,
        avg_delay_days: 5,
        buyers: [
          {
            buyer_id: 'buyer_02',
            buyer_name: 'Sharma Traders',
            exposure_paise: 12000000,
            score: 78,
            avg_delay_days: 5,
            overdue_paise: 0,
          },
        ],
      },
      {
        tier: 'Highly reliable',
        buyer_count: 1,
        exposure_paise: 5000000,
        avg_delay_days: 1,
        buyers: [
          {
            buyer_id: 'buyer_01',
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
        exposure_paise: 7500000,
        avg_delay_days: 0,
        buyers: [
          {
            buyer_id: 'buyer_06',
            buyer_name: 'Nova Packaging',
            exposure_paise: 7500000,
            score: null,
            avg_delay_days: 0,
            overdue_paise: 0,
          },
        ],
      },
    ];

    return {
      calculated_at: `${AS_OF_DATE}T06:00:00Z`,
      total_exposure_paise: facts.totals.total_outstanding_paise,
      high_risk_exposure_paise: 58000000,
      buckets: buckets,
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
  },

  // Cashflow Forecast
  async getCashflowForecast(): Promise<CashflowForecastResponse> {
    return {
      forecast_date: `${AS_OF_DATE}T06:00:00Z`,
      projection_periods: [
        {
          period_label: 'Next 15 Days (1-15 Nov)',
          projected_inflow_paise: 17000000,
          scheduled_outflow_paise: 24000000,
          net_surplus_deficit_paise: -7000000,
          shortfall_risk: 'HIGH',
        },
        {
          period_label: 'Mid-Term (16-30 Nov)',
          projected_inflow_paise: 38000000,
          scheduled_outflow_paise: 29000000,
          net_surplus_deficit_paise: 9000000,
          shortfall_risk: 'LOW',
        },
        {
          period_label: 'Days 31–60 (Dec 2026)',
          projected_inflow_paise: 42000000,
          scheduled_outflow_paise: 35000000,
          net_surplus_deficit_paise: 7000000,
          shortfall_risk: 'LOW',
        },
        {
          period_label: 'Days 61–90 (Jan 2027)',
          projected_inflow_paise: 31000000,
          scheduled_outflow_paise: 32000000,
          net_surplus_deficit_paise: -1000000,
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
  },

  // Reminders
  async getReminders(): Promise<Reminder[]> {
    return inMemoryReminders;
  },

  async draftReminder(payload: {
    invoice_id: string;
    buyer_id: string;
    tone: 'GENTLE' | 'FIRM' | 'URGENT' | 'LEGAL_NOTICE';
    channel: 'WHATSAPP' | 'EMAIL' | 'SMS';
  }): Promise<Reminder> {
    const buyer = localBuyers.find((b) => b.id === payload.buyer_id) || localBuyers[0];
    const newRem: Reminder = {
      id: 'rem_' + Date.now(),
      invoice_id: payload.invoice_id,
      buyer_id: buyer.id,
      buyer_name: buyer.name,
      recipient_name: 'Accounts Department',
      recipient_email: buyer.email || 'accounts@counterparty.com',
      recipient_phone: buyer.phone || '+91 98000 12345',
      channel: payload.channel,
      tone: payload.tone,
      status: 'DRAFT',
      subject: `Payment reminder regarding Invoice #${payload.invoice_id}`,
      message_body: `Dear ${buyer.name} team, this is a ${payload.tone.toLowerCase()} reminder regarding pending settlement. Please process the transaction at your earliest convenience.`,
      created_at: new Date().toISOString(),
    };
    inMemoryReminders = [newRem, ...inMemoryReminders];
    return newRem;
  },

  // Disputes
  async getDisputes(): Promise<Dispute[]> {
    return inMemoryDisputes;
  },

  async createDispute(payload: Partial<Dispute>): Promise<Dispute> {
    const newDisp: Dispute = {
      id: 'disp_' + Date.now(),
      invoice_id: payload.invoice_id || 'inv_004',
      invoice_number: payload.invoice_number || 'INV-2026-077',
      buyer_id: payload.buyer_id || 'buyer_04',
      buyer_name: payload.buyer_name || 'Metro Suppliers',
      dispute_category: payload.dispute_category || 'Rate Discrepancy',
      status: 'UNDER_REVIEW',
      amount_disputed_paise: payload.amount_disputed_paise || 3000000,
      reason: payload.reason || 'Discrepancy reported during invoice verification.',
      created_at: new Date().toISOString(),
      documents_count: 2,
      dossier_ready: true,
    };
    inMemoryDisputes = [newDisp, ...inMemoryDisputes];
    return newDisp;
  },

  async getDisputeDossierPack(id: string): Promise<{
    dispute_id: string;
    dossier_url: string;
    generated_at: string;
    documents_included: string[];
  }> {
    return {
      dispute_id: id,
      dossier_url: `/downloads/dossier_${id}.pdf`,
      generated_at: new Date().toISOString(),
      documents_included: [
        'Original Tax Invoice.pdf',
        'Signed Purchase Order.pdf',
        'Transporter Lorry Receipt (LR).pdf',
        'MSME Samadhaan Annexure A.pdf',
      ],
    };
  },
};
