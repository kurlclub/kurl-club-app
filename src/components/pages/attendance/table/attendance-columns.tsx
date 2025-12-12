'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Clock, LogOut } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getAvatarColor, getInitials } from '@/lib/avatar-utils';
import { getProfilePictureSrc } from '@/lib/utils';
import type { AttendanceRecordResponse } from '@/services/attendance';

const StatusBadge = ({ status }: { status: string }) => {
  const normalizedStatus = status.replace(/_/g, '-');
  const statusConfig = {
    present: {
      text: 'text-neutral-green-500',
      dot: 'bg-neutral-green-500',
    },
    'checked-in': {
      text: 'text-primary-green-500',
      dot: 'bg-primary-green-500',
    },
    'checked-out': {
      text: 'text-semantic-blue-500',
      dot: 'bg-semantic-blue-500',
    },
    late: {
      text: 'text-neutral-ochre-500',
      dot: 'bg-neutral-ochre-500',
    },
    absent: {
      text: 'text-alert-red-500',
      dot: 'bg-alert-red-500',
    },
  };

  const config =
    statusConfig[normalizedStatus as keyof typeof statusConfig] ||
    statusConfig.present;

  return (
    <div className={`flex items-center gap-2 ${config.text}`}>
      <span className="relative flex justify-center items-center size-3">
        <span
          className={`absolute inline-flex h-full w-full animate-pulse rounded-full ${config.dot} opacity-45`}
        />
        <span
          className={`relative inline-flex size-2 rounded-full ${config.dot}`}
        />
      </span>
      <span className="text-sm font-medium capitalize">
        {status.replace(/_/g, ' ').replace(/-/g, ' ')}
      </span>
    </div>
  );
};

const baseColumns: ColumnDef<AttendanceRecordResponse>[] = [
  {
    accessorKey: 'memberId',
    header: 'Member ID',
    cell: ({ row }) => (
      <div className="w-[100px] uppercase">
        <span className="text-primary-blue-300 font-bold mr-0.5">#</span>
        {row.getValue('memberId')}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'memberName',
    header: 'Member',
    cell: ({ row }) => {
      const name = row.getValue<string>('memberName') || 'Unknown';
      const avatarStyle = getAvatarColor(name);
      const initials = getInitials(name);

      return (
        <div className="flex items-center gap-2 w-[180px]">
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
          <span className="text-gray-900 dark:text-white">{name}</span>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'date',
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => (
      <div className="min-w-[100px]">
        <div className="text-gray-900 dark:text-white text-sm">
          {row.original.date}
        </div>
      </div>
    ),
  },
  {
    id: 'checkInTime',
    accessorKey: 'checkInTime',
    header: 'Check In',
    cell: ({ row }) => {
      const checkInTime = row.original.checkInTime;
      const time = checkInTime
        ? new Date(checkInTime).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : '--';
      const isManual = row.original.mode === 'manual';
      const recordedBy = row.original.recordedBy;

      return (
        <div className="min-w-20">
          <div className="flex items-center gap-1">
            <Clock size={12} className="text-primary-green-500" />
            <span className="text-gray-900 dark:text-white text-sm">
              {time}
            </span>
          </div>
          {isManual && recordedBy && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              by {recordedBy.role}
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: 'checkOutTime',
    accessorKey: 'checkOutTime',
    header: 'Check Out',
    cell: ({ row }) => {
      const checkOutTime = row.original.checkOutTime;
      const isActive = !checkOutTime;
      const time = checkOutTime
        ? new Date(checkOutTime).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : null;
      const isManual = row.original.mode === 'manual';
      const recordedBy = row.original.recordedBy;

      return (
        <div className="min-w-20">
          {isActive ? (
            <span className="text-primary-green-600 dark:text-primary-green-400 text-sm font-medium">
              Active
            </span>
          ) : (
            <>
              <div className="flex items-center gap-1">
                <Clock size={12} className="text-semantic-blue-500" />
                <span className="text-gray-900 dark:text-white text-sm">
                  {time}
                </span>
              </div>
              {isManual && recordedBy && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  by {recordedBy.role}
                </div>
              )}
            </>
          )}
        </div>
      );
    },
  },
  {
    id: 'duration',
    accessorKey: 'duration',
    header: 'Duration',
    cell: ({ row }) => {
      const duration = row.original.duration;
      const displayDuration = duration
        ? `${Math.floor(duration / 60)}h ${duration % 60}m`
        : '--';
      return (
        <div className="min-w-20">
          <span className="text-gray-900 dark:text-white text-sm">
            {displayDuration}
          </span>
        </div>
      );
    },
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <div className="min-w-[100px]">
        <StatusBadge status={row.original.status} />
      </div>
    ),
  },
];

export const attendanceColumns = baseColumns;

export const manualModeColumns = (
  onCheckOut: (memberId: string) => void
): ColumnDef<AttendanceRecordResponse>[] => [
  ...baseColumns,
  {
    id: 'manualActions',
    header: 'Actions',
    cell: ({ row }) => {
      const isActive = !row.original.checkOutTime;
      return (
        <div className="min-w-[100px]">
          {isActive ? (
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1 border-semantic-blue-500 text-semantic-blue-500 hover:bg-semantic-blue-500/10"
              onClick={() => onCheckOut(row.original.memberId)}
            >
              <LogOut size={14} />
              Check Out
            </Button>
          ) : (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Completed
            </span>
          )}
        </div>
      );
    },
  },
];
