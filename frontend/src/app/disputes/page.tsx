'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Dispute } from '@/lib/types';
import { formatINR, formatDate } from '@/lib/utils';
import {
  Scale,
  FileText,
  Download,
  AlertTriangle,
  CheckCircle2,
  FolderArchive,
  ExternalLink,
  Plus,
  RefreshCw,
} from 'lucide-react';

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPack, setSelectedPack] = useState<any | null>(null);

  useEffect(() => {
    async function loadDisputes() {
      try {
        const data = await api.getDisputes();
        setDisputes(data);
      } catch (err) {
        console.error('Failed to load disputes:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDisputes();
  }, []);

  const handleDownloadPack = async (disputeId: string) => {
    try {
      const pack = await api.getDisputeDossierPack(disputeId);
      setSelectedPack(pack);
    } catch {
      alert('Failed to generate dossier pack');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading dispute dossiers and evidence packs...</p>
      </div>
    );
  }

  const totalDisputedPaise = disputes.reduce((sum, d) => sum + d.amount_disputed_paise, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Home</span>
            <span>/</span>
            <span className="text-indigo-700 font-semibold">Legal & Escalation</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Dispute Document Organiser
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Compile signed purchase orders, transporter Lorry Receipts (LRs), and tax invoices into court-ready dossiers for MSME Samadhaan escalation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('Dispute creation dialog: select invoice and upload counterparty rejection email.')}
          className="inline-flex items-center gap-1.5 px-4 h-10 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-xs font-semibold text-white transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Dispute Dossier</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Active Disputes
          </span>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {disputes.length}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[11px] text-slate-500 mt-1">Excluded from reliability score</span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Disputed Value
          </span>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-2xl font-bold text-amber-600 tabular-nums">
              {formatINR(totalDisputedPaise)}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[11px] text-slate-500 mt-1">Locked in reconciliation</span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Ready for Samadhaan Filing
          </span>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-2xl font-bold text-emerald-700 tabular-nums">
              {disputes.filter((d) => d.dossier_ready).length}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium mt-1">
            Complete evidence bundle compiled
          </span>
        </div>
      </div>

      {/* Disputes Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900">
            Disputed Transactions & Dossier Status
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Dispute Category</th>
                <th className="py-3 px-4">Invoice & Counterparty</th>
                <th className="py-3 px-4 text-right">Disputed Value</th>
                <th className="py-3 px-4">Evidence Gathered</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Dossier Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {disputes.map((disp) => (
                <tr key={disp.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <div className="flex flex-col">
                      <span>{disp.dispute_category}</span>
                      <span className="text-[11px] text-slate-500 font-normal mt-0.5">
                        {disp.reason}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{disp.buyer_name}</span>
                      <span className="font-mono text-slate-500 text-[11px] mt-0.5">
                        {disp.invoice_number}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900 tabular-nums">
                    {formatINR(disp.amount_disputed_paise)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>{disp.documents_count} documents verified</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        disp.status === 'UNDER_REVIEW'
                          ? 'bg-amber-100 text-amber-800'
                          : disp.status === 'DOCUMENTATION_GATHERED'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {disp.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDownloadPack(disp.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Generate Pack</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dossier Pack Modal Dialog */}
      {selectedPack && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderArchive className="w-5 h-5 text-indigo-700" />
                <h3 className="text-base font-bold text-slate-900">
                  Compiled Dossier Pack
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPack(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-500">
              The following legal and delivery proofs have been verified and packaged into a PDF bundle suitable for Section 18 MSME Facilitation Council filing:
            </p>

            <div className="flex flex-col gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              {selectedPack.documents_included.map((docName: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">{docName}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedPack(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  alert('Downloading compiled MSME Samadhaan Dossier (ZIP / PDF)...');
                  setSelectedPack(null);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download Dossier Bundle</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
