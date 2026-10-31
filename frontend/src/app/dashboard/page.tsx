'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Wallet,
  Clock,
  AlertTriangle,
  FileCheck2,
  Calendar,
  ArrowRight,
  Plus,
  RefreshCw,
  ShieldCheck,
  Filter,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Buyer, DashboardSummary } from '@/lib/types';
import { formatINRLakhs, formatINR } from '@/lib/utils';
import { ScoreGauge } from '@/components/ScoreGauge';
import { ReliabilityBadge } from '@/components/ReliabilityBadge';

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('risk');

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getDashboardSummary();
        setSummary(data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading collections intelligence...</p>
      </div>
    );
  }

  const buyers = summary?.buyers || [];

  // Filter buyers
  const filteredBuyers = buyers.filter((buyer) => {
    if (selectedFilter === 'needs_attention') return buyer.reliability_tier === 'Needs attention';
    if (selectedFilter === 'high_risk') return buyer.reliability_tier === 'High payment risk';
    if (selectedFilter === 'insufficient_history') return buyer.reliability_tier === 'Insufficient history';
    return true;
  });

  // Sort buyers
  const sortedBuyers = [...filteredBuyers].sort((a, b) => {
    if (sortBy === 'risk') {
      const scoreA = a.reliability_score ?? 999;
      const scoreB = b.reliability_score ?? 999;
      return scoreA - scoreB;
    }
    if (sortBy === 'outstanding') {
      return b.outstanding_paise - a.outstanding_paise;
    }
    if (sortBy === 'turnaround') {
      return b.avg_payment_delay_days - a.avg_payment_delay_days;
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Overview</span>
            <span>/</span>
            <span className="text-indigo-700 font-semibold">Collections Intelligence</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Buyer portfolio
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
              Demo data
            </span>
          </div>

          <p className="text-sm text-slate-600 max-w-2xl">
            Real-time payment reliability and exposure tracking based on your uploaded sales ledger.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href="/invoices"
              className="inline-flex items-center gap-2 px-4 h-10 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors shadow-sm"
            >
              <span>Record Payment</span>
            </Link>
            <Link
              href="/invoices"
              className="inline-flex items-center gap-2 px-4 h-10 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-xs font-semibold text-white transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Invoice / Sync Tally</span>
            </Link>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 text-xs pt-1">
            <span className="w-2 h-2 rounded-full bg-teal-600" />
            <span>Synced today at 11:30 AM via TallyPrime</span>
          </div>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Buyers */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total buyers
            </span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-700">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex flex-col">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {summary?.metrics.total_buyers || 6}
            </span>
            <span className="text-xs text-slate-500 mt-0.5">Active accounts in ledger</span>
          </div>
        </div>

        {/* Total Outstanding */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total outstanding
            </span>
            <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex flex-col">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {formatINRLakhs((summary?.metrics.total_outstanding_paise || 85000000) / 100)}
            </span>
            <span className="text-xs text-slate-500 mt-0.5">
              Across {summary?.metrics.total_invoices || 64} open invoices
            </span>
          </div>
        </div>

        {/* Overdue Amount */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Overdue amount
            </span>
            <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex flex-col">
            <span className="text-2xl font-bold tracking-tight text-rose-600 tabular-nums">
              {formatINRLakhs((summary?.metrics.total_overdue_paise || 58000000) / 100)}
            </span>
            <span className="text-xs text-slate-500 mt-0.5">
              {summary?.metrics.overdue_percentage || 68}% of total outstanding
            </span>
          </div>
        </div>

        {/* Invoices At Risk */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Invoices at risk
            </span>
            <div className="w-9 h-9 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex flex-col">
            <span className="text-2xl font-bold tracking-tight text-rose-600 tabular-nums">
              {summary?.metrics.invoices_at_risk_count || 7}
            </span>
            <span className="text-xs text-slate-500 mt-0.5">Overdue &gt; 30 days</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Split Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Buyer Portfolio Grid (col-span-12 lg:col-span-8) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
          {/* Filter Bar & Sorters */}
          <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              <button
                type="button"
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedFilter === 'all'
                    ? 'bg-indigo-800 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All (6)
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter('needs_attention')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedFilter === 'needs_attention'
                    ? 'bg-indigo-800 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Needs attention (1)
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter('high_risk')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedFilter === 'high_risk'
                    ? 'bg-indigo-800 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                High payment risk (1)
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter('insufficient_history')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedFilter === 'insufficient_history'
                    ? 'bg-indigo-800 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Insufficient history (1)
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
              <select
                aria-label="Sort buyers"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600/20 cursor-pointer"
              >
                <option value="risk">Sort by: Payment Risk (Highest first)</option>
                <option value="outstanding">Sort by: Outstanding Amount (High to Low)</option>
                <option value="turnaround">Sort by: Settlement Turnaround</option>
                <option value="name">Sort by: Buyer Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Buyer Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedBuyers.map((buyer) => (
              <div
                key={buyer.id}
                className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col min-w-0">
                    <h3 className="text-base font-bold text-slate-900 truncate">
                      {buyer.name}
                    </h3>
                    <span className="text-xs text-slate-500 font-mono mt-0.5">
                      {buyer.gstin} • {buyer.city}, {buyer.state.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <ReliabilityBadge tier={buyer.reliability_tier} />
                </div>

                {/* Score Gauge & Key Figures */}
                <div className="flex items-center gap-4 my-4 bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                  <ScoreGauge score={buyer.reliability_score} tier={buyer.reliability_tier} size="md" />

                  <div className="grid grid-cols-2 gap-3 flex-1">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-medium text-slate-500">Outstanding</span>
                      <span className="text-sm font-bold text-slate-900 tabular-nums mt-0.5">
                        {formatINR(buyer.outstanding_paise)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-medium text-slate-500">Avg delay</span>
                      <span
                        className={`text-sm font-bold tabular-nums mt-0.5 ${
                          buyer.avg_payment_delay_days > 20
                            ? 'text-rose-600'
                            : buyer.avg_payment_delay_days > 10
                            ? 'text-amber-600'
                            : 'text-teal-700'
                        }`}
                      >
                        {buyer.reliability_score === null ? 'N/A' : `${buyer.avg_payment_delay_days} days`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer with Transactions count & Link */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Based on {buyer.invoices_count} invoices</span>
                  </span>

                  <Link
                    href={`/buyers/${buyer.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900 transition-colors"
                  >
                    <span>View Ledger</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Weekly Settlement Cycle Analysis card (From Stitch design) */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700 shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h4 className="text-sm font-bold text-slate-900">
                  Weekly Settlement Cycle Analysis
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  82% of all recorded invoice settlements in this ledger occur during Thursday banking cut-offs.
                </p>
              </div>
            </div>
            <Link
              href="/cashflow"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200 transition-colors shrink-0"
            >
              <span>View Forecast Calendar</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </Link>
          </div>
        </div>

        {/* Right Column: Realization Intelligence & Highlights (col-span-12 lg:col-span-4) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          {/* Critical Risk Warning Alert */}
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-100 rounded-lg text-rose-700 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <h4 className="text-sm font-bold text-rose-900">
                  Realization Shortfall Alert
                </h4>
                <p className="text-xs text-rose-700 mt-1">
                  Global Distributors is currently 45 days past terms with ₹3,50,000 outstanding.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-rose-200/70 flex items-center justify-between">
              <span className="text-[11px] font-medium text-rose-800">
                Action: Issue demand notice
              </span>
              <Link
                href="/reminders"
                className="text-xs font-bold text-rose-900 hover:underline flex items-center gap-1"
              >
                <span>Draft Notice</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Quick Stats: Risk Distribution */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex flex-col gap-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Portfolio Reliability Matrix
            </h4>

            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-700 font-medium">Highly reliable</span>
                </div>
                <span className="font-bold text-slate-900">1 buyer (₹50k)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-lime-500" />
                  <span className="text-slate-700 font-medium">Reliable</span>
                </div>
                <span className="font-bold text-slate-900">1 buyer (₹1.2L)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-slate-700 font-medium">Moderate reliability</span>
                </div>
                <span className="font-bold text-slate-900">1 buyer (₹1.0L)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  <span className="text-slate-700 font-medium">Needs attention</span>
                </div>
                <span className="font-bold text-slate-900">1 buyer (₹2.3L)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-slate-700 font-medium">High payment risk</span>
                </div>
                <span className="font-bold text-rose-600">1 buyer (₹3.5L)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span className="text-slate-700 font-medium">Insufficient history</span>
                </div>
                <span className="font-bold text-slate-500">1 buyer (₹0)</span>
              </div>
            </div>
          </div>

          {/* Mandatory Regulatory & Privacy Disclaimer */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-800">
                Private Ledger Assessment
              </span>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Scores are private estimates from your own invoice history, not a credit rating. Reliability calculations are measured relative to agreed terms and never weighted by invoice amount.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
