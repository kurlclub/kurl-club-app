import * as React from 'react';

import { PlusCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

interface DataTableFacetedFilterProps {
  title?: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
    count?: number;
  }[];
  selectedValues?: string[];
  onFilterChange?: (values: string[] | undefined) => void;
}

export function DataTableFacetedFilter({
  title,
  options,
  selectedValues = [],
  onFilterChange,
}: DataTableFacetedFilterProps) {
  const [open, setOpen] = React.useState(false);
  const selectedSet = new Set(selectedValues);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle />
          {title}
          {selectedSet.size > 0 && (
            <>
              <Separator
                orientation="vertical"
                className="mx-2 h-4 bg-primary-blue-400"
              />
              <Badge
                variant="secondary"
                className="rounded-xs px-1 font-normal lg:hidden"
              >
                {selectedSet.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedSet.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-xs px-1 font-normal"
                  >
                    {selectedSet.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedSet.has(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-xs px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[200px] p-0 shad-select-content"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedSet.has(option.value);
                return (
                  <CommandItem
                    className="shad-select-item"
                    key={option.value}
                    onSelect={() => {
                      const newSet = new Set(selectedSet);
                      if (isSelected) {
                        newSet.delete(option.value);
                      } else {
                        newSet.add(option.value);
                      }
                      const filterValues = Array.from(newSet);
                      onFilterChange?.(
                        filterValues.length ? filterValues : undefined
                      );
                    }}
                  >
                    <div className="mr-2 flex items-center justify-center">
                      <Checkbox
                        id={option.value}
                        checked={isSelected}
                        className="h-4 w-4"
                      />
                    </div>
                    {option.icon && (
                      <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{option.label}</span>
                    {option.count !== undefined && (
                      <span className="ml-auto flex items-center justify-center px-1.5 py-0.5 rounded-md bg-secondary-blue-400 text-primary-green-200 font-mono text-xs">
                        {option.count}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedSet.size > 0 && (
              <>
                <CommandSeparator className="bg-primary-blue-400" />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      onFilterChange?.(undefined);
                      setOpen(false);
                    }}
                    className="justify-center text-center cursor-pointer"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
