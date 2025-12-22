'use client';

import React, { forwardRef, useId, useState } from 'react';

import { Eye, EyeOff } from 'lucide-react';

import { cn } from '@/lib/utils';

interface KPasswordProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  isLogin?: boolean;
}

const KPassword = forwardRef<HTMLInputElement, KPasswordProps>(
  ({ className, label, onChange, isLogin = false, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasContent, setHasContent] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const generatedId = useId();
    const inputId = props.id ?? `k-password-${generatedId}`;

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

    /* -------------------------------- LOGIN VARIANT -------------------------------- */
    if (isLogin) {
      return (
        <div className="relative flex flex-col gap-1">
          <label
            id={`floating-label-${inputId}`}
            htmlFor={inputId}
            className="text-sm text-primary-blue-100 cursor-default"
          >
            {label}
          </label>

          <input
            id={inputId}
            ref={ref}
            type={inputType}
            className={cn(
              'k-input px-4 h-[52px] bg-secondary-blue-500',
              className
            )}
            aria-labelledby={`floating-label-${inputId}`}
            onChange={handleChange}
            {...props}
          />

          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute cursor-pointer right-3 top-[68%] -translate-y-1/2 p-1 rounded-md hover:bg-accent transition-colors"
            aria-label={ariaLabel}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-primary-blue-100" />
            ) : (
              <Eye className="h-5 w-5 text-primary-blue-100" />
            )}
          </button>
        </div>
      );
    }

    /* ------------------------------ FLOATING LABEL VARIANT ------------------------------ */
    return (
      <div className="relative">
        <input
          ref={ref}
          type={inputType}
          className={cn(
            'k-input px-4 pb-2.5 pt-6 h-[52px] bg-secondary-blue-500',
            className
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={handleChange}
          aria-labelledby={`floating-label-${inputId}`}
          {...props}
        />

        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-1/2 cursor-pointer -translate-y-1/2 p-1 rounded-md hover:bg-accent transition-colors"
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
          id={`floating-label-${inputId}`}
          htmlFor={inputId}
          className={cn(
            'absolute left-4 text-primary-blue-100 transition-all duration-200 pointer-events-none',
            isFocused || hasContent ? 'top-2 text-xs' : 'top-4 text-sm'
          )}
        >
          {label}
        </label>
      </div>
    );
  }
);

KPassword.displayName = 'KPassword';

export { KPassword };
