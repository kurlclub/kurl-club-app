'use client';

import Link from 'next/link';

import { ColumnDef } from '@tanstack/react-table';
import { Eye, FileText, MoreHorizontal, Receipt } from 'lucide-react';

import { FeeStatusBadge } from '@/components/shared/badges/fee-status-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getAvatarColor, getInitials } from '@/lib/avatar-utils';
import { getRecurringDisplayDueDate } from '@/lib/payments/recurring';
import {
  calculateDaysRemaining,
  getPaymentBadgeStatus,
  getProfilePictureSrc,
  safeParseDate,
} from '@/lib/utils';
import type {
  MemberPaymentDetails,
  RecurringPaymentMember,
} from '@/types/payment';

const ActionsCell: React.FC<{
  user: RecurringPaymentMember;
  onRecord?: (member: MemberPaymentDetails) => void;
  onGenerateInvoice?: (member: MemberPaymentDetails) => void;
  showInvoice?: boolean;
}> = ({ user, onRecord, onGenerateInvoice, showInvoice = false }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="shad-select-content">
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="shad-select-item">
          <Link
            href={`/members/${user.memberId}`}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            View member
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="shad-select-item"
          onClick={() => onRecord?.(user)}
        >
          <Receipt className="h-4 w-4 mr-2" />
          Record payment
        </DropdownMenuItem>
        {showInvoice && (
          <DropdownMenuItem
            className="shad-select-item"
            onClick={() => onGenerateInvoice?.(user)}
          >
            <FileText className="h-4 w-4 mr-2" />
            Generate Invoice
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const createPaymentColumns = (
  onRecord?: (member: MemberPaymentDetails) => void,
  membershipPlans: Array<{ membershipPlanId: number; planName: string }> = [],
  onGenerateInvoice?: (member: MemberPaymentDetails) => void,
  showInvoice: boolean = false
): ColumnDef<RecurringPaymentMember>[] => [
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
                row.original.profilePicture,
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
    id: 'displayDueDate',
    accessorFn: (row) => getRecurringDisplayDueDate(row) ?? '',
    header: 'Due Date',
    cell: ({ row }) => {
      const dueDate = getRecurringDisplayDueDate(row.original);
      if (!dueDate) return <div className="min-w-24">-</div>;

      const daysDiff = calculateDaysRemaining(dueDate);
      const formattedDate =
        safeParseDate(dueDate)?.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
        }) || '-';

      let statusColor = 'text-primary-blue-100';
      let statusText = '';

      if (daysDiff < 0) {
        statusColor = 'text-alert-red-400';
        statusText = `${Math.abs(daysDiff)} days overdue`;
      } else if (daysDiff === 0) {
        statusColor = 'text-neutral-ochre-400';
        statusText = 'Due today';
      } else if (daysDiff <= 3) {
        statusColor = 'text-secondary-yellow-150';
        statusText = `${daysDiff} days left`;
      } else {
        statusText = `${daysDiff} days left`;
      }

      return (
        <div className="min-w-24">
          <div className="text-white text-sm">{formattedDate}</div>
          <div className={`text-xs ${statusColor}`}>{statusText}</div>
        </div>
      );
    },
  },
  {
    accessorKey: 'currentCycle.paymentSummary',
    header: 'Payment Summary',
    cell: ({ row }) => {
      const { currentCycle } = row.original;
      if (!currentCycle) return <div className="min-w-[180px]">-</div>;
      const { pendingAmount, amountPaid, planFee } = currentCycle;
      const progress = planFee > 0 ? (amountPaid / planFee) * 100 : 0;

      return (
        <div className="min-w-[180px] pr-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-white">₹{amountPaid}</span>
            <span className="text-primary-blue-200">₹{planFee}</span>
          </div>
          <div className="w-full bg-primary-blue-300/30 rounded-full h-1.5 mb-1">
            <div
              className="bg-primary-green-400 h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          {pendingAmount > 0 && (
            <div className="text-xs text-alert-red-300">
              ₹{pendingAmount} pending
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: 'currentCycle.status',
    accessorFn: (row) => row.currentCycle?.cyclePaymentStatus,
    header: 'Status',
    cell: ({ row }) => {
      const { currentCycle } = row.original;
      if (!currentCycle) return <div className="min-w-24">-</div>;
      const status = currentCycle.cyclePaymentStatus;
      const pendingAmount = currentCycle.pendingAmount;

      const badgeStatus = getPaymentBadgeStatus(status, pendingAmount);

      return (
        <div className="min-w-24">
          <FeeStatusBadge status={badgeStatus} />
        </div>
      );
    },
    filterFn: (row, id, value: string[]) => {
      return row.original.currentCycle
        ? value.includes(row.original.currentCycle.cyclePaymentStatus)
        : false;
    },
  },
  {
    accessorKey: 'membershipPlanId',
    header: 'Package',
    cell: ({ row }) => {
      const { currentCycle, membershipPlanId } = row.original;
      const planFee = currentCycle?.planFee;
      const planName =
        row.original.membershipPlanName ||
        membershipPlans.find((p) => p.membershipPlanId === membershipPlanId)
          ?.planName;

      return (
        <div className="min-w-[120px]">
          <div className="text-white text-sm">
            {planName ? (
              planName
            ) : (
              <div className="h-4 bg-primary-blue-300/30 rounded animate-pulse" />
            )}
          </div>
          {planFee != null ? (
            <div className="text-xs text-primary-blue-100">
              Current cycle • ₹{planFee}
            </div>
          ) : null}
        </div>
      );
    },
    filterFn: (row, id, value: string[]) => {
      return value.includes(
        row.getValue<number>('membershipPlanId').toString()
      );
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <ActionsCell
        user={row.original}
        onRecord={onRecord}
        onGenerateInvoice={onGenerateInvoice}
        showInvoice={showInvoice}
      />
    ),
  },
];
