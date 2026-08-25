import { Link } from 'react-router-dom';
import { useDashboardStats, useRecentActivity } from '@/hooks/useDashboard';
import { StatCards } from '@/components/dashboard/StatCards';
import { StatusBreakdown } from '@/components/dashboard/StatusBreakdown';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';

const RECENT_ACTIVITY_LIMIT = 5;

export function DashboardPage() {
  const statsQuery = useDashboardStats();
  const recentQuery = useRecentActivity(RECENT_ACTIVITY_LIMIT);

  if (statsQuery.isLoading) {
    return <DashboardSkeleton />;
  }

  if (statsQuery.isError) {
    return (
      <ErrorState
        title="Couldn't load your dashboard"
        error={statsQuery.error}
        onRetry={() => statsQuery.refetch()}
      />
    );
  }

  const stats = statsQuery.data!;

  if (stats.totalApplications === 0) {
    return (
      <EmptyState
        title="No applications yet"
        description="Track the jobs you've applied to and monitor your progress from this dashboard. Add your first job to get started."
      >
        <Link
          to="/jobs"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Browse jobs
        </Link>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your job search</p>
      </div>

      <StatCards stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <StatusBreakdown byStatus={stats.byStatus} />
        <RecentActivity
          applications={recentQuery.data ?? []}
          isLoading={recentQuery.isLoading}
          isError={recentQuery.isError}
          error={recentQuery.error}
          onRetry={() => recentQuery.refetch()}
        />
      </div>
    </div>
  );
}
