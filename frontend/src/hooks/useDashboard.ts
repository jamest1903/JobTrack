import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getRecentActivity } from '@/api/dashboard';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: getDashboardStats,
  });
}

export function useRecentActivity(limit: number) {
  return useQuery({
    queryKey: ['dashboard', 'recent', limit],
    queryFn: () => getRecentActivity(limit),
  });
}
