'use client';

import { ColumnDef } from '@tanstack/react-table';

import { DataTable, DataTableToolbar } from '@/components/shared/table';
import { useFilterableList } from '@/hooks/use-filterable-list';
import { FilterConfig } from '@/lib/filters';
import { searchItems } from '@/lib/utils';
import { SessionPaymentMember } from '@/types/payment';

type Props = {
  payments: SessionPaymentMember[];
  columns: ColumnDef<SessionPaymentMember, unknown>[];
  filters?: FilterConfig[];
};

export const SessionPaymentTableView = ({
  payments,
  columns,
  filters,
}: Props) => {
  const { items: filteredPayments, search } = useFilterableList(
    payments,
    (items: SessionPaymentMember[], term: string) =>
      searchItems(
        items as unknown as Record<string, unknown>[],
        term,
        (item: Record<string, unknown>) => {
          const member = item as unknown as SessionPaymentMember;
          return [
            member.memberName || '',
            member.memberId.toString(),
            member.memberIdentifier ||
              `KC${member.memberId.toString().padStart(3, '0')}`,
            member.status || '',
            member.package || '',
          ];
        }
      ) as unknown as SessionPaymentMember[]
  );

  return (
    <DataTable
      columns={columns}
      data={filteredPayments}
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
