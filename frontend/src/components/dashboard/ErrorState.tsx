import { AlertTriangle } from 'lucide-react';
import { getErrorMessage } from '@/api/errors';

interface ErrorStateProps {
  title: string;
  error?: unknown;
  onRetry?: () => void;
}

export function ErrorState({ title, error, onRetry }: ErrorStateProps) {
  return (
    <div
      className="flex flex-col items-center gap-3 rounded-lg border bg-card p-8 text-center"
      role="alert"
    >
      <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden="true" />
      <h1 className="text-lg font-semibold">{title}</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        {getErrorMessage(error)}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Try again
        </button>
      )}
    </div>
  );
}
