'use client';

import Link from 'next/link';

import { FeeStatusBadge } from '@/components/shared/badges/fee-status-badge';
import { Search } from '@/components/shared/search';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSearch } from '@/hooks/use-search';
import { getInitials, getProfilePictureSrc } from '@/lib/utils';
import type { Member } from '@/types/members';

interface MemberListProps {
  members: Member[];
}

export function MemberList({ members }: MemberListProps) {
  // Search function to filter members based on name or identifier
  const searchFunction = (items: Member[], term: string) => {
    return items.filter(
      (member) =>
        member.name.toLowerCase().includes(term.toLowerCase()) ||
        member.memberIdentifier?.toLowerCase().includes(term.toLowerCase())
    );
  };

  const {
    items: filteredMembers,
    search,
    searchTerm,
  } = useSearch(members, searchFunction);

  return (
    <div>
      {/* Search Input */}
      <Search onSearch={search} value={searchTerm} />

      <ScrollArea className="h-[500px] pr-4 mt-4">
        {filteredMembers.length > 0 ? (
          filteredMembers.map((member) => (
            <Link
              href={`/members/${member.id}`}
              key={member.id}
              className="flex items-center justify-between py-3 border-b border-primary-blue-400 hover:bg-primary-blue-400/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-[38px] w-[38px]">
                  <AvatarFallback className="bg-primary-blue-400/70">
                    {getInitials(member.name)}
                  </AvatarFallback>
                  <AvatarImage
                    src={getProfilePictureSrc(
                      member.profilePicture,
                      member.avatar
                    )}
                    alt={member.name}
                  />
                </Avatar>
                <div>
                  <h3 className="font-medium text-white">{member.name}</h3>
                  <p className="text-sm text-gray-400 uppercase">
                    #{member.memberIdentifier}
                  </p>
                </div>
              </div>
              <FeeStatusBadge
                status={member.feeStatus}
                showIcon={false}
                className="rounded-full px-3"
              />
            </Link>
          ))
        ) : (
          <p className="text-center text-gray-400 mt-4">No members found</p>
        )}
      </ScrollArea>
    </div>
  );
}
