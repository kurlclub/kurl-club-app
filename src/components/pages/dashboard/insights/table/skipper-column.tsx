'use client';

import { ColumnDef } from '@tanstack/react-table';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvatarColor, getInitials } from '@/lib/avatar-utils';
import { formatDateTime, getProfilePictureSrc } from '@/lib/utils';
import { Skippers } from '@/types';

export const SkipperColumns: ColumnDef<Skippers>[] = [
  {
    accessorKey: 'memberIdentifier',
    header: 'Member ID',
    cell: ({ row }) => (
      <div className="w-[80px] uppercase">
        <span className="text-primary-blue-200/80 font-bold mr-0.5">#</span>
        {row.getValue('memberIdentifier')}
      </div>
    ),
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
    accessorKey: 'lastCheckIn',
    header: 'Last check in',
    cell: ({ row }) => (
      <div>{formatDateTime(row.getValue('lastCheckIn'), 'both')}</div>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'daysSinceLastCheckIn',
    header: 'Days since last check-in',
    cell: ({ row }) => (
      <div>{Math.floor(row.getValue<number>('daysSinceLastCheckIn'))} days</div>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
];
