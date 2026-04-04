'use client';

import { Activity, CalendarDays, TrendingUp, Users } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTime } from '@/lib/utils';
import { useTrainerActivity } from '@/services/trainer-activity';

interface TrainerStatsBarProps {
  trainerId: number | string;
}

interface StatChipProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
}

function StatChip({ icon, label, value, sub }: StatChipProps) {
  return (
    <div className="flex items-center gap-3 bg-secondary-blue-500 rounded-xl border border-white/5 px-4 py-3 flex-1 min-w-0">
      <div className="flex-shrink-0 h-9 w-9 rounded-md bg-primary-blue-400/40 flex items-center justify-center">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-primary-blue-200 leading-tight truncate">
          {label}
        </p>
        <p className="text-xl font-medium text-white leading-tight">{value}</p>
        {sub && (
          <p className="text-[10px] text-primary-blue-200 leading-tight">
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

export function TrainerStatsBar({ trainerId }: TrainerStatsBarProps) {
  const { data: summary, isLoading } = useTrainerActivity(trainerId);

  if (isLoading) {
    return (
      <div className="flex gap-3 flex-wrap">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 flex-1 min-w-[140px] rounded-xl" />
        ))}
      </div>
    );
  }

  const lastActive = summary?.lastActivityDate
    ? formatDateTime(summary.lastActivityDate, 'date')
    : 'No activity yet';

  return (
    <div className="flex gap-3 flex-wrap">
      <StatChip
        icon={<Activity className="w-4 h-4 text-primary-green-500" />}
        label="Sessions this month"
        value={summary?.totalLogsThisMonth ?? 0}
        sub={`${summary?.totalLogsThisWeek ?? 0} this week`}
      />
      <StatChip
        icon={<Users className="w-4 h-4 text-primary-green-500" />}
        label="Members trained"
        value={summary?.activeMembersThisMonth ?? 0}
        sub="this month"
      />
      <StatChip
        icon={<TrendingUp className="w-4 h-4 text-primary-green-500" />}
        label="Avg sessions / member"
        value={
          summary && summary.avgLogsPerMemberThisMonth > 0
            ? summary.avgLogsPerMemberThisMonth.toFixed(1)
            : '—'
        }
        sub="this month"
      />
      <StatChip
        icon={<CalendarDays className="w-4 h-4 text-primary-green-500" />}
        label="Last active"
        value={lastActive}
        sub={`${summary?.totalLogsAllTime ?? 0} total logs`}
      />
    </div>
  );
}
