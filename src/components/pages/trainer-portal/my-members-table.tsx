'use client';

import Link from 'next/link';
import { useState } from 'react';

import { Eye, Plus, Search } from 'lucide-react';

import { FeeStatusBadge } from '@/components/shared/badges/fee-status-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { getAvatarColor, getInitials } from '@/lib/avatar-utils';
import { getProfilePictureSrc } from '@/lib/utils';
import { MemberListItem } from '@/types/member.types';

interface MyMembersTableProps {
  members: MemberListItem[];
  loggedMemberIds: number[];
  isLoading: boolean;
  onQuickLog: (memberId: number) => void;
}

export function MyMembersTable({
  members,
  loggedMemberIds,
  isLoading,
  onQuickLog,
}: MyMembersTableProps) {
  const [search, setSearch] = useState('');
  const loggedSet = new Set(loggedMemberIds);

  const filtered = members.filter(
    (m) =>
      !search ||
      m.memberName.toLowerCase().includes(search.toLowerCase()) ||
      m.memberIdentifier.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary-blue-200" />
        <Input
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-9 bg-secondary-blue-500 border-primary-blue-400 text-white text-sm placeholder:text-primary-blue-200"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-primary-blue-200 py-4 text-center">
          {search
            ? 'No members match your search.'
            : 'No members assigned yet.'}
        </p>
      ) : (
        <div className="rounded-lg border border-primary-blue-400 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-4 py-2 bg-primary-blue-500/50 border-b border-primary-blue-400">
            <span className="text-[10px] uppercase tracking-wide text-primary-blue-200">
              Member
            </span>
            <span className="text-[10px] uppercase tracking-wide text-primary-blue-200 w-24 text-center">
              Fee Status
            </span>
            <span className="text-[10px] uppercase tracking-wide text-primary-blue-200 w-20 text-center">
              Today
            </span>
            <span className="text-[10px] uppercase tracking-wide text-primary-blue-200 w-20 text-center">
              Actions
            </span>
          </div>

          {/* Rows */}
          {filtered.map((member) => {
            const name = member.memberName || 'Unknown';
            const avatarStyle = getAvatarColor(name);
            const isLoggedToday = loggedSet.has(member.memberId);

            return (
              <div
                key={member.memberId}
                className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center px-4 py-2.5 border-b border-primary-blue-400/50 last:border-0 hover:bg-primary-blue-500/20 transition-colors"
              >
                {/* Member info */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback
                      className="text-xs font-medium"
                      style={avatarStyle}
                    >
                      {getInitials(name)}
                    </AvatarFallback>
                    <AvatarImage
                      src={getProfilePictureSrc(
                        member.profilePicture,
                        member.photoPath
                      )}
                      alt={name}
                    />
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">{name}</p>
                    <p className="text-[10px] text-primary-blue-200">
                      #{member.memberIdentifier}
                    </p>
                  </div>
                </div>

                {/* Fee status */}
                <div className="w-24 flex justify-center">
                  <FeeStatusBadge
                    status={
                      member.feeStatus as 'paid' | 'partially_paid' | 'unpaid'
                    }
                  />
                </div>

                {/* Today logged indicator */}
                <div className="w-20 flex justify-center">
                  {isLoggedToday ? (
                    <span className="text-[10px] text-primary-green-500 font-medium bg-primary-green-500/10 rounded-full px-2 py-0.5">
                      Logged
                    </span>
                  ) : (
                    <span className="text-[10px] text-primary-blue-200 bg-primary-blue-400/30 rounded-full px-2 py-0.5">
                      Pending
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="w-20 flex items-center justify-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 w-7 p-0"
                    onClick={() => onQuickLog(member.memberId)}
                    title="Add progress log"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    asChild
                    title="View member profile"
                  >
                    <Link href={`/members/${member.memberId}`}>
                      <Eye className="w-3.5 h-3.5 text-primary-green-500" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
