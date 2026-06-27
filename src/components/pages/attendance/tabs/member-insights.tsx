import {
  Calendar,
  Flame,
  Percent,
  TrendingDown,
  TrendingUp,
  Trophy,
  UserCheck,
  Users,
} from 'lucide-react';

import InfoCard from '@/components/shared/cards/info-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAvatarColor, getInitials } from '@/lib/avatar-utils';
import { cn } from '@/lib/utils';
import { useGymBranch } from '@/providers/gym-branch-provider';
import { useMemberAnalytics } from '@/services/attendance';
import type { MemberInsight } from '@/types/attendance';

import { MemberInsightsTableView, insightsColumns } from '../table';

const MemberAvatar = ({
  name,
  src,
  className,
}: {
  name: string;
  src?: string | null;
  className?: string;
}) => {
  const avatarStyle = getAvatarColor(name);
  const initials = getInitials(name);
  return (
    <Avatar className={cn('h-9 w-9', className)}>
      <AvatarImage src={src || undefined} alt={name} />
      <AvatarFallback className="text-xs font-semibold" style={avatarStyle}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

function InsightCard({
  icon,
  iconClassName,
  title,
  badge,
  children,
}: {
  icon: React.ReactNode;
  iconClassName: string;
  title: string;
  badge: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="flex h-full flex-col border border-gray-200/70 dark:border-white/5 bg-white dark:bg-secondary-blue-500 rounded-xl overflow-hidden">
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0 px-4 py-3.5 border-b border-gray-100 dark:border-white/5">
        <CardTitle className="flex items-center gap-2.5 text-base font-semibold text-gray-900 dark:text-white">
          <span
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-lg',
              iconClassName
            )}
          >
            {icon}
          </span>
          {title}
        </CardTitle>
        {badge}
      </CardHeader>
      <CardContent className="flex-1 p-1.5">{children}</CardContent>
    </Card>
  );
}

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex h-full min-h-35 items-center justify-center px-4 text-center text-sm text-gray-400 dark:text-white/40">
    {message}
  </div>
);

const RANK_STYLES = [
  'bg-secondary-yellow-500/15 text-secondary-yellow-600 dark:text-secondary-yellow-300',
  'bg-gray-400/15 text-gray-500 dark:text-gray-300',
  'bg-amber-700/15 text-amber-700 dark:text-amber-500',
];

