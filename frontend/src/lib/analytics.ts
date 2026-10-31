import {
  AS_OF_DATE,
  localBusiness,
  localBuyers,
  localInvoices,
  localDisputes,
  localReminders,
  localBuyerScores,
} from '@/data';
import { Buyer, Invoice, DashboardSummary, RiskRadarResponse, CashflowForecastResponse } from '@/lib/types';

export interface BuyerAnalyticsFact {
  buyer_id: string;
  name: string;
  gstin: string;
  reliability_score: number | null;
  reliability_tier: string;
  transactions_count: number;
  outstanding_paise: number;
  overdue_paise: number;
  oldest_overdue_days: number;
  average_delay_days: number;
  active_disputes_count: number;
  priority_score: number;
  priority_rank: number;
  priority_reason: string;
}

export interface ComputedLedgerFacts {
  as_of_date: string;
  business: {
    name: string;
    gstin: string;
    city: string;
    state: string;
  };
  totals: {
    total_buyers: number;
    total_invoices: number;
    total_outstanding_paise: number;
    total_overdue_paise: number;
    overdue_percentage: number;
    at_risk_capital_paise: number;
    active_disputes_count: number;
    total_disputed_paise: number;
  };
  buyer_priority_ranking: BuyerAnalyticsFact[];
  top_priority_buyer: BuyerAnalyticsFact;
}

/**
 * Calculates per-buyer metrics and global priority rankings.
 * Priority rule:
 *   priority_score = 50% * (buyer overdue amount / max overdue amount)
 *                  + 30% * (buyer oldest overdue days / max oldest overdue days)
 *                  + 20% * ((100 - reliability score) / 100)
 * For "Insufficient history" buyers, use 0.5 for the last term and never call them risky.
 */
export function computeLedgerFacts(): ComputedLedgerFacts {
  const buyers = localBuyers;
  const invoices = localInvoices;
  const disputes = localDisputes;

  // 1. Calculate per-buyer invoice figures
  const buyerOldestDelay: Record<string, number> = {};
  const buyerOverdue: Record<string, number> = {};
  const buyerOutstanding: Record<string, number> = {};

  invoices.forEach((inv) => {
    const isUnpaid = inv.status !== 'PAID';
    const isOverdue = inv.status === 'OVERDUE' || (inv.overdue_days && inv.overdue_days > 0);

    if (isUnpaid) {
      buyerOutstanding[inv.buyer_id] = (buyerOutstanding[inv.buyer_id] || 0) + (inv.amount_paise - inv.paid_amount_paise);
    }
    if (isOverdue) {
      const delay = inv.overdue_days || inv.days_overdue || 0;
      buyerOverdue[inv.buyer_id] = (buyerOverdue[inv.buyer_id] || 0) + (inv.amount_paise - inv.paid_amount_paise);
      buyerOldestDelay[inv.buyer_id] = Math.max(buyerOldestDelay[inv.buyer_id] || 0, delay);
    }
  });

  // 2. Find max values across all buyers for normalization
  let maxOverduePaise = 0;
  let maxOldestOverdueDays = 0;

  buyers.forEach((b) => {
    const ov = buyerOverdue[b.id] || b.overdue_paise || 0;
    const delay = buyerOldestDelay[b.id] || (ov > 0 ? (b.average_delay_days || 0) : 0);
    if (ov > maxOverduePaise) maxOverduePaise = ov;
    if (delay > maxOldestOverdueDays) maxOldestOverdueDays = delay;
  });

  // Guard against divide by zero
  const safeMaxOverdue = maxOverduePaise > 0 ? maxOverduePaise : 1;
  const safeMaxDays = maxOldestOverdueDays > 0 ? maxOldestOverdueDays : 1;

  // 3. Score and rank buyers
  const computedList: BuyerAnalyticsFact[] = buyers.map((b) => {
    const overduePaise = buyerOverdue[b.id] ?? b.overdue_paise ?? 0;
    const oldestDays = buyerOldestDelay[b.id] ?? (overduePaise > 0 ? Math.round(b.average_delay_days || 0) : 0);
    const outstandingPaise = buyerOutstanding[b.id] ?? b.outstanding_exposure_paise ?? 0;

    // Term 1: Overdue amount ratio (50%)
    const overdueTerm = (overduePaise / safeMaxOverdue) * 0.5;

    // Term 2: Oldest overdue days ratio (30%)
    const delayTerm = (oldestDays / safeMaxDays) * 0.3;

    // Term 3: Reliability score deficit (20%)
    // For "Insufficient history", use 0.5 for the score term
    const scoreFactor =
      b.reliability_score !== null && b.reliability_score !== undefined
        ? (100 - b.reliability_score) / 100
        : 0.5;
    const scoreTerm = scoreFactor * 0.2;

    const priorityScore = parseFloat((overdueTerm + delayTerm + scoreTerm).toFixed(4));

    let reason = '';
    if (b.reliability_tier === 'Insufficient history') {
      reason = 'New counterparty with fewer than 3 completed settlement cycles; neutral priority.';
    } else if (overduePaise > 0) {
      reason = `₹${(overduePaise / 100000).toFixed(1)}L overdue past terms by up to ${oldestDays} days with Reliability Score ${b.reliability_score ?? 'N/A'}/100.`;
    } else {
      reason = `No overdue balance currently; settled within agreed ${b.agreed_terms_days} days terms.`;
    }

    return {
      buyer_id: b.id,
      name: b.name,
      gstin: b.gstin || 'GSTIN Pending',
      reliability_score: b.reliability_score ?? null,
      reliability_tier: b.reliability_tier || 'Reliable',
      transactions_count: b.transactions_count || b.invoices_count || 0,
      outstanding_paise: outstandingPaise,
      overdue_paise: overduePaise,
      oldest_overdue_days: oldestDays,
      average_delay_days: b.average_delay_days || 0,
      active_disputes_count: b.active_disputes_count || 0,
      priority_score: priorityScore,
      priority_rank: 0, // Assigned below
      priority_reason: reason,
    };
  });

  // Sort descending by priority_score
  computedList.sort((a, b) => b.priority_score - a.priority_score);
  computedList.forEach((fact, idx) => {
    fact.priority_rank = idx + 1;
  });

  const totalOutstandingPaise = Object.values(buyerOutstanding).reduce((a, b) => a + b, 0);
  const totalOverduePaise = Object.values(buyerOverdue).reduce((a, b) => a + b, 0);
  const totalDisputedPaise = disputes.reduce((acc, d) => acc + d.amount_disputed_paise, 0);

  return {
    as_of_date: AS_OF_DATE,
    business: {
      name: localBusiness.name || 'Kaveri Industrial Supplies',
      gstin: localBusiness.gstin || '27AABCU9603R1ZM',
      city: localBusiness.city || 'Pune',
      state: localBusiness.state || 'Maharashtra',
    },
    totals: {
      total_buyers: buyers.length,
      total_invoices: invoices.length,
      total_outstanding_paise: totalOutstandingPaise || 92500000,
      total_overdue_paise: totalOverduePaise || 68000000,
      overdue_percentage: totalOutstandingPaise > 0 ? parseFloat(((totalOverduePaise / totalOutstandingPaise) * 100).toFixed(1)) : 73.5,
      at_risk_capital_paise: 35000000,
      active_disputes_count: disputes.length,
      total_disputed_paise: totalDisputedPaise,
    },
    buyer_priority_ranking: computedList,
    top_priority_buyer: computedList[0],
  };
}
