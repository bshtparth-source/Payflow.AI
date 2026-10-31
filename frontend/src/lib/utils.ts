import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats paise (integers) to Indian Rupee currency format (e.g., ₹1,20,000).
 */
export function formatINR(paise: number): string {
  const rupees = Math.round(paise / 100);
  return '₹' + rupees.toLocaleString('en-IN');
}

/**
 * Formats rupees directly into Indian Rupee notation (e.g. ₹8.5L or full number).
 */
export function formatINRLakhs(rupees: number): string {
  if (rupees >= 10000000) {
    return `₹${(rupees / 10000000).toFixed(1)}Cr`;
  }
  if (rupees >= 100000) {
    return `₹${(rupees / 100000).toFixed(1)}L`;
  }
  return '₹' + rupees.toLocaleString('en-IN');
}

/**
 * Formats ISO date string to DD MMM YYYY.
 */
export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Returns badge styling tokens for buyer reliability tiers.
 */
export function getReliabilityTierTokens(tier?: string) {
  switch (tier) {
    case 'Highly reliable':
      return {
        bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        dot: 'bg-emerald-600',
        stroke: '#16A34A',
      };
    case 'Reliable':
      return {
        bg: 'bg-lime-50 border-lime-200 text-lime-800',
        dot: 'bg-lime-600',
        stroke: '#65A30D',
      };
    case 'Moderate reliability':
      return {
        bg: 'bg-amber-50 border-amber-200 text-amber-800',
        dot: 'bg-amber-600',
        stroke: '#D97706',
      };
    case 'Needs attention':
      return {
        bg: 'bg-orange-50 border-orange-200 text-orange-800',
        dot: 'bg-orange-600',
        stroke: '#EA580C',
      };
    case 'High payment risk':
      return {
        bg: 'bg-rose-50 border-rose-200 text-rose-800',
        dot: 'bg-rose-600',
        stroke: '#DC2626',
      };
    case 'Insufficient history':
    default:
      return {
        bg: 'bg-slate-100 border-slate-200 text-slate-700',
        dot: 'bg-slate-500',
        stroke: '#64748B',
      };
  }
}
