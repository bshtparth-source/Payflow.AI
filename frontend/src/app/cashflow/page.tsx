'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { CashflowForecastResponse } from '@/lib/types';
import { formatINRLakhs, formatINR } from '@/lib/utils';
import {
  Wallet,
  TrendingUp,
  AlertCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export default function CashflowPage() {
  const [forecast, setForecast] = useState<CashflowForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getCashflowForecast();
        setForecast(data);
      } catch (err) {
        console.error('Failed to load cashflow forecast:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !forecast) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Calculating cash flow realization projections...</p>
      </div>
    );
  }

  // Format chart data
  const chartData = forecast.projection_periods.map((p) => ({
    name: p.period_label.split('(')[0].trim(),
    inflow: Math.round(p.projected_inflow_paise / 100000), // in Thousands/Lakhs for chart
    outflow: Math.round(p.scheduled_outflow_paise / 100000),
    net: Math.round(p.net_surplus_deficit_paise / 100000),
  }));

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Home</span>
            <span>/</span>
            <span className="text-indigo-700 font-semibold">Treasury Planning</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Cash Flow Realization Forecast
            </h1>
            <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-teal-300">
              ESTIMATES &amp; RUNWAY PROJECTIONS
            </span>
          </div>
          <p className="text-sm text-slate-600 max-w-2xl">
            Simulates dynamic collections timing by projecting realization curves based on each buyer’s Buyer Reliability Score.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            30-Day Projected Inflow
          </span>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {formatINRLakhs(forecast.summary.total_inflow_30d_paise / 100)}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Based on on-time + early payments</span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            60-Day Cumulative
          </span>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {formatINRLakhs(forecast.summary.total_inflow_60d_paise / 100)}
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Includes secondary batch settlements</span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            90-Day Horizon
          </span>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {formatINRLakhs(forecast.summary.total_inflow_90d_paise / 100)}
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Long-cycle counterparty settlements</span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Working Capital Gap
          </span>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-2xl font-bold text-rose-600 tabular-nums">
              {formatINR(forecast.summary.estimated_working_capital_gap_paise)}
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[11px] text-rose-600 font-medium mt-1">Early Nov Payroll Shortfall</span>
        </div>
      </div>

      {/* Chart: Projected Inflows vs Scheduled Outflows */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Cash Inflow vs Outflow Runway (in ₹ Thousands)
          </h3>
          <span className="text-xs text-slate-500">Realization weighted by payment delay probability</span>
        </div>

        <div className="h-72 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
              <Tooltip
                formatter={(val) => [`₹${(Number(val) * 1000).toLocaleString('en-IN')}`, 'Amount']}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="inflow" name="Projected Collections" fill="#3730A3" radius={[4, 4, 0, 0]} />
              <Bar dataKey="outflow" name="Vendor & Payroll Outflow" fill="#94A3B8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Projection Periods Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900">
            Realization Intervals & Deficit Probability
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4 text-right">Projected Inflow</th>
                <th className="py-3 px-4 text-right">Committed Outflow</th>
                <th className="py-3 px-4 text-right">Net Surplus / (Deficit)</th>
                <th className="py-3 px-4">Shortfall Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {forecast.projection_periods.map((period, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {period.period_label}
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-slate-900 tabular-nums">
                    {formatINR(period.projected_inflow_paise)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-600 tabular-nums">
                    {formatINR(period.scheduled_outflow_paise)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold tabular-nums">
                    <span
                      className={
                        period.net_surplus_deficit_paise < 0 ? 'text-rose-600' : 'text-emerald-700'
                      }
                    >
                      {period.net_surplus_deficit_paise < 0 ? '-' : '+'}
                      {formatINR(Math.abs(period.net_surplus_deficit_paise))}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        period.shortfall_risk === 'HIGH'
                          ? 'bg-rose-100 text-rose-800'
                          : period.shortfall_risk === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {period.shortfall_risk} RISK
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Estimates Disclaimer */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 leading-relaxed">
          <strong>Mandatory Disclaimer:</strong> {forecast.disclaimer} Cash-flow outputs are probabilistic estimates modeled on empirical settlement latency.
        </div>
      </div>
    </div>
  );
}
