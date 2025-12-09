'use client';

import React, { forwardRef, useState } from 'react';

import { cn } from '@/lib/utils';

interface KDateInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'size'
> {
  label: string;
  className?: string;
  size?: 'sm' | 'default';
}

const KDateInput = forwardRef<HTMLInputElement, KDateInputProps>(
  ({ className, label, onChange, value, size = 'default', ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    // Convert ISO date string to DD/MM/YYYY format
    const formatISOToDisplay = (isoString: string) => {
      if (!isoString) return '';
      try {
        const date = new Date(isoString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      } catch {
        return '';
      }
    };

    // Convert DD/MM/YYYY to ISO date string
    const formatDisplayToISO = (displayDate: string) => {
      if (!displayDate || displayDate.length !== 10) return '';
      const [day, month, year] = displayDate.split('/');
      if (!day || !month || !year || year.length !== 4) return '';
      try {
        const date = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day)
        );
        return date.toISOString();
      } catch {
        return '';
      }
    };

    // Get display value from form value
    const displayValue =
      typeof value === 'string' && value.includes('T')
        ? formatISOToDisplay(value)
        : (value as string) || '';

    const formatDateInput = (input: string) => {
      // Remove all non-numeric characters
      const numbers = input.replace(/\D/g, '');

      // Apply DD/MM/YYYY formatting
      if (numbers.length <= 2) {
        return numbers;
      } else if (numbers.length <= 4) {
        return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
      } else {
        return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatDateInput(e.target.value);

      // Convert to ISO format if complete date (DD/MM/YYYY)
      const valueToSend =
        formatted.length === 10 ? formatDisplayToISO(formatted) : formatted;

      // Create a new event with the appropriate value
      const newEvent = {
        ...e,
        target: {
          ...e.target,
          value: valueToSend,
        },
      };

      onChange?.(newEvent);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow backspace, delete, tab, escape, enter
      if ([8, 9, 27, 13, 46].includes(e.keyCode)) {
        return;
      }

      // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      if (e.ctrlKey && [65, 67, 86, 88].includes(e.keyCode)) {
        return;
      }

      // Only allow numbers
      const isNumber =
        (e.keyCode >= 48 && e.keyCode <= 57) || // top row
        (e.keyCode >= 96 && e.keyCode <= 105); // numpad

      if (!isNumber) {
        e.preventDefault();
      }
    };

    const hasContent = displayValue.trim().length > 0;

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    return (
      <div className="relative">
        <input
          type="text"
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
          onKeyDown={handleKeyDown}
          placeholder=""
          maxLength={10} // DD/MM/YYYY = 10 characters
          value={displayValue}
          aria-labelledby={`floating-label-${label.replace(/\s+/g, '-').toLowerCase()}`}
          autoComplete="off"
        />
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
        </label>
        {!hasContent && !isFocused && (
          <div
            className={cn(
              'absolute text-primary-blue-300 pointer-events-none',
              size === 'sm'
                ? 'right-3 top-2.5 text-sm'
                : 'right-4 top-3.5 text-sm'
            )}
          >
            DD/MM/YYYY
          </div>
        )}
      </div>
    );
  }
);

KDateInput.displayName = 'KDateInput';

export { KDateInput };
