import api from './client';
import type { Application, DashboardStats } from '@/types';

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>('/dashboard/stats');
  return data;
}

export async function getRecentActivity(limit = 5): Promise<Application[]> {
  const { data } = await api.get<Application[]>('/dashboard/recent', {
    params: { limit },
  });
  return data;
}
