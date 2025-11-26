'use client';

import React, { forwardRef, useState } from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface KInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  className?: string;
  suffix?: string;
  maxLength?: number;
  mandetory?: boolean;
  size?: 'sm' | 'default';
}

const KInput = forwardRef<HTMLInputElement, KInputProps>(
  (
    {
      className,
      label,
      mandetory,
      type,
      suffix,
      maxLength,
      onChange,
      value,
      size = 'default',
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const hasContent =
      (typeof value === 'number' && !isNaN(value)) ||
      (typeof value === 'string' && value.trim().length > 0);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
    };

    return (
      <div className="relative">
        <Input
          type={type}
          className={cn(
            'k-input bg-secondary-blue-500',
            size === 'sm' ? 'px-3 pb-2 pt-5 h-11' : 'px-4 pb-2.5 pt-6 h-[52px]',
            className
          )}
          ref={ref}
          {...props}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          placeholder=" "
          aria-labelledby={`floating-label-${label.replace(/\s+/g, '-').toLowerCase()}`}
          autoComplete={props.autoComplete || 'off'}
          maxLength={maxLength}
          value={value}
        />
        {suffix && (
          <span
            className={cn(
              'absolute right-3 p-1 text-primary-blue-100 text-sm font-normal leading-normal bg-secondary-blue-500',
              size === 'sm' ? 'top-[35%]' : 'top-[42%]'
            )}
          >
            {suffix}
          </span>
        )}
        <label
          id={`floating-label-${label.replace(/\s+/g, '-').toLowerCase()}`}
          htmlFor={props.id}
          className={cn(
            'text-sm text-primary-blue-100 absolute transition-all duration-200 pointer-events-none',
            size === 'sm' ? 'left-3' : 'left-4',
            isFocused || hasContent
              ? size === 'sm'
                ? 'top-1.5 text-[10px]'
                : 'top-1.5 text-xs'
              : size === 'sm'
                ? 'top-2.5 text-sm scale-90'
                : 'top-3.5 text-sm scale-100'
          )}
        >
          {label}
          {mandetory && (
            <span className="text-alert-red-500 text-sm font-normal leading-normal ml-px">
              *
            </span>
          )}
        </label>
      </div>
    );
  }
);

KInput.displayName = 'KInput';

export { KInput };
