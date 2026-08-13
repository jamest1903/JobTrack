import type { DashboardStats } from '@/types';
import { BY_STATUS_KEY, STATUS_META, STATUS_ORDER } from '@/lib/applicationStatus';
import { cn } from '@/lib/utils';

interface StatusBreakdownProps {
  byStatus: DashboardStats['byStatus'];
}

export function StatusBreakdown({ byStatus }: StatusBreakdownProps) {
  const total = STATUS_ORDER.reduce(
    (sum, status) => sum + byStatus[BY_STATUS_KEY[status]],
    0,
  );

  return (
    <section
      aria-labelledby="status-breakdown-heading"
      className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
    >
      <h2 id="status-breakdown-heading" className="mb-4 text-sm font-semibold">
        Applications by status
      </h2>
      {total === 0 ? (
        <p className="text-sm text-muted-foreground">No applications tracked yet.</p>
      ) : (
        <ul className="space-y-3">
          {STATUS_ORDER.map((status) => {
            const meta = STATUS_META[status];
            const count = byStatus[BY_STATUS_KEY[status]];
            const percentage = total > 0 ? (count / total) * 100 : 0;
            return (
              <li key={status}>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span
                      className={cn('h-2.5 w-2.5 rounded-full', meta.dot)}
                      aria-hidden="true"
                    />
                    {meta.label}
                  </span>
                  <span className="font-medium">{count}</span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn('h-full rounded-full', meta.bar)}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
