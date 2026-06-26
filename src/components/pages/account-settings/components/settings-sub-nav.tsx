import type { ReactNode } from 'react';

import { ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface SettingsSubNavItem {
  value: string;
  label: string;
}

interface SettingsSubNavProps {
  items: SettingsSubNavItem[];
  value: string;
  onValueChange: (value: string) => void;
  /** Optional leading context label, e.g. the selected gym name. */
  contextLabel?: ReactNode;
  className?: string;
}

/**
 * Secondary, pill-style section switcher. Visually subordinate to the
 * top-level underline tabs so the two navigation levels never look alike.
 */
export function SettingsSubNav({
  items,
  value,
  onValueChange,
  contextLabel,
  className,
}: SettingsSubNavProps) {
  return (
    <div
      className={cn('flex flex-wrap items-center gap-x-3 gap-y-2', className)}
    >
      {contextLabel && (
        <span className="flex min-w-0 items-center gap-1 text-sm text-secondary-blue-200">
          <span className="max-w-[180px] truncate font-medium text-white">
            {contextLabel}
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-secondary-blue-300" />
        </span>
      )}
      <div className="inline-flex items-center gap-1 rounded-full border border-secondary-blue-400 bg-secondary-blue-700 p-1">
        {items.map((item) => {
          const isActive = item.value === value;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onValueChange(item.value)}
              aria-pressed={isActive}
              className={cn(
                'cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium k-transition',
                isActive
                  ? 'bg-secondary-blue-500 text-white shadow-sm'
                  : 'text-secondary-blue-200 hover:text-white'
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
