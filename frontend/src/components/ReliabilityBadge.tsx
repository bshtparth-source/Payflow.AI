'use client';

import React from 'react';
import { getReliabilityTierTokens } from '@/lib/utils';

interface ReliabilityBadgeProps {
  tier?: string;
  size?: 'sm' | 'md';
}

export function ReliabilityBadge({ tier = 'Insufficient history', size = 'md' }: ReliabilityBadgeProps) {
  const tokens = getReliabilityTierTokens(tier);
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${tokens.bg} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${tokens.dot}`} />
      <span>{tier}</span>
    </span>
  );
}
