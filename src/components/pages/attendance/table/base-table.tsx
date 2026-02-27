'use client';

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

  return (
    <DataTable
      columns={columns as ColumnDef<object, unknown>[]}
      data={filteredData as object[]}
      toolbar={(table) => (
        <DataTableToolbar table={table} onSearch={search} filters={filters} />
      )}
    />
  );
};
