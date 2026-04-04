'use client';

import { Activity, CalendarDays, TrendingUp, Users } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTime } from '@/lib/utils';
import type { TrainerPerformanceSummary } from '@/types/trainer-activity';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
}

function StatCard({ icon, label, value, sub }: StatCardProps) {
  return (
    <Card className="border-none bg-secondary-blue-500 rounded-lg">
      <CardContent className="p-4 flex items-start gap-3">
        <div className="flex-shrink-0 h-9 w-9 rounded-md bg-primary-blue-400/40 flex items-center justify-center">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-primary-blue-200 leading-tight">{label}</p>
          <p className="text-xl font-medium text-white mt-0.5 leading-tight">
            {value}
          </p>
          {sub && (
            <p className="text-[10px] text-primary-blue-200 mt-0.5 leading-tight truncate">
              {sub}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface ActivityStatsProps {
  summary: TrainerPerformanceSummary;
  isLoading: boolean;
}

export function ActivityStats({ summary, isLoading }: ActivityStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const lastActivity = summary.lastActivityDate
    ? formatDateTime(summary.lastActivityDate, 'date')
    : 'No activity yet';

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      <StatCard
        icon={<Activity className="w-4 h-4 text-primary-green-500" />}
        label="Sessions this month"
        value={summary.totalLogsThisMonth}
        sub={`${summary.totalLogsThisWeek} this week`}
      />
      <StatCard
        icon={<Users className="w-4 h-4 text-primary-green-500" />}
        label="Members trained"
        value={summary.activeMembersThisMonth}
        sub="this month"
      />
      <StatCard
        icon={<TrendingUp className="w-4 h-4 text-primary-green-500" />}
        label="Avg sessions / member"
        value={
          summary.avgLogsPerMemberThisMonth > 0
            ? summary.avgLogsPerMemberThisMonth.toFixed(1)
            : '—'
        }
        sub="this month"
      />
      <StatCard
        icon={<CalendarDays className="w-4 h-4 text-primary-green-500" />}
        label="Last active"
        value={lastActivity}
        sub={`${summary.totalLogsAllTime} total logs`}
      />
    </div>
  );
}
