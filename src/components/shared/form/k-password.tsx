'use client';

import React, { forwardRef, useState } from 'react';

import { Eye, EyeOff } from 'lucide-react';

import { cn } from '@/lib/utils';

interface KPasswordProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const KPassword = forwardRef<HTMLInputElement, KPasswordProps>(
  ({ className, label, onChange, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasContent, setHasContent] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasContent(e.target.value.trim().length > 0);
      onChange?.(e);
    };

    const togglePasswordVisibility = (e: React.MouseEvent) => {
      e.preventDefault();
      setShowPassword((prev) => !prev);
    };

    const inputType = showPassword ? 'text' : 'password';
    const ariaLabel = showPassword ? 'Hide password' : 'Show password';

    return (
      <div className="relative">
        <div className="relative">
          <input
            type={inputType}
            className={cn(
              'k-input px-4 pb-2.5 pt-6 bg-secondary-blue-500',
              className
            )}
            ref={ref}
            {...props}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            aria-labelledby={`floating-label-${label.replace(/\s+/g, '-').toLowerCase()}`}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
            aria-label={ariaLabel}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-primary-blue-100" />
            ) : (
              <Eye className="h-5 w-5 text-primary-blue-100" />
            )}
          </button>
          <label
            id={`floating-label-${label.replace(/\s+/g, '-').toLowerCase()}`}
            className={cn(
              'text-sm text-primary-blue-100 absolute left-4 transition-all duration-200 pointer-events-none',
              isFocused || hasContent ? 'top-2 text-xs' : 'top-4 text-sm'
            )}
          >
            {label}
          </label>
        </div>
      </div>
    );
  }
);

KPassword.displayName = 'KPassword';

export { KPassword };
