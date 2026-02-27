'use client';

import { Table } from '@tanstack/react-table';
import { X } from 'lucide-react';

import { Search } from '@/components/shared/search';
import {
  DataTableFacetedFilter,
  DataTableViewOptions,
} from '@/components/shared/table';
import { Button } from '@/components/ui/button';
import { FilterConfig } from '@/lib/filters';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  onSearch: (term: string) => void;
  searchValue?: string;
  filters: FilterConfig[];
  onFilterChange?: (columnId: string, values: string[] | undefined) => void;
  onResetFilters?: () => void;
  selectedFilters?: Record<string, string[] | undefined>;
}

export function DataTableToolbar<TData>({
  table,
  onSearch,
  searchValue,
  filters,
  onFilterChange,
  onResetFilters,
  selectedFilters = {},
}: DataTableToolbarProps<TData>) {
  const isFiltered = Object.values(selectedFilters).some(
    (values) => values && values.length > 0
  );

  return (
    <div className="flex flex-col gap-3 w-full md:flex-row md:items-center md:justify-between">
      <div className="flex items-center flex-wrap gap-2 min-w-0 flex-1">
        {/* Search Bar */}
        <Search
          onSearch={onSearch}
          value={searchValue}
          wrapperClass="min-w-[140px] flex-1 md:flex-initial md:min-w-[200px] md:max-w-[300px]"
        />

        {/* Dynamic Filters */}
        <div className="flex items-center flex-wrap gap-2 min-w-0">
          {filters.map((filter) => (
            <DataTableFacetedFilter
              key={filter.columnId}
              title={filter.title}
              options={filter.options}
              selectedValues={selectedFilters[filter.columnId]}
              onFilterChange={(values) =>
                onFilterChange?.(filter.columnId, values)
              }
            />
          ))}
        </div>

        {/* Reset Button */}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={onResetFilters}
            className="h-8 px-2 text-xs md:px-3 md:text-sm shrink-0"
          >
            Reset
            <X className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center justify-end md:justify-start shrink-0">
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
