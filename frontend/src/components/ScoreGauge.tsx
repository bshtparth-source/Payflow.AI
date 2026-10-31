'use client';

import React from 'react';
import { getReliabilityTierTokens } from '@/lib/utils';
import { HelpCircle } from 'lucide-react';

interface ScoreGaugeProps {
  score?: number | null;
  tier?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ScoreGauge({
  score,
  tier,
  size = 'md',
  showLabel = true,
}: ScoreGaugeProps) {
  const isInsufficient = score === null || score === undefined;
  const tokens = getReliabilityTierTokens(tier);

  const dimensions = {
    sm: { box: 'w-12 h-12', r: 16, stroke: 2.5, text: 'text-sm font-bold', sub: 'text-[8px]' },
    md: { box: 'w-16 h-16', r: 15.9155, stroke: 3, text: 'text-base font-bold', sub: 'text-[9px]' },
    lg: { box: 'w-24 h-24', r: 15.9155, stroke: 3.5, text: 'text-2xl font-bold', sub: 'text-[10px]' },
  }[size];

  // Circle perimeter ~ 100 for r=15.9155
  const strokeDashoffset = isInsufficient ? 0 : 100 - (score ?? 0);

  return (
    <div className={`relative ${dimensions.box} shrink-0 flex items-center justify-center`}>
      <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
        <path
          className="text-slate-100"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeWidth={dimensions.stroke}
        />
        {isInsufficient ? (
          <path
            className="text-slate-300"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth={dimensions.stroke}
            strokeDasharray="4, 3"
          />
        ) : (
          <path
            style={{ stroke: tokens.stroke }}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeDasharray="100, 100"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            strokeWidth={dimensions.stroke}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        {isInsufficient ? (
          <div className="flex flex-col items-center justify-center text-slate-400">
            <HelpCircle className="w-4 h-4" />
            <span className="text-[8px] font-medium mt-0.5">N/A</span>
          </div>
        ) : (
          <>
            <span className={`tabular-nums text-slate-900 ${dimensions.text}`}>
              {score}
            </span>
            {showLabel && (
              <span className={`font-semibold tracking-wider text-slate-500 uppercase ${dimensions.sub}`}>
                INDEX
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
