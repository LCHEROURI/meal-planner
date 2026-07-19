import type { ReactNode } from 'react';

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface p-12 text-center">
      <div className="mb-4 text-text-secondary opacity-80">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold text-text-primary">{title}</h3>
      <p className="mb-6 max-w-md text-sm text-text-secondary">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
