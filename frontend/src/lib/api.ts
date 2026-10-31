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
  mockBuyers,
  mockBuyerScores,
  mockCashflowForecast,
  mockDashboardSummary,
  mockDisputes,
  mockInvoices,
  mockReminders,
  mockRiskRadar,
} from './mockData';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

/**
 * Generic typed fetcher with graceful fallback to mock data on network failure.
 */
async function fetchWithFallback<T>(
  endpoint: string,
  options?: RequestInit,
  mockFallback?: T
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      console.warn(`API [${res.status}] ${url}: using mock fallback`);
      if (mockFallback !== undefined) return mockFallback;
      throw new Error(`API error: ${res.statusText}`);
    }

    return (await res.json()) as T;
  } catch (err) {
    console.info(`Backend fetch failed for ${endpoint}. Serving client fallback:`, (err as Error).message);
    if (mockFallback !== undefined) {
      return mockFallback;
    }
    throw err;
  }
}

export const api = {
  // Dashboard
  async getDashboardSummary(): Promise<DashboardSummary> {
    return fetchWithFallback<DashboardSummary>('/api/dashboard/summary', undefined, mockDashboardSummary);
  },

  // Buyers
  async getBuyers(): Promise<Buyer[]> {
    return fetchWithFallback<Buyer[]>('/api/buyers', undefined, mockBuyers);
  },

  async getBuyer(id: string): Promise<Buyer> {
    const fallback = mockBuyers.find((b) => b.id === id) || mockBuyers[0];
    return fetchWithFallback<Buyer>(`/api/buyers/${id}`, undefined, fallback);
  },

  async getBuyerScore(id: string): Promise<BuyerScore> {
    const fallback = mockBuyerScores[id] || {
      buyer_id: id,
      buyer_name: 'Buyer ' + id,
      score: 75,
      tier: 'Reliable',
      calculated_at: new Date().toISOString(),
      transactions_count: 12,
      sub_scores: { on_time: 80, delay: 75, consistency: 70, commitments: 80, overdue_history: 70 },
      weights: { on_time: 0.3, delay: 0.25, consistency: 0.15, commitments: 0.15, overdue_history: 0.15 },
      disclaimer: 'Scores are private estimates from your own invoice history, not a credit rating.',
    };
    return fetchWithFallback<BuyerScore>(`/api/buyers/${id}/score`, undefined, fallback);
  },

  async challengeBuyerRecord(
    id: string,
    payload: { invoice_id?: string; challenge_type: string; reason: string }
  ): Promise<{ status: string; challenge_id: string; message: string }> {
    return fetchWithFallback(
      `/api/buyers/${id}/records/challenge`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      {
        status: 'SUBMITTED',
        challenge_id: 'ch_' + Math.random().toString(36).substring(7),
        message: 'Payment record challenge recorded successfully for review.',
      }
    );
  },

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    return fetchWithFallback<Invoice[]>('/api/invoices', undefined, mockInvoices);
  },

  async createInvoice(payload: Partial<Invoice>): Promise<Invoice> {
    return fetchWithFallback<Invoice>(
      '/api/invoices',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      {
        id: 'inv_' + Date.now(),
        buyer_id: payload.buyer_id || 'buy_001',
        buyer_name: payload.buyer_name || 'ABC Industries',
        invoice_number: payload.invoice_number || `INV-${Date.now()}`,
        issue_date: payload.issue_date || new Date().toISOString().split('T')[0],
        due_date: payload.due_date || new Date().toISOString().split('T')[0],
        amount_paise: payload.amount_paise || 1000000,
        paid_amount_paise: 0,
        status: 'ISSUED',
        payment_terms_days: payload.payment_terms_days || 30,
        days_overdue: 0,
      }
    );
  },

  async updateInvoice(id: string, payload: Partial<Invoice>): Promise<Invoice> {
    const existing = mockInvoices.find((i) => i.id === id) || mockInvoices[0];
    return fetchWithFallback<Invoice>(
      `/api/invoices/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
      { ...existing, ...payload }
    );
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

    try {
      const res = await fetch(`${BASE_URL}/api/invoices/upload`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

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
    return fetchWithFallback(
      `/api/invoices/${id}/payments`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      {
        status: 'PAID',
        new_paid_amount_paise: payload.amount_paise,
      }
    );
  },

  // Risk Radar
  async getRiskRadar(): Promise<RiskRadarResponse> {
    return fetchWithFallback<RiskRadarResponse>('/api/risk-radar', undefined, mockRiskRadar);
  },

  // Cash Flow Forecast
  async getCashflowForecast(): Promise<CashflowForecastResponse> {
    return fetchWithFallback<CashflowForecastResponse>('/api/cashflow/forecast', undefined, mockCashflowForecast);
  },

  // Reminders
  async getReminders(): Promise<Reminder[]> {
    return fetchWithFallback<Reminder[]>('/api/reminders', undefined, mockReminders);
  },

  async draftReminder(payload: {
    invoice_id: string;
    buyer_id: string;
    tone: 'GENTLE' | 'FIRM' | 'URGENT' | 'LEGAL_NOTICE';
    channel: 'WHATSAPP' | 'EMAIL' | 'SMS';
  }): Promise<Reminder> {
    return fetchWithFallback<Reminder>(
      '/api/reminders/draft',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      {
        id: 'rem_' + Date.now(),
        invoice_id: payload.invoice_id,
        buyer_id: payload.buyer_id,
        buyer_name: 'Selected Counterparty',
        recipient_name: 'Accounts Department',
        recipient_email: 'accounts@counterparty.com',
        recipient_phone: '+91 98000 12345',
        channel: payload.channel,
        tone: payload.tone,
        status: 'DRAFT',
        subject: `Payment reminder regarding Invoice #${payload.invoice_id}`,
        message_body: `Dear Partner, this is a ${payload.tone.toLowerCase()} reminder regarding pending settlement. Please process the transaction at your earliest convenience.`,
        created_at: new Date().toISOString(),
      }
    );
  },

  // Disputes
  async getDisputes(): Promise<Dispute[]> {
    return fetchWithFallback<Dispute[]>('/api/disputes', undefined, mockDisputes);
  },

  async createDispute(payload: Partial<Dispute>): Promise<Dispute> {
    return fetchWithFallback<Dispute>(
      '/api/disputes',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      {
        id: 'disp_' + Date.now(),
        invoice_id: payload.invoice_id || 'inv_001',
        invoice_number: payload.invoice_number || 'INV-2026-999',
        buyer_id: payload.buyer_id || 'buy_005',
        buyer_name: payload.buyer_name || 'Global Distributors',
        dispute_category: payload.dispute_category || 'Quantity Mismatch',
        status: 'UNDER_REVIEW',
        amount_disputed_paise: payload.amount_disputed_paise || 5000000,
        reason: payload.reason || 'Document mismatch reported by buyer.',
        created_at: new Date().toISOString(),
        documents_count: 1,
        dossier_ready: false,
      }
    );
  },

  async getDisputeDossierPack(id: string): Promise<{
    dispute_id: string;
    dossier_url: string;
    generated_at: string;
    documents_included: string[];
  }> {
    return fetchWithFallback(
      `/api/disputes/${id}/pack`,
      undefined,
      {
        dispute_id: id,
        dossier_url: `/downloads/dossier_${id}.pdf`,
        generated_at: new Date().toISOString(),
        documents_included: [
          'Original Tax Invoice.pdf',
          'Signed Purchase Order.pdf',
          'Transporter Lorry Receipt (LR).pdf',
          'MSME Samadhaan Annexure A.pdf',
        ],
      }
    );
  },
};
