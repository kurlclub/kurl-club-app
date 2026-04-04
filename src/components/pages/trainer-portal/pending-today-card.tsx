'use client';

import { CheckCircle2, ClipboardList, Plus } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getAvatarColor, getInitials } from '@/lib/avatar-utils';
import { getProfilePictureSrc } from '@/lib/utils';
import { MemberListItem } from '@/types/member.types';

interface PendingTodayCardProps {
  allMembers: MemberListItem[];
  loggedMemberIds: number[];
  isLoading: boolean;
  onQuickLog: (memberId: number) => void;
}

export function PendingTodayCard({
  allMembers,
  loggedMemberIds,
  isLoading,
  onQuickLog,
}: PendingTodayCardProps) {
  const loggedSet = new Set(loggedMemberIds);
  const pending = allMembers.filter((m) => !loggedSet.has(m.memberId));
  const doneCount = allMembers.length - pending.length;
  const allDone = pending.length === 0 && allMembers.length > 0;

  if (isLoading) {
    return (
      <Card className="border-none bg-secondary-blue-500 rounded-lg h-fit">
        <CardHeader className="p-4 pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none bg-secondary-blue-500 rounded-lg h-fit">
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-sm font-normal text-white flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-primary-blue-200" />
          Pending today
        </CardTitle>
        {allMembers.length > 0 && (
          <Badge className="bg-primary-blue-400/40 text-primary-blue-100 text-[10px]">
            {doneCount}/{allMembers.length} done
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-4 pt-2">
        {allDone ? (
          <div className="flex flex-col items-center py-6 gap-2">
            <CheckCircle2 className="w-8 h-8 text-primary-green-500" />
            <p className="text-sm text-primary-green-500 font-medium">
              All members logged today!
            </p>
          </div>
        ) : pending.length === 0 && allMembers.length === 0 ? (
          <p className="text-xs text-primary-blue-200 text-center py-4">
            No members assigned yet.
          </p>
        ) : (
          <div className="space-y-2">
            {pending.map((member) => {
              const name = member.memberName || 'Unknown';
              const avatarStyle = getAvatarColor(name);

              return (
                <div
                  key={member.memberId}
                  className="flex items-center justify-between gap-2 rounded-lg bg-primary-blue-500/30 px-3 py-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="h-7 w-7 flex-shrink-0">
                      <AvatarFallback
                        className="text-[10px] font-medium"
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
                      <p className="text-xs text-white truncate">{name}</p>
                      <p className="text-[10px] text-primary-blue-200">
                        #{member.memberIdentifier}
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="h-7 text-xs px-2 flex-shrink-0"
                    onClick={() => onQuickLog(member.memberId)}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Log
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
