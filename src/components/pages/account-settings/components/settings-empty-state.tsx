import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

interface SettingsEmptyStateProps {
  icon: LucideIcon;
  title: string;
  hint?: string;
  className?: string;
}

/**
 * Shared empty/zero-state for settings sections: a tinted icon circle, a
 * primary message, and an optional hint line.
 */
export function SettingsEmptyState({
  icon: Icon,
  title,
  hint,
  className,
}: SettingsEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 text-center',
        className
      )}
    >
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary-green-500/10">
        <Icon className="h-8 w-8 text-primary-green-500" />
      </div>
      <p className="font-medium text-secondary-blue-200">{title}</p>
      {hint && <p className="mt-1 text-xs text-secondary-blue-300">{hint}</p>}
    </div>
  );
}
