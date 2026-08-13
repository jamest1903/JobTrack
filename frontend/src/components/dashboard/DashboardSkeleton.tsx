export function DashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading dashboard">
      <div className="space-y-1">
        <div className="h-7 w-40 animate-pulse rounded bg-secondary" />
        <div className="h-4 w-64 animate-pulse rounded bg-secondary" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-lg border bg-card p-4">
            <div className="h-3 w-24 animate-pulse rounded bg-secondary" />
            <div className="mt-3 h-7 w-10 animate-pulse rounded bg-secondary" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-lg border bg-card" />
        <div className="h-64 animate-pulse rounded-lg border bg-card" />
      </div>
    </div>
  );
}
