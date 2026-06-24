'use client';

import * as React from 'react';

import { Progress as ProgressPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    gradient?: boolean;
  }
>(({ className, value, gradient = false, ...props }, ref) => {
  const safeValue = value ?? 0;

  const getColor = (val: number) => {
    if (gradient) {
      return 'linear-gradient(to right, var(--color-neutral-green-500) 5%, var(--color-status-warning) 30%, var(--color-status-danger) 60%, var(--color-status-critical) 100%)';
    }
    if (val >= 90) return 'var(--color-status-critical)';
    if (val >= 70) return 'var(--color-status-danger)';
    if (val >= 40) return 'var(--color-status-warning)';
    return 'var(--color-neutral-green-500)';
  };

  const adjustedValue = safeValue;

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-md bg-gray-600',
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full flex-1 transition-all rounded-md"
        style={{
          transform: `translateX(-${100 - adjustedValue}%)`,
          background: getColor(safeValue),
        }}
      />
    </ProgressPrimitive.Root>
  );
});

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
