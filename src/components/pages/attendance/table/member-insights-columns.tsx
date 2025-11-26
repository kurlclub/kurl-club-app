'use client';

import { ColumnDef } from '@tanstack/react-table';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvatarColor, getInitials } from '@/lib/avatar-utils';
import type { MemberInsight } from '@/types/attendance';

export const memberInsightsColumns: ColumnDef<MemberInsight>[] = [
  {
    accessorKey: 'memberIdentifier',
    header: 'Member ID',
    cell: ({ row }) => (
      <div className="w-[100px] uppercase">
        <span className="text-primary-blue-300 font-bold mr-0.5">#</span>
        {row.getValue('memberIdentifier')}
      </div>
    ),
  },
  {
    accessorKey: 'name',
    header: 'Member',
    cell: ({ row }) => {
      const name = row.getValue<string>('name');
      const avatarStyle = getAvatarColor(name);
      const initials = getInitials(name);

      return (
        <div className="flex items-center gap-3 w-[200px]">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="font-medium" style={avatarStyle}>
              {initials}
            </AvatarFallback>
            <AvatarImage src={row.original.profilePicture || undefined} />
          </Avatar>
          <div className="text-gray-900 dark:text-white font-medium">
            {name}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'attendanceRate',
    header: () => <div className="text-center">Attendance</div>,
    cell: ({ row }) => {
      const rate = row.getValue<number>('attendanceRate');
      const color =
        rate >= 80
          ? 'text-primary-green-500'
          : rate >= 60
            ? 'text-secondary-yellow-500'
            : 'text-alert-red-500';
      return (
        <div className="min-w-[120px]">
          <div className="flex items-center justify-center gap-2">
            <div className={`font-bold text-xl ${color}`}>{rate}%</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'visitsThisMonth',
    header: () => <div className="text-center">Visits</div>,
    cell: ({ row }) => (
      <div className="min-w-[120px]">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-900 dark:text-white font-bold text-lg">
              {row.getValue('visitsThisMonth')}
            </span>
            <span className="text-gray-600 dark:text-gray-400 text-sm">/</span>
            <span className="text-gray-600 dark:text-gray-400 text-sm">
              {row.original.totalVisits}
            </span>
          </div>
          <div className="text-gray-600 dark:text-gray-400 text-xs">
            This month / Total
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'currentStreak',
    header: () => <div className="text-center">Streak</div>,
    cell: ({ row }) => (
      <div className="min-w-[120px]">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-primary-green-500 font-bold text-lg">
              {row.getValue('currentStreak')}
            </span>
            <span className="text-gray-600 dark:text-gray-400 text-sm">
              days
            </span>
          </div>
          <div className="text-gray-600 dark:text-gray-400 text-xs">
            Best: {row.original.longestStreak} days
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'averageDuration',
    header: () => <div className="text-center">Avg Duration</div>,
    cell: ({ row }) => {
      const peakTime = row.original.favoriteTime;
      const formatTime = (time: string) => {
        if (!time || time === '00:00:00') return 'N/A';
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
      };

      return (
        <div className="min-w-[130px]">
          <div className="flex flex-col items-center">
            <div className="text-gray-900 dark:text-white font-bold text-lg">
              {row.getValue('averageDuration')}m
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-xs">
              Peak: {formatTime(peakTime)}
            </div>
          </div>
        </div>
      );
    },
  },
];
