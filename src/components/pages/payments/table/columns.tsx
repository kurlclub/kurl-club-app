'use client';

import Link from 'next/link';

import { ColumnDef } from '@tanstack/react-table';
import { Eye, FileText, MoreHorizontal, Receipt } from 'lucide-react';

import { FeeStatusBadge } from '@/components/shared/badges/fee-status-badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getAvatarColor, getInitials } from '@/lib/avatar-utils';
import {
  calculateDaysRemaining,
  getPaymentBadgeStatus,
  getUrgencyConfig,
} from '@/lib/utils';
import { MemberPaymentDetails } from '@/types/payment';

const UrgencyIndicator = ({
  color,
}: {
  color: 'red' | 'orange' | 'yellow' | 'green';
}) => (
  <span className="relative flex justify-center items-center size-3">
    <span
      className={`absolute inline-flex h-full w-full animate-pulse rounded-full bg-${color}-400/45`}
    ></span>
    <span
      className={`relative inline-flex size-2 rounded-full bg-${color}-500`}
    ></span>
  </span>
);

const ActionsCell: React.FC<{
  user: MemberPaymentDetails;
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
): ColumnDef<MemberPaymentDetails>[] => [
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
        <div className="flex items-center gap-2 w-[160px]">
          <Avatar className="h-8 w-8">
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
    accessorKey: 'currentCycle.dueDate',
    header: 'Due Date',
    cell: ({ row }) => {
      const { currentCycle } = row.original;
      if (!currentCycle) return <div className="min-w-24">-</div>;
      const { dueDate, bufferEndDate } = currentCycle;
      if (!dueDate) return <div className="min-w-24">-</div>;

      const daysDiff = calculateDaysRemaining(dueDate);
      const formattedDate = new Date(dueDate).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
      });

      let statusColor = 'text-primary-blue-100';
      let statusText = '';

      if (daysDiff < 0) {
        statusColor = 'text-alert-red-400';
        if (bufferEndDate) {
          statusText = 'On buffer period';
        } else {
          statusText = `${Math.abs(daysDiff)} days overdue`;
        }
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
    id: 'currentCycle.bufferEndDate',
    accessorKey: 'currentCycle.bufferEndDate',
    header: 'Buffer',
    cell: ({ row }) => {
      const { currentCycle } = row.original;
      if (!currentCycle) return <div className="min-w-24">-</div>;
      const { bufferEndDate, pendingAmount } = currentCycle;

      // Shows when there's no buffer OR payment is completed
      if (!bufferEndDate || pendingAmount === 0) {
        return (
          <div className="min-w-24">
            <span className="bg-primary-blue-300/50 text-primary-blue-100 px-2 py-1 rounded text-xs font-medium">
              No buffer
            </span>
          </div>
        );
      }

      const daysRemaining = calculateDaysRemaining(bufferEndDate);

      const {
        bgColor,
        color,
        text: urgencyText,
      } = getUrgencyConfig(daysRemaining);

      return (
        <div className="min-w-24">
          <div
            className={`${bgColor} w-fit px-2 py-1 rounded text-xs flex items-center gap-2 mb-1`}
          >
            <UrgencyIndicator color={color} />
            <span className="font-medium">{urgencyText}</span>
          </div>
          <div className="text-xs text-primary-blue-100">Buffer period</div>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const aData = rowA.original.currentCycle;
      const bData = rowB.original.currentCycle;
      if (!aData || !bData) return 0;

      // Completed payments go to bottom
      if (aData.pendingAmount === 0 && bData.pendingAmount > 0) return 1;
      if (bData.pendingAmount === 0 && aData.pendingAmount > 0) return -1;
      if (aData.pendingAmount === 0 && bData.pendingAmount === 0) return 0;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // For sorting urgency: use buffer end date if exists, otherwise use due date
      const getUrgencyDate = (cycle: {
        bufferEndDate?: string | null;
        dueDate: string;
      }) => {
        if (cycle.bufferEndDate) {
          return new Date(cycle.bufferEndDate);
        }
        return new Date(cycle.dueDate);
      };

      const aDate = getUrgencyDate(aData);
      const bDate = getUrgencyDate(bData);
      aDate.setHours(0, 0, 0, 0);
      bDate.setHours(0, 0, 0, 0);

      // Calculate days remaining for each
      const aDaysLeft = calculateDaysRemaining(aDate.toISOString());
      const bDaysLeft = calculateDaysRemaining(bDate.toISOString());

      // Sort by urgency: expired first, then by days remaining (ascending)
      return aDaysLeft - bDaysLeft;
    },
    filterFn: (row, id, value: string[]) => {
      const { currentCycle } = row.original;
      if (!currentCycle) return false;
      const { bufferEndDate, dueDate } = currentCycle;

      // Use buffer end date if exists, otherwise use due date
      const targetDate = bufferEndDate || dueDate;
      if (!targetDate) return false;

      const daysRemaining = calculateDaysRemaining(targetDate);

      return value.some((filterValue: string) => {
        switch (filterValue) {
          case 'overdue':
            return daysRemaining < 0;
          case 'today':
            return daysRemaining === 0;
          case '1-3':
            return daysRemaining >= 1 && daysRemaining <= 3;
          case '4-7':
            return daysRemaining >= 4 && daysRemaining <= 7;
          case '7+':
            return daysRemaining > 7;
          default:
            return false;
        }
      });
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
    accessorFn: (row) => row.currentCycle?.status,
    header: 'Status',
    cell: ({ row }) => {
      const { currentCycle } = row.original;
      if (!currentCycle) return <div className="min-w-24">-</div>;
      const status = currentCycle.status;
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
        ? value.includes(row.original.currentCycle.status)
        : false;
    },
  },
  {
    accessorKey: 'membershipPlanId',
    header: 'Package',
    cell: ({ row }) => {
      const { currentCycle, membershipPlanId } = row.original;
      if (!currentCycle) return <div className="min-w-[120px]">-</div>;
      const { planFee } = currentCycle;
      const planName = membershipPlans.find(
        (p) => p.membershipPlanId === membershipPlanId
      )?.planName;

      return (
        <div className="min-w-[120px]">
          <div className="text-white text-sm">
            {planName ? (
              planName
            ) : (
              <div className="h-4 bg-primary-blue-300/30 rounded animate-pulse" />
            )}
          </div>
          <div className="text-xs text-primary-blue-100">
            Current cycle • ₹{planFee}
          </div>
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
