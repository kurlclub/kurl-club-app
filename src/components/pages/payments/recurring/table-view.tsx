'use client';

import { ColumnDef } from '@tanstack/react-table';

import { DataTable, DataTableToolbar } from '@/components/shared/table';
import { FilterConfig } from '@/lib/filters';
import { MemberPaymentDetails } from '@/types/payment';

type Props = {
  payments: MemberPaymentDetails[];
  columns: ColumnDef<MemberPaymentDetails, unknown>[];
  filters?: FilterConfig[];
  onSearch: (term: string) => void;
  searchValue?: string;
  onFilterChange?: (columnId: string, values: string[] | undefined) => void;
  onResetFilters?: () => void;
  selectedFilters?: Record<string, string[] | undefined>;
};

export const TableView = ({
  payments,
  columns,
  filters,
  onSearch,
  searchValue,
  onFilterChange,
  onResetFilters,
  selectedFilters,
}: Props) => {
  return (
    <DataTable
      columns={columns}
      data={payments}
      initialSorting={[{ id: 'currentCycle.bufferEndDate', desc: false }]}
      toolbar={(table) => (
        <DataTableToolbar
          table={table}
          onSearch={onSearch}
          searchValue={searchValue}
          onFilterChange={onFilterChange}
          onResetFilters={onResetFilters}
          selectedFilters={selectedFilters}
          filters={filters ?? []}
        />
      )}
    />
  );
};
