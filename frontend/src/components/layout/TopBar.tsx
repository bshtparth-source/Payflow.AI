'use client';

import React from 'react';
import { Search, Download, Bell, User } from 'lucide-react';

export function TopBar() {
  return (
    <header className="fixed top-0 left-[260px] right-0 h-[68px] bg-white/95 backdrop-blur border-b border-slate-200 z-40 px-8 flex items-center justify-between gap-4">
      {/* Search Input */}
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search buyers, invoices, GSTIN... (⌘K)"
            className="w-full h-10 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Demo Environment Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full border border-slate-200/60">
          <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
          <span className="text-xs text-slate-600 font-medium">Demo Environment</span>
        </div>

        {/* Export Summary Action */}
        <button
          type="button"
          onClick={() => alert('Exporting consolidated ledger summary PDF/Excel...')}
          className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export Summary</span>
        </button>

        {/* Notifications Icon with Counter */}
        <button
          type="button"
          className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-700 text-white text-[10px] font-bold">
            3
          </span>
        </button>

        {/* Static Business User Badge (NO logout, NO dropdown) */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700">
            <User className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-800 leading-tight">
              Rajesh Mehta
            </span>
            <span className="text-[11px] text-slate-500 leading-tight">
              Finance Lead
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
