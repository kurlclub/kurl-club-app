'use client';

import { ColumnDef } from '@tanstack/react-table';

import { FeeStatusBadge } from '@/components/shared/badges/fee-status-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { OutstandingPayments } from '@/types';

export const paymentColumns: ColumnDef<OutstandingPayments>[] = [
  {
    accessorKey: 'gymNo',
    header: 'Gym no',
    cell: ({ row }) => <div className="w-[70px]">{row.getValue('gymNo')}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const name = row.getValue<string>('name') || 'Unknown';
      return (
        <div className="flex items-center gap-2 w-[200px]">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-primary-blue-400/70">
              {name.slice(0, 2)}
            </AvatarFallback>
            <AvatarImage src={row.original.avatar} alt={name} />
          </Avatar>
          <span>{name}</span>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => {
      const amount = row.getValue<number>('amount') ?? 0;
      return (
        <div className="min-w-[70px]">₹{amount.toLocaleString('en-IN')}</div>
      );
    },
  },
  {
    accessorKey: 'package',
    header: 'Package',
    cell: ({ row }) => (
      <div className="min-w-[70px]">{row.getValue('package')}</div>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'feeStatus',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('feeStatus') as
        | 'paid'
        | 'partially_paid'
        | 'unpaid';
      return (
        <div className="min-w-[120px]">
          <FeeStatusBadge status={status} />
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
];
