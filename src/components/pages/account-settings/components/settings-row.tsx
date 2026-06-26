import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface SettingsRowProps {
  /** Optional leading control, e.g. a Switch, rendered before the label. */
  leading?: ReactNode;
  label: ReactNode;
  description?: ReactNode;
  /** Trailing control, e.g. a number input, badge, or value. */
  control?: ReactNode;
  /** Optional content rendered on its own line below the row (e.g. a checkbox). */
  children?: ReactNode;
  /** Render the bottom divider. Defaults to true; pass false on the last row. */
  divider?: boolean;
  className?: string;
}

/**
 * Compact list-row used inside a SettingsSection. Label + microcopy on the
 * left, an inline control on the right, separated from the next row by a
 * subtle divider — denser than the previous bordered-box layout.
 */
export function SettingsRow({
  leading,
  label,
  description,
  control,
  children,
  divider = true,
  className,
}: SettingsRowProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 py-3.5',
        divider && 'border-b border-secondary-blue-400/60',
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          {leading}
          <div className="min-w-0">
            <p className="text-sm font-medium text-white">{label}</p>
            {description && (
              <p className="text-xs text-gray-400 mt-0.5">{description}</p>
            )}
          </div>
        </div>
        {control && <div className="shrink-0">{control}</div>}
      </div>
      {children}
    </div>
  );
}
