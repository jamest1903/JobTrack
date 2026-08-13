import type { Application, DashboardStats } from '@/types';

export type ApplicationStatus = Application['status'];
export type ByStatusKey = keyof DashboardStats['byStatus'];

export const BY_STATUS_KEY: Record<ApplicationStatus, ByStatusKey> = {
  SAVED: 'saved',
  APPLYING: 'applying',
  APPLIED: 'applied',
  INTERVIEW: 'interview',
  OFFER: 'offer',
  REJECTED: 'rejected',
};

interface StatusMeta {
  label: string;
  dot: string;
  badge: string;
  bar: string;
}

export const STATUS_META: Record<ApplicationStatus, StatusMeta> = {
  SAVED: {
    label: 'Saved',
    dot: 'bg-slate-400',
    badge: 'bg-slate-100 text-slate-700',
    bar: 'bg-slate-400',
  },
  APPLYING: {
    label: 'Applying',
    dot: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-700',
    bar: 'bg-blue-500',
  },
  APPLIED: {
    label: 'Applied',
    dot: 'bg-indigo-500',
    badge: 'bg-indigo-100 text-indigo-700',
    bar: 'bg-indigo-500',
  },
  INTERVIEW: {
    label: 'Interview',
    dot: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-700',
    bar: 'bg-amber-500',
  },
  OFFER: {
    label: 'Offer',
    dot: 'bg-green-500',
    badge: 'bg-green-100 text-green-700',
    bar: 'bg-green-500',
  },
  REJECTED: {
    label: 'Rejected',
    dot: 'bg-red-500',
    badge: 'bg-red-100 text-red-700',
    bar: 'bg-red-500',
  },
};

export const STATUS_ORDER: ApplicationStatus[] = [
  'SAVED',
  'APPLYING',
  'APPLIED',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
];
