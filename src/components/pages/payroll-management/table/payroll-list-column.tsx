import type { ColumnDef } from '@tanstack/react-table';
import { Dumbbell, Eye, Users } from 'lucide-react';

import { FeeStatusBadge } from '@/components/shared/badges';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAvatarColor } from '@/lib/avatar-utils';
import { getInitials } from '@/lib/utils';
import type { PayrollRow } from '@/types/payroll-management';

const mapFeeStatus = (status: PayrollRow['feeStatus']) => {
  if (status === 'Paid') return 'paid';
  if (status === 'Partially Paid') return 'partially_paid';

  return 'unpaid';
};

interface PayrollColumnOptions {
  onView?: (row: PayrollRow) => void;
}

export const getPayrollColumns = (
  options?: PayrollColumnOptions
): ColumnDef<PayrollRow>[] => [
  {
    accessorKey: 'staffId',
    header: 'Staff ID',
    cell: ({ row }) => <div className="w-30 ">{row.getValue('staffId')}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const name = row.getValue<string>('name') || 'Unknown';
      const imageUrl = row.original.imageUrl;
      const avatarStyle = getAvatarColor(name);
      const initials = getInitials(name);

      return (
        <div className="flex items-center gap-2 w-35">
          <Avatar className="h-8 w-8">
            {imageUrl ? <AvatarImage src={imageUrl} alt={name} /> : null}
            <AvatarFallback style={avatarStyle}>{initials}</AvatarFallback>
          </Avatar>
          <span>{name}</span>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.getValue<PayrollRow['role']>('role');

      return (
        <div className="min-w-27.5">
          <Badge
            variant="outline"
            className="rounded-lg p-1.5 bg-primary-blue-400 border-none gap-2 text-[13px] leading-normal"
          >
            {role === 'Staff' ? <Users size={18} /> : <Dumbbell size={18} />}
            {role}
          </Badge>
        </div>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'feeStatus',
    header: 'Fee status',
    cell: ({ row }) => {
      const status = row.getValue<PayrollRow['feeStatus']>('feeStatus');

      return <FeeStatusBadge status={mapFeeStatus(status)} />;
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <Button
        variant="ghost"
        className="h-8 w-8 p-0"
        type="button"
        onClick={() => options?.onView?.(row.original)}
      >
        <span className="sr-only">View details</span>
        <Eye className="h-4 w-4 text-primary-green-600" />
      </Button>
    ),
  },
];
