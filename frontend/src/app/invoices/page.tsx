'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Invoice } from '@/lib/types';
import { formatINR, formatDate } from '@/lib/utils';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Filter,
  DollarSign,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  // Payment recording modal
  const [activePaymentInvoice, setActivePaymentInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadInvoices() {
      try {
        const data = await api.getInvoices();
        setInvoices(data);
      } catch (err) {
        console.error('Failed to load invoices:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInvoices();
  }, []);

  const handleSimulatedUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await api.uploadInvoiceDocument(formData);
      setUploadResult(result);
    } catch {
      alert('Upload failed. Please check file format.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmExtractedInvoice = async () => {
    if (!uploadResult) return;
    const { extracted_data } = uploadResult;

    try {
      const newInv = await api.createInvoice({
        buyer_name: extracted_data.buyer_name,
        invoice_number: extracted_data.invoice_number,
        amount_paise: extracted_data.amount_paise,
        issue_date: extracted_data.issue_date,
        due_date: extracted_data.due_date,
        payment_terms_days: extracted_data.payment_terms_days,
        status: 'ISSUED',
      });
      setInvoices((prev) => [newInv, ...prev]);
      setUploadResult(null);
      alert('Invoice successfully confirmed and added to ledger!');
    } catch (err) {
      alert('Error creating invoice');
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePaymentInvoice) return;

    try {
      const amountPaise = Math.round(parseFloat(paymentAmount) * 100);
      await api.recordInvoicePayment(activePaymentInvoice.id, {
        amount_paise: amountPaise,
        payment_date: new Date().toISOString().split('T')[0],
      });
      setPaymentSuccess(`Payment of ₹${paymentAmount} recorded successfully!`);

      // Update local invoice state
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === activePaymentInvoice.id
            ? {
                ...inv,
                paid_amount_paise: inv.paid_amount_paise + amountPaise,
                status:
                  inv.paid_amount_paise + amountPaise >= inv.amount_paise ? 'PAID' : 'PARTIALLY_PAID',
              }
            : inv
        )
      );

      setTimeout(() => {
        setActivePaymentInvoice(null);
        setPaymentSuccess(null);
        setPaymentAmount('');
      }, 2000);
    } catch {
      alert('Failed to record payment');
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.buyer_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span>Home</span>
          <span>/</span>
          <span className="text-indigo-700 font-semibold">Invoices & Extraction</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Invoices & OCR Ingestion
        </h1>
        <p className="text-sm text-slate-600">
          Upload PDF invoices, scanned PO documents, or Tally ledger XML files for instant AI extraction of credit terms.
        </p>
      </div>

      {/* AI Upload Dropzone & Extracted Preview Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-700" />
            <h3 className="text-base font-bold text-slate-900">
              AI Invoice & PO Extraction Engine
            </h3>
          </div>
          <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded-full border border-indigo-200">
            Powered by OCR & LayoutLM
          </span>
        </div>

        {/* Dropzone */}
        <label className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors text-center">
          <UploadCloud className="w-10 h-10 text-indigo-600" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-800">
              Click to upload or drag & drop invoice document
            </span>
            <span className="text-xs text-slate-500 mt-0.5">
              Supports Tax Invoice PDF, scanned PO, e-Way bill PNG/JPG, or Tally XML
            </span>
          </div>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.xml"
            onChange={handleSimulatedUpload}
            className="hidden"
          />
        </label>

        {isUploading && (
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center gap-3 text-xs text-indigo-800">
            <Clock className="w-5 h-5 animate-spin text-indigo-600" />
            <span>Parsing document layers, extracting GSTINs, terms, and calculating due dates...</span>
          </div>
        )}

        {/* Extracted preview card */}
        {uploadResult && (
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Document Extracted Successfully ({Math.round(uploadResult.confidence_score * 100)}% Confidence)</span>
              </div>
              <span className="text-xs font-mono text-slate-600">{uploadResult.file_name}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-4 rounded-lg border border-emerald-200/80 text-xs">
              <div>
                <span className="text-slate-500 block">Identified Buyer</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {uploadResult.extracted_data.buyer_name}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Invoice Number</span>
                <span className="font-bold font-mono text-slate-900 text-sm mt-0.5 block">
                  {uploadResult.extracted_data.invoice_number}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Extracted Amount</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {formatINR(uploadResult.extracted_data.amount_paise)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Payment Terms</span>
                <span className="font-bold text-indigo-700 text-sm mt-0.5 block">
                  Net {uploadResult.extracted_data.payment_terms_days} days
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setUploadResult(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleConfirmExtractedInvoice}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                Confirm & Add to Ledger
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Invoices List / Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
        {/* Table Filters */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by invoice # or buyer..."
              className="w-full h-9 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {['all', 'OVERDUE', 'ISSUED', 'PAID', 'DISPUTED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterStatus === st
                    ? 'bg-indigo-800 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st === 'all' ? 'All Invoices' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Buyer Counterparty</th>
                <th className="py-3.5 px-4">Issue Date</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-right">Settled</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {inv.invoice_number}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-900">
                    {inv.buyer_name}
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
                    {inv.status !== 'PAID' ? (
                      <button
                        type="button"
                        onClick={() => {
                          setActivePaymentInvoice(inv);
                          setPaymentAmount(
                            ((inv.amount_paise - inv.paid_amount_paise) / 100).toString()
                          );
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Record Payment</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Settled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {activePaymentInvoice && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl border border-slate-200 flex flex-col gap-4">
            <h3 className="text-base font-bold text-slate-900">
              Record Payment Receipt
            </h3>
            <p className="text-xs text-slate-500">
              Record full or partial realization for Invoice #{activePaymentInvoice.invoice_number} ({activePaymentInvoice.buyer_name}).
            </p>

            <form onSubmit={handleRecordPayment} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Amount Received (₹)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs tabular-nums focus:ring-2 focus:ring-indigo-600/20"
                />
              </div>

              {paymentSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{paymentSuccess}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActivePaymentInvoice(null)}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-700 hover:bg-indigo-800 transition-colors"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
