import { STATUS_META, type ApplicationStatus } from '@/lib/applicationStatus';
import { cn } from '@/lib/utils';

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        meta.badge,
      )}
    >
      {meta.label}
    </span>
  );
}
