import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export function ErrorState({ title = 'An error occurred', message, onRetry }: { title?: string; message: string; onRetry?: () => void }) {
  return (
    <div className="flex w-full flex-col items-center justify-center rounded-xl border border-error/20 bg-error/5 p-8 text-center">
      <AlertTriangle className="mb-4 h-10 w-10 text-error" />
      <h3 className="mb-2 text-lg font-semibold text-text-primary">{title}</h3>
      <p className="mb-6 max-w-md text-sm text-text-secondary">{message}</p>
      {onRetry && (
        <Button variant="danger" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
