import type { ReactNode } from 'react';

import type { LucideIcon } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SettingsSectionProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** Trailing header slot, e.g. dirty-state Save/Discard buttons. */
  headerAction?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

/**
 * Compact settings card shell shared across the Operations tab.
 * Renders the icon + title + description header with an optional trailing
 * action slot, on the standard secondary-blue surface.
 */
export function SettingsSection({
  icon: Icon,
  title,
  description,
  headerAction,
  children,
  className,
  contentClassName,
}: SettingsSectionProps) {
  return (
    <Card
      className={cn(
        'bg-secondary-blue-500/80 backdrop-blur-sm border-secondary-blue-400',
        className
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Icon className="h-5 w-5 text-primary-green-500 mt-0.5 shrink-0" />
            <div>
              <CardTitle className="text-white">{title}</CardTitle>
              {description && (
                <CardDescription className="text-secondary-blue-200 mt-1">
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
          {headerAction}
        </div>
      </CardHeader>
      <CardContent className={cn('pt-0', contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
