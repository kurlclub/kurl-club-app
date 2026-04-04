'use client';

import Link from 'next/link';
import { useState } from 'react';

import { ClipboardList, Users } from 'lucide-react';

import { ProgressLogForm } from '@/components/pages/members/details/progress/progress-log-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSheet } from '@/hooks/use-sheet';
import { formatDateTime } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { useGymBranch } from '@/providers/gym-branch-provider';
import { useTrainerAssignedMembers } from '@/services/member';
import { useTrainerTodayLogs } from '@/services/progress';
import { useTrainerActivity } from '@/services/trainer-activity';

import { MyMembersTable } from './my-members-table';
import { PendingTodayCard } from './pending-today-card';
import { TrainerStatsBar } from './trainer-stats-bar';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getTodayLabel() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function TrainerPortal() {
  const { user } = useAuth();
  const { gymBranch } = useGymBranch();
  const trainerId = user?.userId ?? 0;
  const gymId = gymBranch?.gymId ?? 0;

  // Active member to log for — null = form closed
  const [activeMemberId, setActiveMemberId] = useState<number | null>(null);
  const { isOpen, openSheet, closeSheet } = useSheet();

  // Data
  const { data: allMembersData, isLoading: membersLoading } =
    useTrainerAssignedMembers(gymId, trainerId, { pageSize: 9999 });
  const allMembers = allMembersData?.data ?? [];

  const { data: loggedMemberIds = [], isLoading: logsLoading } =
    useTrainerTodayLogs(trainerId);

  const isLoading = membersLoading || logsLoading;

  const handleQuickLog = (memberId: number) => {
    setActiveMemberId(memberId);
    openSheet();
  };

  const handleSheetClose = (open: boolean) => {
    if (!open) {
      setActiveMemberId(null);
      closeSheet();
    }
  };

  const displayName = user?.userName ?? 'Trainer';

  return (
    <>
      <div className="p-5 md:p-8 bg-background-dark space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-normal text-white leading-snug">
              {getGreeting()}, {displayName}
            </h1>
            <p className="text-sm text-primary-blue-200 mt-0.5">
              {getTodayLabel()}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-primary-blue-200">
            <Users className="w-4 h-4" />
            <span>{allMembers.length} assigned members</span>
          </div>
        </div>

        <TrainerStatsBar trainerId={trainerId} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PendingTodayCard
            allMembers={allMembers}
            loggedMemberIds={loggedMemberIds}
            isLoading={isLoading}
            onQuickLog={handleQuickLog}
          />
          <RecentActivityFeed trainerId={trainerId} />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList className="w-4 h-4 text-primary-blue-200" />
            <h2 className="text-base font-normal text-white">My Members</h2>
          </div>
          <MyMembersTable
            members={allMembers}
            loggedMemberIds={loggedMemberIds}
            isLoading={isLoading}
            onQuickLog={handleQuickLog}
          />
        </div>
      </div>

      {activeMemberId !== null && (
        <ProgressLogForm
          open={isOpen}
          onOpenChange={handleSheetClose}
          memberId={activeMemberId}
        />
      )}
    </>
  );
}

function RecentActivityFeed({ trainerId }: { trainerId: number | string }) {
  const { data: summary, isLoading } = useTrainerActivity(trainerId);
  const recent = summary?.recentActivity?.slice(0, 6) ?? [];

  return (
    <Card className="border-none bg-secondary-blue-500 rounded-lg h-fit">
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-normal text-white flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-primary-blue-200" />
          Recent activity
        </CardTitle>
        {!isLoading && recent.length > 0 && (
          <span className="text-[10px] text-primary-blue-200">
            {summary?.totalLogsAllTime ?? 0} total
          </span>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-2">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-9 w-full rounded" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <p className="text-xs text-primary-blue-200 text-center py-4">
            No activity yet. Start logging member progress!
          </p>
        ) : (
          <div className="space-y-1">
            {recent.map((log) => (
              <div
                key={log.activityId}
                className="flex items-center justify-between gap-2 py-1.5 border-b border-primary-blue-400/50 last:border-0"
              >
                <div className="min-w-0">
                  <Link
                    href={`/members/${log.memberId}`}
                    className="text-xs text-white hover:text-primary-green-500 transition-colors truncate block"
                  >
                    {log.memberName}
                  </Link>
                  <p className="text-[10px] text-primary-blue-200">
                    Progress logged
                  </p>
                </div>
                <span className="text-[10px] text-primary-blue-200 shrink-0">
                  {formatDateTime(log.activityDate, 'date')}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
