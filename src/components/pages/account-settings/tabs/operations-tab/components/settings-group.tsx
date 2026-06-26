import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface SettingsGroupProps {
  children: ReactNode;
  className?: string;
}

/**
 * Inner container ("well") that groups related SettingsRows on a darker
 * surface, creating clear color separation from the section card behind it.
 */
export function SettingsGroup({ children, className }: SettingsGroupProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-secondary-blue-400 bg-secondary-blue-700 px-4',
        className
      )}
    >
      {children}
    </div>
  );
}
