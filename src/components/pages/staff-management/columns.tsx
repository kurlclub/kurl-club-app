import Image from 'next/image';
import Link from 'next/link';

import { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getAvatarColor, getInitials } from '@/lib/avatar-utils';
import { Staff } from '@/types/staff';

const ActionsCell: React.FC<{ user: Staff }> = ({ user }) => {
  return (
    <Button variant="ghost" className="h-8 w-8 p-0">
      <span className="sr-only">View member profile</span>
      <Link href={`/staff-management/${user.role.toLowerCase()}/${user.id}`}>
        <Eye className="h-4 w-4 text-primary-green-600" />
      </Link>
    </Button>
  );
};

export const columns: ColumnDef<Staff>[] = [
  {
    accessorKey: 'identifier',
    header: 'TrID',
    cell: ({ row }) => (
      <div className="w-25 uppercase">
        <span className="text-primary-blue-200/80 font-bold mr-0.5">#</span>
        {row.getValue('identifier')}
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
      const hasProfilePicture = row.original.hasProfilePicture;
      const photoPath = row.original.photoPath;

      return (
        <div className="flex items-center gap-2 w-50">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="font-medium" style={avatarStyle}>
              {initials}
            </AvatarFallback>
            {hasProfilePicture && photoPath ? (
              <AvatarImage src={photoPath} alt={name} />
            ) : null}
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
    header: 'Designation',
    cell: ({ row }) => {
      const role = row.getValue<string>('role');
      const getRoleIcon = (role: string) => {
        if (role === 'Staff') return '/assets/svg/staff-icon.svg';
        if (role === 'Trainer') return '/assets/svg/trainer-icon.svg';
        return '/assets/svg/admin-icon.svg';
      };

      return (
        <div className="min-w-25">
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
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => {
      const email = row.getValue<string | null>('email');
      return <div className="min-w-45">{email || 'N/A'}</div>;
    },
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ row }) => <div className="min-w-30">{row.getValue('phone')}</div>,
  },
  {
    accessorKey: 'bloodGroup',
    header: 'Blood Group',
    cell: ({ row }) => (
      <div className="min-w-25">{row.getValue('bloodGroup')}</div>
    ),
  },
  {
    accessorKey: 'gender',
    header: 'Gender',
    cell: ({ row }) => (
      <div className="min-w-20">
        {row.getValue('gender')
          ? (row.getValue('gender') as string).charAt(0).toUpperCase() +
            (row.getValue('gender') as string).slice(1)
          : ''}
      </div>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <ActionsCell user={row.original} />,
  },
];
