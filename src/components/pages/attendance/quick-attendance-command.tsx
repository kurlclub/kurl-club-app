'use client';

import React from 'react';

import { UserCheck, UserPlus, UserX } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { getAvatarColor, getInitials } from '@/lib/avatar-utils';
import { useGymBranch } from '@/providers/gym-branch-provider';
import { useAttendanceRecords } from '@/services/attendance';
import { useAllGymMembers } from '@/services/member';

type Props = {
  onCheckIn: (member: { id: number; name: string; identifier: string }) => void;
  onCheckOut: (member: {
    id: number;
    name: string;
    identifier: string;
  }) => void;
};

export function QuickAttendanceCommand({ onCheckIn, onCheckOut }: Props) {
  const { gymBranch } = useGymBranch();
  const { data: members = [] } = useAllGymMembers(gymBranch?.gymId || 0);
  const { data: attendanceResponse } = useAttendanceRecords(gymBranch?.gymId);
  const attendanceRecords = attendanceResponse?.data || [];
  const [open, setOpen] = React.useState(false);

  const handleAction = (member: {
    id: number;
    name: string;
    identifier: string;
  }) => {
    const attendanceRecord = attendanceRecords.find(
      (r) => r.memberIdentifier === member.identifier
    );
    const isCheckedIn = attendanceRecord && !attendanceRecord.checkOutTime;

    if (isCheckedIn) {
      onCheckOut(member);
    } else {
      onCheckIn(member);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <UserPlus size={16} />
          Record Attendance
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[calc(100vw-2rem)] sm:w-[400px] p-0 shad-select-content"
        align="end"
        sideOffset={5}
        avoidCollisions={false}
      >
        <Command className="shad-command">
          <CommandInput
            placeholder="Search member..."
            className="shad-command-input"
            autoFocus={false}
          />
          <CommandList className="shad-command-list">
            <CommandEmpty className="shad-command-empty">
              No member found.
            </CommandEmpty>
            <CommandGroup className="shad-command-group">
              {members.map((member) => {
                const attendanceRecord = attendanceRecords.find(
                  (r) => r.memberIdentifier === member.memberIdentifier
                );
                const isCheckedIn =
                  attendanceRecord && !attendanceRecord.checkOutTime;
                const avatarStyle = getAvatarColor(member.memberName);
                const initials = getInitials(member.memberName);

                return (
                  <CommandItem
                    key={member.memberId}
                    value={`${member.memberName} ${member.memberIdentifier || ''}`}
                    className="shad-command-item px-3 py-2.5 cursor-default!"
                  >
                    <div className="flex items-center justify-between w-full gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="relative shrink-0">
                          <Avatar className="h-10 w-10 border-2 border-secondary-blue-400">
                            {member?.photoPath ? (
                              <AvatarImage
                                src={member.photoPath}
                                alt={member.memberName}
                              />
                            ) : (
                              <AvatarFallback
                                className="text-xs font-semibold"
                                style={avatarStyle}
                              >
                                {initials}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          {isCheckedIn && (
                            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                              <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-primary-green-400 opacity-75"></span>
                              <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white dark:border-secondary-blue-500 bg-primary-green-500"></span>
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col gap-0 leading-none">
                            <span className="text-sm font-semibold dark:text-white truncate">
                              {member.memberName}
                            </span>
                            <span className="text-[9px] text-gray-400">
                              #{member.memberIdentifier || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={isCheckedIn ? 'destructive' : 'default'}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction({
                            id: member.memberId,
                            name: member.memberName,
                            identifier: member.memberIdentifier || '',
                          });
                        }}
                      >
                        {isCheckedIn ? (
                          <>
                            <UserX size={14} />
                            Check Out
                          </>
                        ) : (
                          <>
                            <UserCheck size={14} />
                            Check In
                          </>
                        )}
                      </Button>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
