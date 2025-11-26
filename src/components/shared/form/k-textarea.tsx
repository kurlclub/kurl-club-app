'use client';

import React, { forwardRef, useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

interface KTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

const KTextarea = forwardRef<HTMLTextAreaElement, KTextareaProps>(
  ({ className, label, value, defaultValue, onChange, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const localRef = useRef<HTMLTextAreaElement | null>(null);

    // Ensure the floating label is positioned correctly on mount
    const hasContent =
      (typeof value === 'string' && value.trim().length > 0) ||
      (typeof defaultValue === 'string' && defaultValue.trim().length > 0);

    // Synchronize the forwarded ref with the internal ref
    const handleRef = (node: HTMLTextAreaElement | null) => {
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current =
          node;
      }
      localRef.current = node;
    };

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e);
      adjustTextareaHeight();
    };

    const adjustTextareaHeight = () => {
      if (localRef.current) {
        localRef.current.style.height = 'auto';
        localRef.current.style.height = `${localRef.current.scrollHeight}px`;
      }
    };

    // Ensure the textarea resizes on initial render
    useEffect(() => {
      adjustTextareaHeight();
    }, [value, defaultValue]);

    return (
      <div className="relative">
        <textarea
          className={cn(
            'w-full pt-6 pb-2 px-4 min-h-[80px] rounded-md text-white bg-secondary-blue-500 hover:outline-secondary-blue-400 hover:outline-1 shadow-none ring-0! hover:outline-solid focus:outline-solid focus:outline-1 focus:outline-primary-green-700 outline-transparent ease-in-out disabled:cursor-not-allowed text-sm disabled:opacity-50 resize-none overflow-hidden',
            isFocused || hasContent ? 'pt-6' : 'pt-3',
            className
          )}
          ref={handleRef}
          {...props}
          value={value}
          defaultValue={defaultValue}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          aria-labelledby={`floating-label-${label.replace(/\s+/g, '-').toLowerCase()}`}
        />
        <label
          id={`floating-label-${label.replace(/\s+/g, '-').toLowerCase()}`}
          className={cn(
            'text-sm text-primary-blue-100 absolute left-4 transition-all duration-200 pointer-events-none',
            isFocused || hasContent ? 'top-2 text-xs' : 'top-3 text-sm'
          )}
        >
          {label}
        </label>
      </div>
    );
  }
);

KTextarea.displayName = 'KTextarea';

export { KTextarea };
