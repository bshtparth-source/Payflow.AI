'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Buyer } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { ScoreGauge } from '@/components/ScoreGauge';
import { ReliabilityBadge } from '@/components/ReliabilityBadge';
import { Search, ArrowRight, RefreshCw, FileCheck2, AlertCircle } from 'lucide-react';

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');

  useEffect(() => {
    async function loadBuyers() {
      try {
        const data = await api.getBuyers();
        setBuyers(data);
      } catch (err) {
        console.error('Failed to load buyers:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBuyers();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm text-slate-500">Loading buyers directory...</p>
      </div>
    );
  }

  const filtered = buyers.filter((buyer) => {
    const matchesSearch =
      buyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      buyer.gstin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      buyer.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTier =
      selectedTier === 'all' || buyer.reliability_tier === selectedTier;

    return matchesSearch && matchesTier;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Home</span>
            <span>/</span>
            <span className="text-indigo-700 font-semibold">Buyers Directory</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Counterparty Buyers
          </h1>
          <p className="text-sm text-slate-600">
            Monitor historical payment behaviors, realization velocity, and reliability indices across your B2B customers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            Total buyers: <strong className="text-slate-800">{buyers.length}</strong>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by buyer name, GSTIN, or city..."
            className="w-full h-10 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setSelectedTier('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedTier === 'all'
                ? 'bg-indigo-800 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Tiers
          </button>
          <button
            type="button"
            onClick={() => setSelectedTier('High payment risk')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedTier === 'High payment risk'
                ? 'bg-rose-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            High Risk
          </button>
          <button
            type="button"
            onClick={() => setSelectedTier('Needs attention')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedTier === 'Needs attention'
                ? 'bg-orange-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Needs Attention
          </button>
          <button
            type="button"
            onClick={() => setSelectedTier('Highly reliable')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedTier === 'Highly reliable'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Highly Reliable
          </button>
        </div>
      </div>

      {/* Buyers Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Buyer & Identification</th>
                <th className="py-3.5 px-4 text-center">Buyer Reliability Score</th>
                <th className="py-3.5 px-4">Reliability Tier</th>
                <th className="py-3.5 px-4 text-right">Agreed Terms</th>
                <th className="py-3.5 px-4 text-right">Outstanding Exposure</th>
                <th className="py-3.5 px-4 text-right">Avg Realization Delay</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((buyer) => {
                const count = buyer.transactions_count ?? buyer.invoices_count ?? 0;
                const terms = buyer.agreed_terms_days ?? buyer.agreed_payment_terms_days ?? 30;
                const exposure = buyer.outstanding_exposure_paise ?? buyer.outstanding_paise ?? 0;
                const delay = buyer.average_delay_days ?? buyer.avg_payment_delay_days ?? 0;

                return (
                  <tr key={buyer.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-sm">{buyer.name}</span>
                        <span className="text-slate-500 font-mono text-[11px] mt-0.5">
                          {buyer.gstin || 'GSTIN Pending'} • {buyer.city || 'India'}
                        </span>
                        <span className="text-slate-400 text-[10px] flex items-center gap-1 mt-1">
                          <FileCheck2 className="w-3 h-3" />
                          {count} settled/active invoices
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center">
                        <ScoreGauge
                          score={buyer.reliability_score}
                          tier={buyer.reliability_tier}
                          size="sm"
                          showLabel={false}
                        />
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <ReliabilityBadge tier={buyer.reliability_tier} />
                    </td>
                    <td className="py-4 px-4 text-right font-medium text-slate-700">
                      Net {terms} days
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-slate-900 tabular-nums">
                      {formatINR(exposure)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span
                        className={`font-semibold tabular-nums ${
                          delay > 20
                            ? 'text-rose-600'
                            : delay > 10
                            ? 'text-amber-600'
                            : 'text-teal-700'
                        }`}
                      >
                        {buyer.reliability_score === null ? 'N/A' : `${delay} days`}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        href={`/buyers/${buyer.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900 transition-colors"
                      >
                        <span>Ledger</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
