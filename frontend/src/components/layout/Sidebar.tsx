'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Sparkles,
  Users,
  Receipt,
  Radar,
  Wallet,
  BellRing,
  Scale,
  HelpCircle,
  Building2,
  ChevronsUpDown,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Assistant', href: '/assistant', icon: Sparkles },
  { name: 'Buyers', href: '/buyers', icon: Users },
  { name: 'Invoices', href: '/invoices', icon: Receipt },
  { name: 'Risk Radar', href: '/risk-radar', icon: Radar },
  { name: 'Cash Flow', href: '/cashflow', icon: Wallet },
  { name: 'Reminders', href: '/reminders', icon: BellRing },
  { name: 'Disputes', href: '/disputes', icon: Scale },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] bg-white border-r border-slate-200 z-50 flex flex-col justify-between select-none">
      <div className="flex flex-col">
        {/* Brand header */}
        <div className="h-[68px] px-4 flex flex-col justify-center border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-700 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              P
            </div>
            <span className="font-semibold text-lg text-indigo-900 tracking-tight">
              PayFlow AI
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium tracking-wide mt-0.5">
            Buyer Reliability Platform
          </span>
        </div>

        {/* Navigation */}
        <nav className="p-3 flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-800 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Static Business Info */}
      <div className="p-3 flex flex-col gap-2 border-t border-slate-100">
        <a
          href="https://github.com/bshtparth-source/Payflow.AI"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Documentation & GitHub</span>
        </a>

        {/* Static Business Badge (NO auth, NO logout, NO dropdown) */}
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <div className="flex flex-col min-w-0 pr-2">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-700 shrink-0" />
              <span className="text-xs font-semibold text-slate-900 truncate">
                Kaveri Industrial Supplies
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono truncate mt-0.5">
              GSTIN: 27AABCU9603R1ZM
            </span>
          </div>
          <ChevronsUpDown className="w-4 h-4 text-slate-400 shrink-0 opacity-50" />
        </div>
      </div>
    </aside>
  );
}
