import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

export type TabVariant = 'vertical' | 'underline';

export interface TabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
}

export interface KTabsProps {
  items: TabItem[];
  variant?: TabVariant;
  value?: string;
  onTabChange?: (value: string) => void;
  className?: string;
}

export function KTabs({
  items,
  variant = 'vertical',
  value,
  onTabChange,
  className,
}: KTabsProps) {
  return (
    <div
      className={cn(
        'w-full',
        {
          'flex flex-col': variant === 'vertical',
          'border-b border-secondary-blue-400': variant === 'underline',
        },
        className
      )}
    >
      {variant === 'vertical' ? (
        // Vertical Variant
        <nav className="flex flex-col gap-1.5">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = value === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange?.(item.id)}
                className={cn(
                  'relative flex items-center gap-2.5 px-4 md:px-8 py-2.5 h-10 text-[15px] leading-normal transition-colors hover:bg-secondary-blue-500 cursor-pointer',
                  {
                    'bg-secondary-blue-500 text-white before:absolute before:left-0 before:top-0 before:h-full before:w-[2px] before:bg-primary-green-100':
                      isActive,
                    'text-white': !isActive,
                  }
                )}
              >
                {Icon && (
                  <Icon
                    className={cn('h-5 w-5', {
                      'text-primary-green-200 transition-colors': isActive,
                      'text-white': !isActive,
                    })}
                  />
                )}
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </nav>
      ) : (
        // Underline Variant
        <nav className="px-2 flex w-full overflow-x-auto gap-4 md:gap-6">
          {items.map((item) => {
            const isActive = value === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange?.(item.id)}
                className={cn(
                  'flex-shrink-0 border-b-2 text-nowrap leading-normal h-7 pb-3 k-transition text-center text-sm md:text-[15px] font-normal transition-all cursor-pointer min-w-fit px-1',
                  {
                    'border-primary-green-200 text-primary-green-200': isActive,
                    'border-transparent text-white hover:text-primary-green-200':
                      !isActive,
                  }
                )}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
