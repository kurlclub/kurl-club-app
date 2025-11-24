import {
  Award,
  Calendar,
  Percent,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { motion } from 'motion/react';

import InfoCard from '@/components/shared/cards/info-card';
import { MedalIcon } from '@/components/shared/icons';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAvatarColor, getInitials } from '@/lib/avatar-utils';
import { useGymBranch } from '@/providers/gym-branch-provider';
import { useMemberAnalytics } from '@/services/attendance';
import type { MemberInsight } from '@/types/attendance';

import { MemberInsightsTableView, insightsColumns } from '../table';

const MemberAvatar = ({
  name,
  ringClass = 'ring-white dark:ring-secondary-blue-500',
}: {
  name: string;
  ringClass?: string;
}) => {
  const avatarStyle = getAvatarColor(name);
  const initials = getInitials(name);
  return (
    <Avatar className={`h-7 w-7 ring-2 ${ringClass}`}>
      <AvatarFallback className="text-[10px] font-semibold" style={avatarStyle}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

function TopPerformersCard({
  topPerformers,
}: {
  topPerformers: Array<{ name: string; streak: number; visits: number }>;
}) {
  const getMedalVariant = (index: number): 'gold' | 'silver' | 'bronze' => {
    if (index === 0) return 'gold';
    if (index === 1) return 'silver';
    return 'bronze';
  };

  return (
    <Card className="border-none bg-white dark:bg-secondary-blue-500 rounded-lg overflow-hidden">
      <CardHeader className="p-5 pb-3">
        <CardTitle className="text-gray-900 dark:text-white text-base font-normal leading-normal flex items-center gap-2">
          <Award size={16} className="text-secondary-yellow-500" />
          Top Performers
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        <div className="space-y-2">
          {topPerformers.map((member, index) => {
            const isFirst = index === 0;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className={`group relative flex items-center gap-3 p-2.5 rounded-lg transition-all ${
                  isFirst
                    ? 'bg-gradient-to-r from-secondary-yellow-500/10 to-transparent border border-secondary-yellow-500/30'
                    : 'glass-effect glass-effect-hover'
                }`}
              >
                {isFirst && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary-green-500/5 to-transparent rounded-lg"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}

                <div className="relative z-10 flex items-center gap-3 flex-1 min-w-0">
                  <div className="relative flex-shrink-0">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <MemberAvatar
                        name={member.name}
                        ringClass={
                          isFirst
                            ? 'ring-primary-green-500/50'
                            : 'ring-white dark:ring-secondary-blue-500'
                        }
                      />
                    </motion.div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                      className="absolute -bottom-1.5 -right-1.5"
                    >
                      <MedalIcon
                        variant={getMedalVariant(index)}
                        width={18}
                        height={18}
                      />
                    </motion.div>
                  </div>

                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="text-gray-900 dark:text-white text-sm font-medium truncate">
                      {member.name}
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">
                      {member.visits} visits
                    </div>
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative z-10 flex-shrink-0 flex items-center gap-1 bg-primary-green-500/10 px-2 py-1 rounded-full"
                >
                  <span className="text-xs">🔥</span>
                  <span className="text-xs font-bold text-primary-green-600 dark:text-primary-green-400">
                    {member.streak}d
                  </span>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function AtRiskMembersCard({
  atRiskMembers,
}: {
  atRiskMembers: Array<{ name: string; lastVisit: string; visits: number }>;
}) {
  return (
    <Card className="relative border-none bg-white dark:bg-secondary-blue-500 rounded-lg overflow-hidden">
      <CardHeader className="p-5 pb-3">
        <CardTitle className="text-gray-900 dark:text-white text-base font-normal leading-normal flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown size={16} className="text-alert-red-500" />
            At Risk Members
          </div>
          <span className="text-[10px] font-medium text-alert-red-600 dark:text-alert-red-400 bg-alert-red-500/10 px-2 py-1 rounded-full">
            {atRiskMembers.length} MEMBERS
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        <div className="relative max-h-[200px] overflow-y-auto pr-2">
          <div className="space-y-2">
            {atRiskMembers.map((member, index) => (
              <div
                key={index}
                className="relative flex items-start justify-between gap-3 p-2.5 glass-effect glass-effect-hover rounded-lg transition-all"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="relative z-10 flex-shrink-0">
                    <MemberAvatar name={member.name} />
                    <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-secondary-blue-500 bg-alert-red-500" />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="text-gray-900 dark:text-white text-sm font-medium truncate">
                      {member.name}
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">
                      {member.visits} visits this month
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right pt-0.5">
                  <div className="text-xs font-semibold text-alert-red-500">
                    {member.lastVisit.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">
                    {member.lastVisit.split(' ')[1]}{' '}
                    {member.lastVisit.split(' ')[2]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white dark:from-secondary-blue-500 to-transparent pointer-events-none" />
    </Card>
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
      icon: <Users size={20} strokeWidth={1.75} color="#151821" />,
      color: 'semantic-blue-500',
      title: 'Total Members',
      count: summary?.totalMembers ?? 0,
    },
    {
      id: 2,
      icon: <UserCheck size={20} strokeWidth={1.75} color="#151821" />,
      color: 'primary-green-500',
      title: 'Active Members',
      count: summary?.activeMembers ?? 0,
    },
    {
      id: 3,
      icon: <Percent size={20} strokeWidth={1.75} color="#151821" />,
      color: 'secondary-yellow-150',
      title: 'Avg Attendance',
      count: `${summary?.averageAttendanceRate ?? 0}%`,
    },
    {
      id: 4,
      icon: <TrendingUp size={20} strokeWidth={1.75} color="#151821" />,
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
    name: member.name,
    streak: member.streak,
    visits: member.visits,
  }));

  const atRiskMembers = (analyticsData?.atRiskMembers || []).map((member) => ({
    name: member.name,
    lastVisit:
      member.daysAgo === null
        ? 'Never'
        : member.daysAgo === 0
          ? 'Today'
          : `${member.daysAgo} days ago`,
    visits: member.visits,
  }));

  const memberInsights: MemberInsight[] = (
    analyticsData?.memberAnalytics || []
  ).map((item) => ({
    id: item.memberIdentifier,
    memberIdentifier: item.memberIdentifier,
    name: item.name,
    totalVisits: item.totalVisits,
    visitsThisMonth: item.visitsThisMonth,
    currentStreak: item.currentStreak,
    longestStreak: item.longestStreak,
    averageDuration: Math.round(item.averageDuration),
    favoriteTime: item.peakTime,
    attendanceRate: item.attendanceRate,
    profilePicture: item.profilePicture,
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
