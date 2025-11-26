'use client';

import * as React from 'react';

import { X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type Option = {
  value: string;
  label: string;
  disabled?: boolean;
};

type KMultiSelectProps = {
  options: Option[];
  selected: Option[];
  onChange: (selected: Option[]) => void;
  placeholder?: string;
  className?: string;
  badgeClassName?: string;
  emptyMessage?: string;
  maxSelected?: number;
  disabled?: boolean;
  onFocus?: React.FocusEventHandler<HTMLDivElement>;
  onBlur?: React.FocusEventHandler<HTMLDivElement>;
};

export function KMultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select options...',
  className,
  badgeClassName,
  emptyMessage = 'No options found.',
  maxSelected,
  disabled = false,
  onFocus,
  onBlur,
}: KMultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');

  const handleUnselect = React.useCallback(
    (option: Option) => {
      onChange(selected.filter((s) => s.value !== option.value));
    },
    [onChange, selected]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Backspace' && !inputValue && selected.length > 0) {
        onChange(selected.slice(0, -1));
      }

      // Close dropdown on escape
      if (e.key === 'Escape') {
        setOpen(false);
      }
    },
    [inputValue, onChange, selected]
  );

  // Filter out options that are already selected or disabled
  const selectableOptions = options.filter(
    (option) =>
      !selected.some((s) => s.value === option.value) && !option.disabled
  );

  // Filter options based on input value
  const filteredOptions = selectableOptions.filter((option) =>
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  const isMaxSelected =
    maxSelected !== undefined && selected.length >= maxSelected;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            'w-full pt-6 pb-2 px-2.5 min-h-[52px] rounded-md text-white bg-secondary-blue-500 hover:outline-secondary-blue-400 hover:outline-1 shadow-none ring-0! hover:outline-solid focus:outline-solid focus:outline-1 focus:outline-primary-green-700 outline-transparent ease-in-out disabled:cursor-not-allowed text-sm disabled:opacity-50 resize-none overflow-hidden flex flex-wrap gap-1 py-2',
            disabled && 'cursor-not-allowed opacity-50',
            className
          )}
          onFocus={onFocus}
          onBlur={onBlur}
        >
          {selected.map((option) => {
            return (
              <Badge
                key={option.value}
                variant="secondary"
                className={badgeClassName}
              >
                {option.label}
                <button
                  type="button"
                  className="ml-1 rounded-full outline-hidden ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUnselect(option);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnselect(option);
                  }}
                  disabled={disabled}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  <span className="sr-only">Remove {option.label}</span>
                </button>
              </Badge>
            );
          })}
          {selected.length === 0 && (
            <span className="text-primary-blue-100 text-sm pointer-events-none">
              {placeholder}
            </span>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] pointer-events-auto shad-select-content p-0"
        align="start"
      >
        <div className="p-2 border-b border-primary-blue-400">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full px-3 py-2 bg-secondary-blue-500 text-white placeholder:text-primary-blue-100 border border-primary-blue-400 rounded-md outline-none focus:border-primary-green-700"
            placeholder="Search certifications..."
            disabled={disabled || isMaxSelected}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>
        <Command className="w-full">
          <CommandList
            className="max-h-[200px] overflow-y-auto"
            onWheel={(e) => {
              e.stopPropagation();
            }}
          >
            <CommandEmpty className="py-6 text-center text-sm text-primary-blue-100">
              {emptyMessage}
            </CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => {
                    onChange([...selected, option]);
                    setInputValue('');
                  }}
                  className="shad-select-item cursor-pointer"
                >
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
