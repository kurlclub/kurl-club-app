'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Check, X } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getAvatarColor, getInitials } from '@/lib/avatar-utils';
import { getProfilePictureSrc, safeFormatDate } from '@/lib/utils';

export type PendingMember = {
  id: number;
  name: string;
  phone: string;
  gender: string;
  height: number;
  weight: number;
  dob: string;
  bloodGroup: string;
  profilePicture?: string | File | null;
  photoPath?: string | null;
};

export const createPendingOnboardingColumns = (
  onAccept: (member: PendingMember) => void,
  onReject: (member: PendingMember) => void
): ColumnDef<PendingMember>[] => [
  {
    id: 'sno',
    header: 'S.No',
    cell: ({ row }) => (
      <div className="w-[60px]">
        <span className="text-primary-blue-200/80 font-bold mr-0.5">#</span>
        {row.index + 1}
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
      const avatarStyle = getAvatarColor(name);
      const initials = getInitials(name);
      return (
        <div className="flex items-center gap-2 w-[140px]">
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
    accessorKey: 'dob',
    header: 'DOB',
    cell: ({ row }) => (
      <div className="w-[100px]">
        {safeFormatDate(row.getValue<string>('dob'))}
      </div>
    ),
  },
  {
    accessorKey: 'phone',
    header: 'Phone number',
    cell: ({ row }) => <div className="w-[120px]">{row.getValue('phone')}</div>,
  },
  {
    accessorKey: 'gender',
    header: 'Gender',
    cell: ({ row }) => (
      <div className="w-[70px] capitalize">{row.getValue('gender')}</div>
    ),
  },
  {
    accessorKey: 'bloodGroup',
    header: 'Blood Group',
    cell: ({ row }) => (
      <div className="w-[80px] text-center">{row.getValue('bloodGroup')}</div>
    ),
  },

  {
    id: 'vitals',
    header: 'Height / Weight',
    cell: ({ row }) => (
      <div className="w-[130px]">
        <span className="text-white">{row.original.height}</span>
        <span className="text-primary-blue-200 text-xs">cm</span>
        <span className="text-primary-blue-200 mx-1.5">/</span>
        <span className="text-white">{row.original.weight}</span>
        <span className="text-primary-blue-200 text-xs">kg</span>
      </div>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="destructive"
          className="h-8 w-8 p-0"
          onClick={() => onReject(row.original)}
        >
          <X className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onAccept(row.original)}
        >
          <Check className="w-4 h-4" />
        </Button>
      </div>
    ),
  },
];
