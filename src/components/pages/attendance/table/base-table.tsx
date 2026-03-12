'use client';

import { useMemo, useState } from 'react';

import { ColumnDef } from '@tanstack/react-table';

import { DataTable } from '@/components/shared/table/data-table';
import { DataTableToolbar } from '@/components/shared/table/data-table-toolbar';
import { useFilterableList } from '@/hooks/use-filterable-list';
import { FilterConfig } from '@/lib/filters';
import { searchItems } from '@/lib/utils';

type Props<T extends Record<string, unknown>> = {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  filters?: FilterConfig[];
};

export const BaseTable = <T extends Record<string, unknown>>({
  data,
  columns,
  filters = [],
}: Props<T>) => {
  const { items: filteredData, search } = useFilterableList<T>(
    data,
    searchItems
  );

  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[] | undefined>
  >({});

  const normalizeFilterValue = (value: unknown) =>
    String(value)
      .toLowerCase()
      .replace(/[_\s]+/g, '-');

  const filteredByFacets = useMemo(() => {
    return filteredData.filter((item) => {
      return Object.entries(selectedFilters).every(([columnId, values]) => {
        if (!values?.length) return true;

        const fieldValue = item[columnId as keyof T];
        if (fieldValue === undefined || fieldValue === null) return false;

        const normalizedField = normalizeFilterValue(fieldValue);

        return values.some((value) => {
          const normalizedValue = normalizeFilterValue(value);
          return (
            normalizedField === normalizedValue ||
            String(fieldValue).toLowerCase() === String(value).toLowerCase()
          );
        });
      });
    });
  }, [filteredData, selectedFilters]);

  const handleFilterChange = (
    columnId: string,
    values: string[] | undefined
  ) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [columnId]: values,
    }));
  };

  const handleResetFilters = () => setSelectedFilters({});

  return (
    <DataTable
      columns={columns as ColumnDef<object, unknown>[]}
      data={filteredByFacets as object[]}
      toolbar={(table) => (
        <DataTableToolbar
          table={table}
          onSearch={search}
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          selectedFilters={selectedFilters}
        />
      )}
    />
  );
};
