'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Reminder, Invoice, Buyer } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import {
  BellRing,
  Send,
  MessageSquare,
  Mail,
  Copy,
  Check,
  Clock,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  // Reminder generator state
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>('buy_005');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('inv_001');
  const [selectedTone, setSelectedTone] = useState<'GENTLE' | 'FIRM' | 'URGENT' | 'LEGAL_NOTICE'>('URGENT');
  const [selectedChannel, setSelectedChannel] = useState<'WHATSAPP' | 'EMAIL'>('WHATSAPP');
  const [activeDraft, setActiveDraft] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [rem, b, inv] = await Promise.all([
          api.getReminders(),
          api.getBuyers(),
          api.getInvoices(),
        ]);
        setReminders(rem);
        setBuyers(b);
        setInvoices(inv);
      } catch (err) {
        console.error('Error loading reminders:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Update draft template when tone/buyer/channel changes
  useEffect(() => {
    const selectedBuyer = buyers.find((b) => b.id === selectedBuyerId);
    const selectedInv = invoices.find((i) => i.id === selectedInvoiceId);

    const buyerName = selectedBuyer ? selectedBuyer.name : 'Counterparty';
    const invNo = selectedInv ? selectedInv.invoice_number : 'INV-2026-089';
    const amount = selectedInv ? (selectedInv.amount_paise / 100).toLocaleString('en-IN') : '2,20,000';
    const dueDate = selectedInv ? formatDate(selectedInv.due_date) : '14-Sep-2026';

    let body = '';
    if (selectedTone === 'GENTLE') {
      body = `Namaste ${buyerName} team,\n\nThis is a courteous reminder that Invoice #${invNo} for ₹${amount} was due on ${dueDate}. Kindly review and share the expected disbursement schedule.\n\nThank you for your partnership.\nAccounts Team, Kaveri Industrial Supplies`;
    } else if (selectedTone === 'FIRM') {
      body = `Dear Accounts Team at ${buyerName},\n\nWe refer to outstanding Invoice #${invNo} for ₹${amount}, which reached maturity on ${dueDate} and is now overdue. We have not yet received the payment confirmation or UTR reference. Kindly prioritize this remittance today.\n\nRegards,\nFinance Division, Kaveri Industrial Supplies`;
    } else if (selectedTone === 'URGENT') {
      body = `URGENT ATTENTION: Finance Director, ${buyerName}\n\nInvoice #${invNo} for ₹${amount} is critically overdue (Due date: ${dueDate}). The payment commitment made for this account has lapsed. Kindly share the RTGS / NEFT UTR reference by 5:00 PM today to avoid operational hold.\n\nRajesh Mehta, Finance Lead`;
    } else {
      body = `FORMAL NOTICE PRIOR TO MSME SAMADHAAN FILING\n\nTo: ${buyerName}\nRef: Outstanding Principal Amount ₹${amount} under Invoice #${invNo}\n\nNotice is hereby given that under Section 15 of the MSMED Act 2006, payment was due on ${dueDate}. In case of non-realization within 5 working days, this matter will be escalated to the MSME Facilitation Council with statutory compound interest.\n\nAuthorized Signatory, Kaveri Industrial Supplies`;
    }

    setActiveDraft(body);
  }, [selectedBuyerId, selectedInvoiceId, selectedTone, selectedChannel, buyers, invoices]);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendDraft = () => {
    if (selectedChannel === 'WHATSAPP') {
      const url = `https://wa.me/?text=${encodeURIComponent(activeDraft)}`;
      window.open(url, '_blank');
    } else {
      const subject = encodeURIComponent(`Payment Follow-up: Invoice #${selectedInvoiceId}`);
      const body = encodeURIComponent(activeDraft);
      window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span>Home</span>
          <span>/</span>
          <span className="text-indigo-700 font-semibold">Payment Recovery</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Tone-Calibrated Reminders
        </h1>
        <p className="text-sm text-slate-600">
          Automate professional payment recovery follow-ups across WhatsApp and Email. Calibrated dynamically based on counterparty reliability tier.
        </p>
      </div>

      {/* Interactive Generator & Message Preview Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Generator Controls */}
        <div className="col-span-12 lg:col-span-6 bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-700" />
            <h3 className="text-base font-bold text-slate-900">
              Draft Recovery Notification
            </h3>
          </div>

          {/* Select Buyer */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Select Counterparty Buyer
            </label>
            <select
              value={selectedBuyerId}
              onChange={(e) => setSelectedBuyerId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-indigo-600/20"
            >
              {buyers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.reliability_tier || 'No tier'})
                </option>
              ))}
            </select>
          </div>

          {/* Select Invoice */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Target Overdue Invoice
            </label>
            <select
              value={selectedInvoiceId}
              onChange={(e) => setSelectedInvoiceId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-indigo-600/20 font-mono"
            >
              {invoices
                .filter((i) => i.buyer_id === selectedBuyerId || i.status === 'OVERDUE')
                .map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoice_number} — ₹{(inv.amount_paise / 100).toLocaleString('en-IN')} (Due: {formatDate(inv.due_date)})
                  </option>
                ))}
            </select>
          </div>

          {/* Tone Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">
              Follow-up Escalation Tone
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'GENTLE', label: 'Gentle', desc: '0–7 days' },
                { id: 'FIRM', label: 'Firm', desc: '8–20 days' },
                { id: 'URGENT', label: 'Urgent', desc: '21–45 days' },
                { id: 'LEGAL_NOTICE', label: 'Legal Notice', desc: '45+ days' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTone(t.id as any)}
                  className={`p-2.5 rounded-lg border text-left flex flex-col transition-all ${
                    selectedTone === t.id
                      ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900">{t.label}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Channel Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">
              Dispatch Channel
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedChannel('WHATSAPP')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                  selectedChannel === 'WHATSAPP'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp Business</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedChannel('EMAIL')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                  selectedChannel === 'EMAIL'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-800 ring-1 ring-indigo-500'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Mail className="w-4 h-4 text-indigo-600" />
                <span>Official Email</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Draft Preview & Direct Actions */}
        <div className="col-span-12 lg:col-span-6 bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Live Preview ({selectedChannel})
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Tone: {selectedTone}
              </span>
            </div>

            {/* Bubble Container */}
            <div
              className={`p-4 rounded-xl border font-sans text-xs whitespace-pre-line leading-relaxed ${
                selectedChannel === 'WHATSAPP'
                  ? 'bg-emerald-50/40 border-emerald-200 text-slate-800'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              {activeDraft}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>

            <button
              type="button"
              onClick={handleSendDraft}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-sm transition-colors ${
                selectedChannel === 'WHATSAPP'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-indigo-700 hover:bg-indigo-800'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>{selectedChannel === 'WHATSAPP' ? 'Open in WhatsApp' : 'Dispatch Email'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Historical Reminders Log */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900">
            Recent Follow-up Activity Log
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Recipient Buyer</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Tone</th>
                <th className="py-3 px-4">Draft Content Summary</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Date Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reminders.map((rem) => (
                <tr key={rem.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {rem.buyer_name}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">
                    {rem.channel}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    {rem.tone}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                    {rem.message_body}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {rem.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-500">
                    {formatDate(rem.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
