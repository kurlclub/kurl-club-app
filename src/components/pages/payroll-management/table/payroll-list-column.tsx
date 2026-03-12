import Image from 'next/image';
import Link from 'next/link';

import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpRight, ChevronRight } from 'lucide-react';

import { FeeStatusBadge } from '@/components/shared/badges';
import { KBadgeWarning } from '@/components/shared/icons';
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
    cell: ({ row }) => (
      <div className="w-25 uppercase">
        <span className="text-primary-blue-200/80 font-bold mr-0.5">#</span>
        {row.getValue('staffId')}
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

      const getRoleIcon = (role: string) => {
        if (role === 'Staff') return '/assets/svg/staff-icon.svg';
        if (role === 'Trainer') return '/assets/svg/trainer-icon.svg';
        return '/assets/svg/admin-icon.svg';
      };

      return (
        <div className="min-w-27.5">
          <div className="flex items-center gap-2 text-white leading-normal text-[15px] font-normal capitalize">
            <span className="w-4.5 h-4.5 flex items-center justify-center">
              <Image
                height={18}
                width={18}
                src={getRoleIcon(role)}
                alt={role}
                className="object-cover"
              />
            </span>
            {role}
          </div>
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
      const isSalaryConfigured = row.original.isSalaryConfigured;
      const roleKey = row.original.roleKey;
      const staffId = row.original.id;

      if (!isSalaryConfigured) {
        return (
          <Link
            href={`/staff-management/${roleKey}/${staffId}?tab=salary`}
            className="group inline-flex items-center gap-2"
          >
            <Badge
              variant="warning"
              className="rounded-[35px] text-xs h-7 gap-2 cursor-pointer"
            >
              <KBadgeWarning />
              Not configured
              <ChevronRight size={16} />
            </Badge>
          </Link>
        );
      }

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
        <span className="sr-only">Pay salary</span>
        <ArrowUpRight className="text-white" />
      </Button>
    ),
  },
];
