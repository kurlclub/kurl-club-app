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
import { getProfilePictureSrc } from '@/lib/utils';
import { FeeStatus, SessionPaymentMember } from '@/types/payment';

const ActionsCell: React.FC<{
  member: SessionPaymentMember;
  onRecord?: (member: SessionPaymentMember) => void;
  onGenerateInvoice?: (member: SessionPaymentMember) => void;
  showInvoice?: boolean;
}> = ({ member, onRecord, onGenerateInvoice, showInvoice = false }) => {
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
            href={`/members/${member.memberId}`}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            View member
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="shad-select-item"
          onClick={() => onRecord?.(member)}
        >
          <Receipt className="h-4 w-4 mr-2" />
          Record payment
        </DropdownMenuItem>
        {showInvoice && (
          <DropdownMenuItem
            className="shad-select-item"
            onClick={() => onGenerateInvoice?.(member)}
          >
            <FileText className="h-4 w-4 mr-2" />
            Generate Invoice
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const createSessionPaymentColumns = (
  onRecord?: (member: SessionPaymentMember) => void,
  onGenerateInvoice?: (member: SessionPaymentMember) => void,
  showInvoice: boolean = false
): ColumnDef<SessionPaymentMember>[] => [
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
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const member = row.original;
      const name = member.memberName;
      const avatarStyle = getAvatarColor(name);
      const initials = getInitials(name);

      return (
        <div className="flex items-center gap-2 w-40">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="font-medium" style={avatarStyle}>
              {initials}
            </AvatarFallback>
            <AvatarImage
              src={getProfilePictureSrc(
                row.original.profilePicture,
                row.original.photoPath
              )}
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
    accessorKey: 'sessions',
    header: 'Sessions',
    cell: ({ row }) => {
      const { sessions } = row.original;
      if (!sessions) return <div className="min-w-20">-</div>;
      return (
        <div className="min-w-20">
          <div className="text-white text-sm">
            <span className="font-bold">{sessions.used || 0}</span>
            <span className="font-medium">/{sessions.total || 0}</span>
          </div>
          <div className="text-xs text-primary-blue-100">Used / Total</div>
        </div>
      );
    },
  },
  {
    accessorKey: 'paymentSummary',
    header: 'Payment Summary',
    cell: ({ row }) => {
      const { paymentSummary } = row.original;
      if (!paymentSummary) return <div className="min-w-[180px]">-</div>;

      const progress =
        paymentSummary.total > 0
          ? (paymentSummary.paid / paymentSummary.total) * 100
          : 0;

      return (
        <div className="min-w-[180px] pr-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-white">₹{paymentSummary.paid || 0}</span>
            <span className="text-primary-blue-200">
              ₹{paymentSummary.total || 0}
            </span>
          </div>
          <div className="w-full bg-primary-blue-300/30 rounded-full h-1.5 mb-1">
            <div
              className="bg-primary-green-400 h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          {paymentSummary.pending > 0 && (
            <div className="text-xs text-alert-red-300">
              ₹{paymentSummary.pending || 0} pending
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue<FeeStatus>('status');
      return (
        <div className="min-w-24">
          <FeeStatusBadge status={status} />
        </div>
      );
    },
    filterFn: (row, id, value: string[]) => {
      return value.includes(row.getValue<string>('status'));
    },
  },
  {
    accessorKey: 'package',
    header: 'Package',
    cell: ({ row }) => {
      const { package: packageName, sessionFee } = row.original;

      return (
        <div className="min-w-[120px]">
          <div className="text-white text-sm">{packageName || '-'}</div>
          <div className="text-xs text-primary-blue-100">
            Per session • ₹{sessionFee || 0}
          </div>
        </div>
      );
    },
  },

  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <ActionsCell
        member={row.original}
        onRecord={onRecord}
        onGenerateInvoice={onGenerateInvoice}
        showInvoice={showInvoice}
      />
    ),
  },
];
