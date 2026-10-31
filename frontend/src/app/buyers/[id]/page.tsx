'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Buyer, BuyerScore, Invoice } from '@/lib/types';
import { formatINR, formatDate } from '@/lib/utils';
import { ScoreGauge } from '@/components/ScoreGauge';
import { ReliabilityBadge } from '@/components/ReliabilityBadge';
import {
  ArrowLeft,
  Building,
  Calendar,
  AlertTriangle,
  Scale,
  BellRing,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Send,
  Flag,
  FileCheck2,
  Sparkles,
} from 'lucide-react';

export default function BuyerDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || 'buy_005';

  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [scoreData, setScoreData] = useState<BuyerScore | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  // Challenge modal state
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const [challengeReason, setChallengeReason] = useState('');
  const [challengeType, setChallengeType] = useState('OFFLINE_SETTLEMENT');
  const [challengeStatus, setChallengeStatus] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [b, s, allInvoices] = await Promise.all([
          api.getBuyer(id),
          api.getBuyerScore(id),
          api.getInvoices(),
        ]);
        setBuyer(b);
        setScoreData(s);
        setInvoices(allInvoices.filter((inv) => inv.buyer_id === id));
      } catch (err) {
        console.error('Error loading buyer details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleChallengeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.challengeBuyerRecord(id, {
        challenge_type: challengeType,
        reason: challengeReason,
      });
      setChallengeStatus(res.message);
      setTimeout(() => {
        setIsChallengeOpen(false);
        setChallengeStatus(null);
      }, 2500);
    } catch {
      alert('Failed to submit challenge. Please retry.');
    }
  };

  if (loading || !buyer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <Clock className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm text-slate-500">Loading buyer ledger & behavioral history...</p>
      </div>
    );
  }

  const termsDays = buyer.agreed_terms_days ?? buyer.agreed_payment_terms_days ?? 30;
  const exposurePaise = buyer.outstanding_exposure_paise ?? buyer.outstanding_paise ?? 0;
  const overduePaise = buyer.overdue_paise ?? (buyer.reliability_tier === 'High payment risk' ? exposurePaise : 0);
  const txCount = scoreData?.transactions_count ?? buyer.transactions_count ?? buyer.invoices_count ?? 0;
  const activeDisputes = buyer.active_disputes_count ?? buyer.disputed_count ?? 0;

  const sub = {
    on_time: Math.round(scoreData?.sub_scores?.on_time ?? 25),
    delay: Math.round(scoreData?.sub_scores?.delay ?? 20),
    consistency: Math.round(scoreData?.sub_scores?.consistency ?? 35),
    commitments: Math.round(scoreData?.sub_scores?.commitments ?? 30),
    overdue_history: Math.round(scoreData?.sub_scores?.overdue_history ?? 45),
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Breadcrumb & Back button */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link href="/buyers" className="hover:text-indigo-700 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Buyers</span>
        </Link>
        <span>/</span>
        <span className="text-indigo-700 font-semibold">{buyer.name}</span>
      </div>

      {/* Buyer Profile Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{buyer.name}</h1>
            <ReliabilityBadge tier={buyer.reliability_tier} />
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500 font-mono flex-wrap">
            <span>GSTIN: {buyer.gstin || 'GSTIN Pending'}</span>
            <span>•</span>
            <span>{buyer.legal_name || buyer.name}</span>
            <span>•</span>
            <span>{buyer.city || 'India'}, {buyer.state || ''}</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
            <span className="bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              Agreed Credit Terms: <strong>Net {termsDays} days</strong>
            </span>
            <span className="bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              Transactions Tracked: <strong>{txCount}</strong>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href={`/assistant?q=${encodeURIComponent(`Tell me about ${buyer.name}`)}`}
            className="inline-flex items-center gap-1.5 px-3.5 h-10 rounded-lg bg-teal-50 border border-teal-200 hover:bg-teal-100 text-xs font-semibold text-teal-800 transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Ask AI about this buyer</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsChallengeOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 h-10 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-sm"
          >
            <Flag className="w-4 h-4 text-slate-500" />
            <span>Flag / Challenge Record</span>
          </button>

          <Link
            href="/reminders"
            className="inline-flex items-center gap-1.5 px-4 h-10 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-xs font-semibold text-white transition-colors shadow-sm"
          >
            <BellRing className="w-4 h-4" />
            <span>Draft Payment Reminder</span>
          </Link>
        </div>
      </div>

      {/* Disputed Invoices Banner Notice */}
      {activeDisputes > 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Scale className="w-5 h-5 text-amber-700 shrink-0" />
            <div className="text-xs text-amber-900">
              <strong>{activeDisputes} invoice under active dispute review.</strong> In accordance with mathematical scoring rules, disputed invoices are strictly excluded from the Buyer Reliability Score calculation.
            </div>
          </div>
          <Link
            href="/disputes"
            className="text-xs font-bold text-amber-900 hover:underline shrink-0"
          >
            View Dispute Dossier →
          </Link>
        </div>
      ) : null}

      {/* Middle Row: Score Breakdown & Sub-scores */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left: Overall Reliability Index Card */}
        <div className="col-span-12 lg:col-span-5 bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Buyer Reliability Score
              </span>
              <span className="text-[11px] text-slate-400">
                Updated {formatDate(scoreData?.calculated_at)}
              </span>
            </div>

            <div className="flex items-center gap-6 my-6">
              <ScoreGauge
                score={scoreData?.score}
                tier={scoreData?.tier}
                size="lg"
                showLabel={true}
              />
              <div className="flex flex-col gap-1">
                <span className="text-xl font-bold text-slate-900">{scoreData?.tier}</span>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Behavioral index calculated relative to agreed credit terms of Net {termsDays} days.
                </p>
                <span className="text-[11px] text-indigo-700 font-medium">
                  {txCount} settled transactions evaluated
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">
              Outstanding Financial Exposure
            </span>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Current Overdue</span>
              <span className="text-base font-bold text-rose-600 tabular-nums">
                {formatINR(overduePaise)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Total Unsettled</span>
              <span className="text-base font-bold text-slate-900 tabular-nums">
                {formatINR(exposurePaise)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Mathematical Sub-scores */}
        <div className="col-span-12 lg:col-span-7 bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Reliability Component Weights & Sub-scores
              </h3>
              <span className="text-xs text-slate-500">All metrics 0–100</span>
            </div>

            <div className="flex flex-col gap-4 mt-5">
              {/* Sub-score 1 */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">
                    On-Time Payment Rate (30% weight)
                  </span>
                  <span className="font-bold tabular-nums text-slate-900">{sub.on_time}/100</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${sub.on_time}%` }}
                  />
                </div>
              </div>

              {/* Sub-score 2 */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">
                    Average Payment Delay (25% weight)
                  </span>
                  <span className="font-bold tabular-nums text-slate-900">{sub.delay}/100</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${sub.delay}%` }}
                  />
                </div>
              </div>

              {/* Sub-score 3 */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">
                    Payment Consistency & Variance (15% weight)
                  </span>
                  <span className="font-bold tabular-nums text-slate-900">{sub.consistency}/100</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${sub.consistency}%` }}
                  />
                </div>
              </div>

              {/* Sub-score 4 */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">
                    Broken Payment Commitments (15% weight)
                  </span>
                  <span className="font-bold tabular-nums text-slate-900">{sub.commitments}/100</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${sub.commitments}%` }}
                  />
                </div>
              </div>

              {/* Sub-score 5 */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">
                    Historical Overdue Aging (15% weight)
                  </span>
                  <span className="font-bold tabular-nums text-slate-900">{sub.overdue_history}/100</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${sub.overdue_history}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-4 italic">
            * Scores reflect supplier ledger empirical data. Never weighted by monetary amounts.
          </p>
        </div>
      </div>

      {/* Buyer Invoices Ledger */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Invoice Ledger ({invoices.length} entries)
          </h3>
          <span className="text-xs text-slate-500">Sorted by invoice date (newest first)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Invoice Amount</th>
                <th className="py-3 px-4 text-right">Amount Settled</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Delay / Days Overdue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                    {inv.invoice_number}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{formatDate(inv.issue_date)}</td>
                  <td className="py-3.5 px-4 text-slate-600">{formatDate(inv.due_date)}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900 tabular-nums">
                    {formatINR(inv.amount_paise)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-slate-600 tabular-nums">
                    {formatINR(inv.paid_amount_paise)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inv.status === 'OVERDUE'
                          ? 'bg-rose-100 text-rose-800'
                          : inv.status === 'DISPUTED'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {(inv.days_overdue || inv.overdue_days || 0) > 0 ? (
                      <span className="text-rose-600 font-bold tabular-nums">
                        +{(inv.days_overdue || inv.overdue_days || 0)} days late
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-medium">On-time</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Challenge Modal Dialog */}
      {isChallengeOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Challenge / Flag Payment Record
              </h3>
              <button
                type="button"
                onClick={() => setIsChallengeOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Suppliers have the contractual right to flag records for reconciliation (e.g. offline bank deposits, disputed terms, or unrecorded credit notes).
            </p>

            <form onSubmit={handleChallengeSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Reason for Challenge
                </label>
                <select
                  value={challengeType}
                  onChange={(e) => setChallengeType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-indigo-600/20"
                >
                  <option value="OFFLINE_SETTLEMENT">Payment settled via offline cheque/RTGS</option>
                  <option value="TERMS_AMENDMENT">Payment terms were mutually extended</option>
                  <option value="CREDIT_NOTE_ADJUSTED">Settled via returned goods / credit note</option>
                  <option value="DISPUTED_GOODS">Goods delivery under verification</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Supporting Details / UTR Reference
                </label>
                <textarea
                  rows={3}
                  required
                  value={challengeReason}
                  onChange={(e) => setChallengeReason(e.target.value)}
                  placeholder="Provide transaction reference or context for internal review..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-indigo-600/20"
                />
              </div>

              {challengeStatus && (
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{challengeStatus}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsChallengeOpen(false)}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-700 hover:bg-indigo-800 transition-colors"
                >
                  Submit Challenge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
