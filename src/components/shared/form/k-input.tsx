'use client';

import React, { forwardRef, useId, useState } from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface KInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'size'
> {
  label: string;
  className?: string;
  suffix?: string;
  maxLength?: number;
  mandetory?: boolean;
  size?: 'sm' | 'default';
  isLogin?: boolean;
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
      isLogin = false,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = props.id ?? `k-input-${generatedId}`;

    const [isFocused, setIsFocused] = useState(false);

    const hasContent =
      (typeof value === 'number' && !isNaN(value)) ||
      (typeof value === 'string' && value.trim().length > 0);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
    };

    /* -------------------------------- LOGIN INPUT -------------------------------- */
    if (isLogin) {
      return (
        <div className="relative flex flex-col gap-1">
          <label
            id={`floating-label-${inputId}`}
            htmlFor={inputId}
            className="text-sm text-primary-blue-100"
          >
            {label}
            {mandetory && <span className="text-alert-red-500 ml-px">*</span>}
          </label>

          <Input
            id={inputId}
            ref={ref}
            type={type}
            className={cn(
              'k-input bg-secondary-blue-500',
              size === 'sm' ? 'h-11' : 'h-[52px]',
              className
            )}
            placeholder=" "
            aria-labelledby={`floating-label-${inputId}`}
            autoComplete={props.autoComplete || 'off'}
            maxLength={maxLength}
            value={value}
            onChange={handleChange}
            {...props}
          />

          {suffix && (
            <span
              className={cn(
                'absolute right-3 p-1 text-primary-blue-100 bg-secondary-blue-500',
                size === 'sm' ? 'top-[35%]' : 'top-[55%]'
              )}
            >
              {suffix}
            </span>
          )}
        </div>
      );
    }

    /* ----------------------------- DEFAULT FLOATING INPUT ----------------------------- */
    return (
      <div className="relative">
        <Input
          id={inputId}
          ref={ref}
          type={type}
          className={cn(
            'k-input bg-secondary-blue-500',
            size === 'sm' ? 'px-3 pb-2 pt-5 h-11' : 'px-4 pb-2.5 pt-6 h-[52px]',
            className
          )}
          placeholder=" "
          autoComplete={props.autoComplete || 'off'}
          maxLength={maxLength}
          value={value ?? ''}
          onChange={handleChange}
          onFocusCapture={() => setIsFocused(true)}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setIsFocused(false);
            }
          }}
          {...props}
        />

        {suffix && (
          <span
            className={cn(
              'absolute right-3 p-1 text-primary-blue-100 bg-secondary-blue-500',
              size === 'sm' ? 'top-[35%]' : 'top-[42%]'
            )}
          >
            {suffix}
          </span>
        )}

        <label
          htmlFor={inputId}
          className={cn(
            'absolute text-primary-blue-100 transition-all pointer-events-none',
            size === 'sm' ? 'left-3' : 'left-4',
            isFocused || hasContent
              ? size === 'sm'
                ? 'top-1.5 text-[10px]'
                : 'top-1.5 text-xs'
              : size === 'sm'
                ? 'top-2.5 text-sm'
                : 'top-3.5 text-sm'
          )}
        >
          {label}
          {mandetory && <span className="text-alert-red-500 ml-px">*</span>}
        </label>
      </div>
    );
  }
);

KInput.displayName = 'KInput';

export { KInput };
