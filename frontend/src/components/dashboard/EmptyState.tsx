import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export function EmptyState({ title, description, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border bg-card p-8 text-center">
      <Inbox className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
      <h1 className="text-lg font-semibold">{title}</h1>
      {description && (
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      )}
      {children}
    </div>
  );
}
