'use client';

import { useState } from 'react';

import { Check, ChevronsUpDown } from 'lucide-react';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { COUNTRIES, type Country } from '@/lib/constants/countries';
import { cn } from '@/lib/utils';

interface CountrySelectProps {
  selected?: Country | null;
  onSelect: (country: Country) => void;
  disabled?: boolean;
}

/**
 * Single searchable country picker. Picking a country drives the gym's
 * currency, region, and dial code at once — the web equivalent of the mobile
 * country bottom sheet. Renders as a flag + name trigger that opens a cmdk
 * Command list in a popover.
 */
export function CountrySelect({
  selected,
  onSelect,
  disabled,
}: CountrySelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'flex w-full items-center justify-between gap-2 rounded-md border border-secondary-blue-400 bg-gray-50 dark:bg-secondary-blue-500 px-3 py-2.5 text-sm text-white transition-colors',
            'hover:border-primary-blue-200 focus:outline-hidden focus:ring-2 focus:ring-primary-blue-200/40',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        >
          {selected ? (
            <span className="flex items-center gap-2.5 truncate">
              <span className="text-lg leading-none">{selected.flag}</span>
              <span className="truncate font-medium">{selected.name}</span>
            </span>
          ) : (
            <span className="text-secondary-blue-200">Select a country</span>
          )}
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-secondary-blue-200" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-0 bg-secondary-blue-700 border-primary-blue-400"
      >
        <Command
          className="bg-transparent"
          filter={(value, search) =>
            value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
          }
        >
          <CommandInput placeholder="Search country" />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {COUNTRIES.map((country) => {
                const isSelected = selected?.cca2 === country.cca2;
                return (
                  <CommandItem
                    key={country.cca2}
                    // cmdk filters on `value`; include name + codes so search
                    // matches "India", "INR", or "+91".
                    value={`${country.name} ${country.currency} ${country.callingCode}`}
                    onSelect={() => {
                      onSelect(country);
                      setOpen(false);
                    }}
                    className="gap-2.5 text-white aria-selected:bg-primary-blue-400"
                  >
                    <span className="text-lg leading-none">{country.flag}</span>
                    <span className="flex-1 truncate">{country.name}</span>
                    <span className="shrink-0 text-xs text-secondary-blue-200">
                      {country.currency} {country.symbol}
                    </span>
                    <span className="shrink-0 text-xs text-secondary-blue-200">
                      {country.callingCode}
                    </span>
                    <Check
                      className={cn(
                        'h-4 w-4 shrink-0 text-primary-green-500',
                        isSelected ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
