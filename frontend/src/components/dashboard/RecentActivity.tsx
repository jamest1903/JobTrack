import { Briefcase, Loader2 } from 'lucide-react';
import type { Application } from '@/types';
import { StatusBadge } from './StatusBadge';
import { formatDate } from '@/lib/format';
import { getErrorMessage } from '@/api/errors';

interface RecentActivityProps {
  applications: Application[];
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  onRetry?: () => void;
}

export function RecentActivity({
  applications,
  isLoading,
  isError,
  error,
  onRetry,
}: RecentActivityProps) {
  return (
    <section
      aria-labelledby="recent-activity-heading"
      className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
    >
      <h2 id="recent-activity-heading" className="mb-4 text-sm font-semibold">
        Recent activity
      </h2>

      {isLoading && (
        <div className="flex items-center justify-center py-8" role="status">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          <span className="text-sm text-muted-foreground">Loading recent activity...</span>
        </div>
      )}

      {isError && (
        <div
          className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
          role="alert"
        >
          <p>Couldn&apos;t load recent activity.</p>
          <p className="mt-1 text-xs">{getErrorMessage(error)}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 rounded-md bg-destructive px-3 py-1 text-xs font-medium text-destructive-foreground hover:bg-destructive/90"
            >
              Try again
            </button>
          )}
        </div>
      )}

      {!isLoading && !isError && applications.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <Briefcase className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">No recent activity yet.</p>
        </div>
      )}

      {!isLoading && !isError && applications.length > 0 && (
        <ul className="divide-y">
          {applications.map((application) => (
            <li key={application.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {application.job.title}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {application.job.company?.name ?? 'Unknown company'}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <StatusBadge status={application.status} />
                <time
                  dateTime={application.updatedAt}
                  className="text-xs text-muted-foreground"
                >
                  {formatDate(application.updatedAt)}
                </time>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