function TopPerformersCard({
  topPerformers,
}: {
  topPerformers: Array<{
    memberName: string;
    photoPath: string | null;
    streak: number;
    visits: number;
  }>;
}) {
  return (
    <InsightCard
      icon={<Trophy size={15} className="text-secondary-yellow-500" />}
      iconClassName="bg-secondary-yellow-500/10"
      title="Top Performers"
      badge={
        <span className="rounded-full bg-gray-100 dark:bg-white/5 px-2 py-0.5 text-xs font-medium text-gray-500 dark:text-white/50">
          {topPerformers.length}
        </span>
      }
    >
      {topPerformers.length === 0 ? (
        <EmptyState message="No attendance recorded yet." />
      ) : (
        <ul className="flex flex-col">
          {topPerformers.map((member, index) => (
            <li
              key={index}
              className="flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-white/3"
            >
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums',
                  RANK_STYLES[index] ??
                    'bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-white/40'
                )}
              >
                {index + 1}
              </span>
              <MemberAvatar name={member.memberName} src={member.photoPath} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {member.memberName}
                </p>
                <p className="text-xs text-gray-500 dark:text-white/50">
                  {member.visits} visits
                </p>
              </div>
              {member.streak > 0 ? (
                <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-gray-600 dark:text-white/70">
                  <Flame
                    size={13}
                    className="text-secondary-yellow-500"
                    fill="currentColor"
                  />
                  <span className="tabular-nums">{member.streak}d</span>
                </span>
              ) : (
                <span className="shrink-0 text-xs text-gray-300 dark:text-white/30">
                  —
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </InsightCard>
  );
}

function formatLastVisit(daysAgo: number | null): string {
  if (daysAgo === null) return 'Never';
  if (daysAgo === 0) return 'Today';
  if (daysAgo === 1) return 'Yesterday';
  return `${daysAgo}d ago`;
}

function AtRiskMembersCard({
  atRiskMembers,
}: {
  atRiskMembers: Array<{
    memberName: string;
    photoPath: string | null;
    daysAgo: number | null;
    visits: number;
  }>;
}) {
  return (
    <InsightCard
      icon={<TrendingDown size={15} className="text-alert-red-500" />}
      iconClassName="bg-alert-red-500/10"
      title="At Risk Members"
      badge={
        <span className="rounded-full bg-alert-red-500/10 px-2 py-0.5 text-xs font-medium text-alert-red-600 dark:text-alert-red-400">
          {atRiskMembers.length}
        </span>
      }
    >
      {atRiskMembers.length === 0 ? (
        <EmptyState message="No members are at risk right now." />
      ) : (
        <ul className="flex max-h-42 flex-col overflow-y-auto">
          {atRiskMembers.map((member, index) => (
            <li
              key={index}
              className="flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-white/3"
            >
              <MemberAvatar
                name={member.memberName}
                src={member.photoPath}
                className="ring-2 ring-alert-red-500/30"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {member.memberName}
                </p>
                <p className="text-xs text-gray-500 dark:text-white/50">
                  {member.visits} visits this month
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs font-medium text-alert-red-500 tabular-nums">
                  {formatLastVisit(member.daysAgo)}
                </p>
                <p className="text-[11px] text-gray-400 dark:text-white/40">
                  last visit
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </InsightCard>
  );
}

function SummaryStats({
  summary,
}: {
  summary?: {
    totalMembers: number;
    activeMembers: number;
    averageAttendanceRate: number;
    topPerformerCount: number;
    atRiskCount: number;
  };
}) {
  const stats = [
    {
      id: 1,
      icon: (
        <Users
          size={20}
          strokeWidth={1.75}
          color="var(--color-semantic-blue-150)"
        />
      ),
      color: 'semantic-blue-500',
      title: 'Total Members',
      count: summary?.totalMembers ?? 0,
    },
    {
      id: 2,
      icon: (
        <UserCheck
          size={20}
          strokeWidth={1.75}
          color="var(--color-semantic-blue-150)"
        />
      ),
      color: 'primary-green-500',
      title: 'Active Members',
      count: summary?.activeMembers ?? 0,
    },
    {
      id: 3,
      icon: (
        <Percent
          size={20}
          strokeWidth={1.75}
          color="var(--color-semantic-blue-150)"
        />
      ),
      color: 'secondary-yellow-150',
      title: 'Avg Attendance',
      count: `${summary?.averageAttendanceRate ?? 0}%`,
    },
    {
      id: 4,
      icon: (
        <TrendingUp
          size={20}
          strokeWidth={1.75}
          color="var(--color-semantic-blue-150)"
        />
      ),
      color: 'alert-red-400',
      title: 'Top Performers',
      count: summary?.topPerformerCount ?? 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <InfoCard item={stat} key={stat.id} />
      ))}
    </div>
  );
}

export default function MemberInsights() {
  const { gymBranch } = useGymBranch();
  const { data: analyticsData } = useMemberAnalytics(gymBranch?.gymId);

  const topPerformers = (analyticsData?.topPerformers || []).map((member) => ({
    memberName: member.memberName,
    photoPath: member.photoPath,
    streak: member.streak,
    visits: member.visits,
  }));

  const atRiskMembers = (analyticsData?.atRiskMembers || []).map((member) => ({
    memberName: member.memberName,
    photoPath: member.photoPath,
    daysAgo: member.daysAgo,
    visits: member.visits,
  }));

  const memberInsights: MemberInsight[] = (
    analyticsData?.memberAnalytics || []
  ).map((item) => ({
    id: item.memberIdentifier,
    memberIdentifier: item.memberIdentifier,
    name: item.memberName,
    memberName: item.memberName,
    totalVisits: item.totalVisits,
    visitsThisMonth: item.visitsThisMonth,
    currentStreak: item.currentStreak,
    longestStreak: item.longestStreak,
    averageDuration: Math.round(item.averageDuration),
    peakTime: item.peakTime,
    attendanceRate: item.attendanceRate,
    photoPath: item.photoPath,
  }));

  return (
    <div className="flex flex-col gap-4">
      <SummaryStats summary={analyticsData?.summary} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopPerformersCard topPerformers={topPerformers} />
        <AtRiskMembersCard atRiskMembers={atRiskMembers} />
      </div>
      <div>
        <h3 className="text-gray-900 dark:text-white text-base font-normal mb-3 flex items-center gap-2">
          <Calendar size={16} />
          Member Analytics
        </h3>
        <MemberInsightsTableView
          insights={memberInsights}
          columns={insightsColumns}
        />
      </div>
    </div>
  );
}
