'use client';

import { ColumnDef } from '@tanstack/react-table';

import { DataTable, DataTableToolbar } from '@/components/shared/table';
import { useFilterableList } from '@/hooks/use-filterable-list';
import { FilterConfig } from '@/lib/filters';
import { searchItems } from '@/lib/utils';
import { MemberPaymentDetails } from '@/types/payment';

type Props = {
  payments: MemberPaymentDetails[];
  columns: ColumnDef<MemberPaymentDetails, unknown>[];
  filters?: FilterConfig[];
};

export const TableView = ({ payments, columns, filters }: Props) => {
  const { items: filteredPayments, search } = useFilterableList(
    payments,
    (items: MemberPaymentDetails[], term: string) =>
      searchItems(
        items as unknown as Record<string, unknown>[],
        term,
        (item: Record<string, unknown>) => {
          const member = item as unknown as MemberPaymentDetails;
          return [
            member.memberName,
            member.memberId.toString(),
            member.memberIdentifier ||
              `KC${member.memberId.toString().padStart(3, '0')}`,
            member.billingType === 'Recurring'
              ? member.overallPaymentStatus
              : '',
            member.billingType === 'Recurring'
              ? member.currentCycle?.cyclePaymentStatus || ''
              : '',
          ];
        }
      ) as unknown as MemberPaymentDetails[]
  );

  return (
    <DataTable
      columns={columns}
      data={filteredPayments}
      initialSorting={[{ id: 'currentCycle.bufferEndDate', desc: false }]}
      toolbar={(table) => (
        <DataTableToolbar
          table={table}
          onSearch={search}
          filters={filters ?? []}
        />
      )}
    />
  );
};
