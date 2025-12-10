'use client';

import { ColumnDef } from '@tanstack/react-table';

import { FeeStatusBadge } from '@/components/shared/badges/fee-status-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvatarColor, getInitials } from '@/lib/avatar-utils';
import { getProfilePictureSrc } from '@/lib/utils';
import { OutstandingPayments } from '@/types';

export const paymentColumns: ColumnDef<OutstandingPayments>[] = [
  {
    accessorKey: 'gymNo',
    header: 'Member ID',
    cell: ({ row }) => (
      <div className="w-20 uppercase">
        <span className="text-primary-blue-200/80 font-bold mr-0.5">#</span>
        {row.getValue<string>('gymNo').replace('#', '')}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const name = row.getValue<string>('name') || 'Unknown';
      const avatarStyle = getAvatarColor(name);
      const initials = getInitials(name);

      return (
        <div className="flex items-center gap-2 w-[140px]">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="font-medium" style={avatarStyle}>
              {initials}
            </AvatarFallback>
            <AvatarImage
              src={getProfilePictureSrc(row.original.photoPath)}
              alt={name}
            />
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
      const status = row.getValue<'paid' | 'partially_paid' | 'unpaid'>(
        'feeStatus'
      );
      return (
        <div className="w-[120px]">
          <FeeStatusBadge status={status} />
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
];
