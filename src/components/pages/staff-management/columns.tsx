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
      <div className="w-[100px] uppercase">
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

      return (
        <div className="flex items-center gap-2 w-[200px]">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="font-medium" style={avatarStyle}>
              {initials}
            </AvatarFallback>
            <AvatarImage src={row.original.avatar} alt={name} />
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
    cell: ({ row }) => (
      <div className="min-w-[100px]">{row.getValue('role')}</div>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => (
      <div className="min-w-[180px]">{row.getValue('email')}</div>
    ),
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ row }) => (
      <div className="min-w-[120px]">{row.getValue('phone')}</div>
    ),
  },
  {
    accessorKey: 'bloodGroup',
    header: 'Blood Group',
    cell: ({ row }) => (
      <div className="min-w-[100px]">{row.getValue('bloodGroup')}</div>
    ),
  },
  {
    accessorKey: 'gender',
    header: 'Gender',
    cell: ({ row }) => (
      <div className="min-w-[80px] capitalize">{row.getValue('gender')}</div>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <ActionsCell user={row.original} />,
  },
];
