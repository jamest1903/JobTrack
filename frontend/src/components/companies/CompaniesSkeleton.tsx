export function CompaniesSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading companies">
      <div className="h-7 w-40 animate-pulse rounded bg-secondary" />
      <div className="flex gap-3">
        <div className="h-9 flex-1 animate-pulse rounded bg-secondary" />
        <div className="h-9 w-32 animate-pulse rounded bg-secondary" />
      </div>
      <div className="rounded-lg border bg-card">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b px-4 py-3 last:border-b-0"
          >
            <div className="h-4 flex-1 animate-pulse rounded bg-secondary" />
            <div className="hidden h-4 w-24 animate-pulse rounded bg-secondary sm:block" />
            <div className="hidden h-4 w-32 animate-pulse rounded bg-secondary md:block" />
            <div className="h-4 w-16 animate-pulse rounded bg-secondary" />
          </div>
        ))}
      </div>
    </div>
  );
}
