'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { RiskRadarResponse } from '@/lib/types';
import { formatINRLakhs, formatINR } from '@/lib/utils';
import {
  Radar,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  Info,
  Building,
  CheckCircle2,
  Clock,
  RefreshCw,
} from 'lucide-react';

export default function RiskRadarPage() {
  const [radar, setRadar] = useState<RiskRadarResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getRiskRadar();
        setRadar(data);
      } catch (err) {
        console.error('Failed to load risk radar data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !radar) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Scanning open receivables with Risk Radar...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Home</span>
            <span>/</span>
            <span className="text-indigo-700 font-semibold">Risk Intelligence</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Payment Risk Radar
            </h1>
            <span className="bg-amber-100 text-amber-900 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-300">
              ESTIMATES &amp; BEHAVIORAL PROJECTIONS
            </span>
          </div>
          <p className="text-sm text-slate-600 max-w-2xl">
            Predictive realization modeling categorizing open receivables into low, moderate, and high payment risk exposure buckets.
          </p>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200 text-right">
          <span className="text-[11px] text-slate-500 block">Total Monitored Exposure</span>
          <span className="text-xl font-bold text-slate-900 tabular-nums">
            {formatINRLakhs(radar.total_exposure_paise / 100)}
          </span>
        </div>
      </div>

      {/* Headline Warning Callouts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {radar.shortfall_alerts.map((alert, idx) => (
          <div
            key={idx}
            className={`rounded-xl p-5 border flex flex-col justify-between gap-3 ${
              alert.severity === 'HIGH'
                ? 'bg-rose-50 border-rose-200 text-rose-950'
                : 'bg-orange-50 border-orange-200 text-orange-950'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg shrink-0 ${
                  alert.severity === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-orange-100 text-orange-700'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {alert.buyer_name} ({alert.severity} REALIZATION DELAY)
                </span>
                <p className="text-xs font-medium mt-1 leading-relaxed">{alert.message}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-300/40 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">
                Action: {alert.recommended_action}
              </span>
              <Link
                href="/reminders"
                className="font-bold text-indigo-800 hover:underline flex items-center gap-1"
              >
                <span>Take Action</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Radar Buckets Visual Hierarchy */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-bold text-slate-900">
          Receivables Exposure Categorization Buckets
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {radar.buckets.map((bucket, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex flex-col gap-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      bucket.tier === 'High payment risk'
                        ? 'bg-rose-600'
                        : bucket.tier === 'Needs attention'
                        ? 'bg-orange-500'
                        : bucket.tier === 'Moderate reliability'
                        ? 'bg-amber-500'
                        : bucket.tier === 'Reliable'
                        ? 'bg-lime-600'
                        : bucket.tier === 'Highly reliable'
                        ? 'bg-emerald-600'
                        : 'bg-slate-400'
                    }`}
                  />
                  <h4 className="text-sm font-bold text-slate-900">{bucket.tier}</h4>
                  <span className="text-xs text-slate-500 font-medium">
                    ({bucket.buyer_count} buyer accounts)
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <span className="text-slate-500">
                    Average delay:{' '}
                    <strong className="text-slate-800 tabular-nums">
                      {bucket.avg_delay_days} days
                    </strong>
                  </span>
                  <span className="text-slate-500">
                    Total Exposure:{' '}
                    <strong className="text-slate-900 font-bold tabular-nums">
                      {formatINR(bucket.exposure_paise)}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Counterparty List inside this bucket */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {bucket.buyers.map((b) => (
                  <div
                    key={b.buyer_id}
                    className="p-3.5 rounded-lg bg-slate-50/80 border border-slate-200/60 flex items-center justify-between"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-xs text-slate-900">{b.buyer_name}</span>
                      <span className="text-[11px] text-slate-500 mt-0.5">
                        Score: {b.score ?? 'N/A'} • Avg delay: {b.avg_delay_days}d
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex flex-col text-right">
                        <span className="text-xs font-bold text-slate-900 tabular-nums">
                          {formatINR(b.exposure_paise)}
                        </span>
                        {b.overdue_paise > 0 && (
                          <span className="text-[10px] text-rose-600 font-semibold tabular-nums">
                            {formatINR(b.overdue_paise)} overdue
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/buyers/${b.buyer_id}`}
                        className="p-1 rounded hover:bg-slate-200 text-slate-600"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invariant Estimates Notice */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 leading-relaxed">
          <strong>Methodology Note:</strong> The Payment Risk Radar projects realization behavior based on historical settlement variance, standard deviation of delay, and commitment fulfillments. All values are mathematical <strong>estimates</strong> designed to guide working capital management, not guarantees or credit ratings.
        </div>
      </div>
    </div>
  );
}
