'use client';

import Image from 'next/image';
import { useState } from 'react';

import { ColumnDef } from '@tanstack/react-table';
import { IndianRupee, Receipt } from 'lucide-react';

import { FeeStatusBadge } from '@/components/shared/badges/fee-status-badge';
import InfoCard from '@/components/shared/cards/info-card';
import {
  DataTable,
  DataTableToolbar,
  TableSkeleton,
} from '@/components/shared/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useDebounce } from '@/hooks/use-debounce';
import { getAvatarColor, getInitials } from '@/lib/avatar-utils';
import { FilterConfig } from '@/lib/filters';
import { getProfilePictureSrc } from '@/lib/utils';
import { useGymBranch } from '@/providers/gym-branch-provider';
import { usePaymentHistory } from '@/services/payments';

type PaymentHistoryRecord = {
  paymentId: number;
  memberId: number;
  memberName: string;
  memberIdentifier: string;
  photoPath: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  status: string;
  paymentCycleId: number;
  cycleStartDate: string;
  cycleEndDate: string;
  cycleStatus: string;
};

const columns: ColumnDef<PaymentHistoryRecord>[] = [
  {
    accessorKey: 'memberIdentifier',
    header: 'Member ID',
    cell: ({ row }) => {
      const { memberId, memberIdentifier } = row.original;
      const identifier =
        memberIdentifier || `KC${memberId.toString().padStart(3, '0')}`;
      return (
        <div className="w-[100px] uppercase">
          <span className="text-primary-blue-200/80 font-bold mr-0.5">#</span>
          {identifier}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'memberName',
    header: 'Name',
    cell: ({ row }) => {
      const name = row.getValue<string>('memberName') || 'Unknown';
      const avatarStyle = getAvatarColor(name);
      const initials = getInitials(name);

      return (
        <div className="flex items-center gap-2 w-40">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={getProfilePictureSrc(
                row.original.photoPath,
                row.original.photoPath
              )}
              alt={name}
            />
            <AvatarFallback className="font-medium" style={avatarStyle}>
              {initials}
            </AvatarFallback>
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
    cell: ({ row }) => (
      <div className="min-w-[100px]">
        <div className="text-white text-sm font-semibold">
          ₹{row.original.amount.toLocaleString()}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'paymentDate',
    header: 'Payment Date',
    cell: ({ row }) => {
      const date = new Date(row.original.paymentDate);
      return (
        <div className="min-w-[120px]">
          <div className="text-white text-sm">
            {date.toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </div>
          <div className="text-xs text-primary-blue-200">
            {date.toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'paymentMethod',
    header: 'Method',
    cell: ({ row }) => {
      const method = row.original.paymentMethod.toLowerCase();
      const isUPI = method === 'upi';
      const isCash = method === 'cash';

      return (
        <div className="min-w-20">
          <div className="flex items-center gap-2">
            {isUPI && (
              <Image
                src="/assets/svg/upi-icon.svg"
                alt="UPI"
                width={30}
                height={30}
                className="opacity-80"
              />
            )}
            {isCash && (
              <Image
                src="/assets/svg/wallet-icon.svg"
                alt="Cash"
                width={30}
                height={30}
                className="opacity-80"
              />
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'cycleStatus',
    header: 'Payment Status',
    cell: ({ row }) => {
      const status = row.original.cycleStatus as
        | 'paid'
        | 'partially_paid'
        | 'unpaid';
      return (
        <div className="min-w-[120px]">
          <FeeStatusBadge status={status} />
        </div>
      );
    },
  },
  {
    accessorKey: 'cycleStartDate',
    header: 'Cycle Period',
    cell: ({ row }) => {
      const start = new Date(row.original.cycleStartDate);
      const end = new Date(row.original.cycleEndDate);
      return (
        <div className="min-w-40">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-white font-medium">
              {start.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
              })}
            </span>
            <span className="text-primary-blue-200">→</span>
            <span className="text-white font-medium">
              {end.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      );
    },
  },
];

export function HistoryTab() {
  const { gymBranch } = useGymBranch();
  const gymId = gymBranch?.gymId || 0;

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [selectedFilters, setSelectedFilters] = useState<{
    paymentMethod?: string[];
    status?: string[];
  }>({});

  const { data, isLoading } = usePaymentHistory(gymId, {
    search: debouncedSearch || undefined,
    paymentMethod: selectedFilters.paymentMethod?.join(',') || undefined,
    status: selectedFilters.status?.join(',') || undefined,
  });

  const paymentHistory = data?.data || [];
  const summary = data?.summary;
  const availableFilters = data?.availableFilters;

  const dynamicFilters: FilterConfig[] = [
    {
      columnId: 'paymentMethod',
      title: 'Payment Method',
      options:
        availableFilters?.paymentMethods?.map((method) => ({
          label: method.value.toUpperCase(),
          value: method.value,
          count: method.count,
        })) || [],
    },
    {
      columnId: 'status',
      title: 'Status',
      options:
        availableFilters?.statuses?.map((status) => ({
          label: status.value
            .replace('_', ' ')
            .replace(/\b\w/g, (l: string) => l.toUpperCase()),
          value: status.value,
          count: status.count,
        })) || [],
    },
  ];

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (
    columnId: string,
    values: string[] | undefined
  ) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [columnId]: values,
    }));
  };

  const handleResetFilters = () => {
    setSelectedFilters({});
    setSearchTerm('');
  };

  const stats = [
    {
      id: 1,
      icon: <Receipt size={20} strokeWidth={1.75} color="#151821" />,
      color: 'primary-green-500',
      title: 'Total Payments',
      count: summary?.totalPayments || 0,
    },
    {
      id: 2,
      icon: <IndianRupee size={20} strokeWidth={1.75} color="#151821" />,
      color: 'primary-green-500',
      title: 'Total Revenue',
      count: summary?.totalRevenue || 0,
    },
  ];

  return (
    <div className="flex flex-col gap-7">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <InfoCard item={stat} key={stat.id} />
        ))}
      </div>

      {isLoading ? (
        <TableSkeleton rows={10} columns={7} />
      ) : (
        <DataTable
          columns={columns}
          data={paymentHistory}
          toolbar={(table) => (
            <DataTableToolbar
              table={table}
              onSearch={handleSearch}
              searchValue={searchTerm}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              selectedFilters={selectedFilters}
              filters={dynamicFilters}
            />
          )}
        />
      )}
    </div>
  );
}
