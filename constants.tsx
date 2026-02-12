
import React from 'react';
import { LeadStatus, Priority } from './types';

export const STATUS_COLORS: Record<LeadStatus, string> = {
  [LeadStatus.NEW]: 'bg-blue-100 text-blue-700 border-blue-200',
  [LeadStatus.CONTACTED]: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  [LeadStatus.FOLLOW_UP]: 'bg-amber-100 text-amber-700 border-amber-200',
  [LeadStatus.CONVERTED]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  [LeadStatus.LOST]: 'bg-rose-100 text-rose-700 border-rose-200',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  [Priority.LOW]: 'bg-slate-100 text-slate-600',
  [Priority.MEDIUM]: 'bg-orange-100 text-orange-600',
  [Priority.HIGH]: 'bg-red-100 text-red-600 font-semibold',
};

export const SOURCES = ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Email Campaign', 'Event'];
