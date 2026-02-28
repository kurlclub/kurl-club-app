'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';

import { FeeStatusBadge, SourceBadge } from '@/components/shared/badges';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getAvatarColor, getInitials } from '@/lib/avatar-utils';
import { getProfilePictureSrc, safeFormatDate } from '@/lib/utils';
import { Lead } from '@/types/lead';

const ActionsCell: React.FC<{ lead: Lead; onView?: (lead: Lead) => void }> = ({
  lead,
  onView,
}) => {
  return (
    <Button
      variant="ghost"
      className="h-8 w-8 p-0"
      onClick={() => onView && onView(lead)}
    >
      <span className="sr-only">View lead details</span>
      <Eye className="h-4 w-4 text-primary-green-600" />
    </Button>
  );
};

export const getLeadColumns = (opts?: {
  onView?: (lead: Lead) => void;
}): ColumnDef<Lead>[] => [
  {
    accessorKey: 'leadNo',
    header: 'Lead no',
    cell: ({ row }) => (
      <div className="w-20 uppercase">
        <span className="text-primary-blue-200/80 font-bold mr-0.5">#</span>
        {row.getValue('leadNo')}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'leadName',
    header: 'Name',
    cell: ({ row }) => {
      const name = row.getValue<string>('leadName') || 'Unknown';
      const avatarStyle = getAvatarColor(name);
      const initials = getInitials(name);

      return (
        <div className="flex items-center gap-2 w-[140px]">
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
    accessorKey: 'createdAt',
    header: 'Created at',
    cell: ({ row }) => (
      <div className="w-[100px]">
        {safeFormatDate(row.getValue<string>('createdAt'))}
      </div>
    ),
  },
  {
    accessorKey: 'interest',
    header: 'Interest',
    cell: ({ row }) => {
      const status = row.getValue('interest') as
        | 'lost'
        | 'new'
        | 'contacted'
        | 'interested';
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
  {
    accessorKey: 'source',
    header: 'Source',
    cell: ({ row }) => {
      const status = row.getValue('source') as 'walk_in' | 'online' | 'ads';
      return (
        <div className="w-[120px]">
          <SourceBadge status={status} />
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <ActionsCell lead={row.original} onView={opts?.onView} />
    ),
  },
];
