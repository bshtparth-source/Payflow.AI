'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAF8FF]">
      <Sidebar />
      <div className="pl-[260px]">
        <TopBar />
        <main className="pt-[68px] min-h-screen px-8 py-8 max-w-[1440px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
