'use client';

import Link from 'next/link';

import { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';

import { FeeStatusBadge } from '@/components/shared/badges/fee-status-badge';
import MembershipStateDot from '@/components/shared/badges/membership-state-dot';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getAvatarColor, getInitials } from '@/lib/avatar-utils';
import { getProfilePictureSrc, safeFormatDate } from '@/lib/utils';
import { MemberListItem } from '@/types/member.types';

const ActionsCell: React.FC<{ user: MemberListItem }> = ({ user }) => {
  return (
    <Button variant="ghost" className="h-8 w-8 p-0">
      <span className="sr-only">View member profile</span>
      <Link href={`/members/${user.memberId}`}>
        <Eye className="h-4 w-4 text-primary-green-600" />
      </Link>
    </Button>
  );
};

export const columns: ColumnDef<MemberListItem>[] = [
  {
    accessorKey: 'memberIdentifier',
    header: 'Member ID',
    cell: ({ row }) => (
      <div className="w-20 uppercase">
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
      const isFrozen = !!row.original.isFrozen;
      const frostId = `frost-${row.original.memberId}`;

      return (
        <div className="flex items-center gap-2 w-35">
          <div className="relative shrink-0">
            {isFrozen && (
              <svg aria-hidden className="absolute h-0 w-0" focusable="false">
                <defs>
                  <filter id={frostId}>
                    <feTurbulence
                      type="fractalNoise"
                      baseFrequency="0.013 0.017"
                      numOctaves={2}
                      seed={7}
                      result="noise"
                    />
                    <feDisplacementMap
                      in="SourceGraphic"
                      in2="noise"
                      scale={4}
                      xChannelSelector="R"
                      yChannelSelector="G"
                    />
                  </filter>
                </defs>
              </svg>
            )}
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
                style={isFrozen ? { filter: `url(#${frostId})` } : undefined}
              />
            </Avatar>
            {isFrozen && (
              <>
                {/* frosted-glass sheen + icy refraction texture */}
                <span className="pointer-events-none absolute inset-0 z-5 rounded-lg bg-linear-to-br from-white/30 via-semantic-blue-100/10 to-semantic-blue-300/25 mix-blend-overlay" />
                <span className="pointer-events-none absolute inset-0 z-5 rounded-lg bg-radial from-white/25 to-transparent opacity-70 mix-blend-screen" />
                {/* sparkly snowflake border frame */}
                <span
                  aria-label="Frozen"
                  title="Frozen"
                  className="pointer-events-none absolute -inset-1 z-6 bg-cover bg-center mix-blend-screen"
                  style={{
                    backgroundImage: "url('/assets/png/snow-flake-border.png')",
                  }}
                />
              </>
            )}
            <MembershipStateDot
              state={row.original.membershipState}
              className="absolute -bottom-0.5 -right-0.5 z-10"
            />
          </div>
          <span>{name}</span>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'package',
    header: 'Package',
    cell: ({ row }) => <div className="w-28">{row.getValue('package')}</div>,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'feeStatus',
    header: 'Fee status',
    cell: ({ row }) => {
      const status = row.getValue('feeStatus') as
        | 'paid'
        | 'partially_paid'
        | 'unpaid';
      return (
        <div className="w-30">
          <FeeStatusBadge status={status} />
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
    cell: ({ row }) => (
      <div className="w-30 truncate">{row.getValue('email')}</div>
    ),
    enableHiding: true,
    meta: {
      defaultHidden: true,
    },
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ row }) => <div className="w-25">{row.getValue('phone')}</div>,
  },
  {
    accessorKey: 'bloodGroup',
    header: 'Blood group',
    cell: ({ row }) => (
      <div className="w-20 text-center">{row.getValue('bloodGroup')}</div>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'gender',
    header: 'Gender',
    cell: ({ row }) => {
      const gender = row.getValue('gender') as string;
      const capitalizedGender = gender
        ? gender.charAt(0).toUpperCase() + gender.slice(1)
        : '';
      return <div className="w-17.5">{capitalizedGender}</div>;
    },
  },
  {
    accessorKey: 'doj',
    header: 'Date of Joining',
    cell: ({ row }) => (
      <div className="w-25">{safeFormatDate(row.getValue<string>('doj'))}</div>
    ),
  },
  {
    accessorKey: 'dob',
    header: 'Date of Birth',
    cell: ({ row }) => (
      <div className="w-25">{safeFormatDate(row.getValue<string>('dob'))}</div>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <ActionsCell user={row.original} />,
  },
];
