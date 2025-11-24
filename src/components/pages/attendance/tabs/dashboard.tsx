'use client';

import { useEffect, useState } from 'react';

import { format } from 'date-fns';
import {
  Activity,
  Clock,
  Timer,
  TrendingUp,
  UserCheck,
  UserX,
  Users,
} from 'lucide-react';
import { Pie, PieChart } from 'recharts';

import { InfoBadge } from '@/components/shared/badges';
import InfoCard from '@/components/shared/cards/info-card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { getAvatarColor, getInitials } from '@/lib/avatar-utils';
import { useGymBranch } from '@/providers/gym-branch-provider';
import { useAttendanceDashboard } from '@/services/attendance';

// WIDGETS
function LiveStatusHeader({ currentTime }: { currentTime: Date }) {
  return (
    <div className="flex items-center justify-between">
      <InfoBadge variant="success">All Systems Operational</InfoBadge>
      <div className="text-gray-400 text-sm">
        {format(currentTime, 'MMM dd, yyyy • HH:mm:ss')}
      </div>
    </div>
  );
}

function StatsCards({
  dashboardData,
}: {
  dashboardData?: {
    totalCheckIns: number;
    totalCheckOuts: number;
    currentlyActive: number;
    avgSessionMinutes: number;
  };
}) {
  const stats = [
    {
      id: 1,
      icon: <Users size={20} strokeWidth={1.75} color="#151821" />,
      color: 'primary-green-500',
      title: 'Currently Active',
      count: dashboardData?.currentlyActive ?? 0,
    },
    {
      id: 2,
      icon: <UserCheck size={20} strokeWidth={1.75} color="#151821" />,
      color: 'semantic-blue-500',
      title: "Today's Check-ins",
      count: dashboardData?.totalCheckIns ?? 0,
    },
    {
      id: 3,
      icon: <UserX size={20} strokeWidth={1.75} color="#151821" />,
      color: 'secondary-yellow-150',
      title: "Today's Check-outs",
      count: dashboardData?.totalCheckOuts ?? 0,
    },
    {
      id: 4,
      icon: <Timer size={20} strokeWidth={1.75} color="#151821" />,
      color: 'alert-red-400',
      title: 'Avg Session',
      count: `${dashboardData?.avgSessionMinutes ?? 0}m`,
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

const StatItem = ({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
}) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full bg-[${color}]`}></span>
      <span className="text-xs text-gray-300">{label}</span>
    </div>
    <span className="font-semibold text-sm">{value}</span>
  </div>
);

function TodaysSummary({
  dashboardData,
}: {
  dashboardData?: {
    totalCheckIns: number;
    totalCheckOuts: number;
    currentlyActive: number;
    avgSessionMinutes: number;
  };
}) {
  const chartData = [
    {
      name: 'Check-ins',
      value: dashboardData?.totalCheckIns ?? 0,
      fill: '#EBFB8B',
    },
    {
      name: 'Check-outs',
      value: dashboardData?.totalCheckOuts ?? 0,
      fill: '#90A8ED',
    },
    {
      name: 'Currently Active',
      value: dashboardData?.currentlyActive ?? 0,
      fill: '#96AF01',
    },
  ];

  const chartConfig = {
    value: { label: 'Count' },
    checkins: { label: 'Check-ins', color: '#EBFB8B' },
    checkouts: { label: 'Check-outs', color: '#90A8ED' },
    active: { label: 'Currently Active', color: '#96AF01' },
  } satisfies ChartConfig;

  return (
    <Card className="border-none bg-secondary-blue-500 rounded-lg">
      <CardHeader className="p-5 pb-3">
        <CardTitle className="text-white text-base font-normal leading-normal flex items-center gap-2">
          <Clock size={16} />
          Today&apos;s Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row items-center gap-4 p-5 pt-0">
        <div className="w-[160px] h-[160px] relative flex-shrink-0">
          <ChartContainer config={chartConfig} className="w-full h-full">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={75}
                strokeWidth={0}
              />
            </PieChart>
          </ChartContainer>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-center pointer-events-none">
            <div className="text-2xl font-bold">
              {dashboardData?.totalCheckIns ?? 0}
            </div>
            <div className="text-[10px] text-gray-400">Total Check-ins</div>
          </div>
        </div>
        <div className="flex flex-col flex-1 w-full justify-center gap-2 text-white">
          <div className="bg-primary-blue-400 rounded-lg p-3 space-y-2">
            <StatItem
              color="#EBFB8B"
              label="Check-ins"
              value={dashboardData?.totalCheckIns ?? 0}
            />
            <StatItem
              color="#90A8ED"
              label="Check-outs"
              value={dashboardData?.totalCheckOuts ?? 0}
            />
          </div>
          <div className="bg-primary-blue-400 rounded-lg p-3 space-y-2">
            <StatItem
              color="#96AF01"
              label="Currently Active"
              value={dashboardData?.currentlyActive ?? 0}
            />
            <StatItem
              color="#96AF01"
              label="Unique Members"
              value={dashboardData?.currentlyActive ?? 0}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LiveActivityFeed() {
  const placeholderActivity = [
    {
      memberName: 'Sample User',
      action: 'checked-in',
      time: '2 min ago',
      duration: null,
    },
  ];
  return (
    <Card className="relative border-none bg-secondary-blue-500 rounded-lg overflow-hidden">
      <div className="absolute inset-0 backdrop-blur-[2px] bg-secondary-blue-500/15 z-20 flex items-center justify-center">
        <div className="bg-white dark:bg-secondary-blue-400 rounded-lg px-6 py-3 shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            Coming Soon
          </p>
        </div>
      </div>
      <CardHeader className="p-5 pb-5">
        <CardTitle className="text-white text-base font-normal leading-normal flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={16} />
            Live Activity Feed
          </div>
          <span className="text-[10px] font-medium text-primary-green-600 dark:text-primary-green-400 bg-primary-green-500/10 px-2 py-1 rounded-full">
            LIVE
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        <div className="relative max-h-[200px] overflow-y-auto pr-2">
          <div className="absolute left-[15px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-gray-200 via-gray-300 to-transparent dark:from-secondary-blue-400 dark:via-secondary-blue-400" />
          <div className="space-y-3">
            {placeholderActivity.map((activity, index) => {
              const avatarStyle = getAvatarColor(activity.memberName);
              const initials = getInitials(activity.memberName);
              const isCheckIn = activity.action === 'checked-in';
              return (
                <div
                  key={index}
                  className="relative flex items-start justify-between gap-3 pl-1"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="relative z-10 flex-shrink-0">
                      <Avatar className="h-7 w-7 ring-2 ring-white dark:ring-secondary-blue-500">
                        <AvatarFallback
                          className="text-[10px] font-semibold"
                          style={avatarStyle}
                        >
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-secondary-blue-500 ${
                          isCheckIn
                            ? 'bg-primary-green-500'
                            : 'bg-semantic-blue-500'
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-gray-900 dark:text-white text-sm font-medium truncate">
                          {activity.memberName}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            isCheckIn
                              ? 'bg-primary-green-500/15 text-primary-green-600 dark:text-primary-green-400'
                              : 'bg-semantic-blue-500/15 text-semantic-blue-600 dark:text-semantic-blue-400'
                          }`}
                        >
                          {isCheckIn ? 'CHECKED IN' : 'CHECKED OUT'}
                        </span>
                      </div>
                      {activity.duration && (
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                          <Clock size={10} />
                          <span>Session: {activity.duration}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right pt-0.5">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.time.split(' ')[0]}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.time.split(' ')[1]}{' '}
                      {activity.time.split(' ')[2]}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
      <div className="absolute bottom-0 left-0 w-full h-20 bg-linear-to-t from-secondary-blue-500 via-secondary-blue-500/70 to-transparent rounded-b-lg pointer-events-none z-10" />
    </Card>
  );
}

function PeakHoursAnalysis({
  dashboardData,
}: {
  dashboardData?: {
    peakHoursAnalysis: Array<{
      time: string;
      members: number;
      isPeak: boolean;
    }>;
  };
}) {
  const peakHours = dashboardData?.peakHoursAnalysis ?? [];
  const maxCount = Math.max(...peakHours.map((h) => h.members), 1);

  return (
    <Card className="border-none bg-secondary-blue-500 rounded-lg">
      <CardHeader className="p-5 pb-5">
        <CardTitle className="text-white text-base font-normal leading-normal flex items-center gap-2">
          <TrendingUp size={16} />
          Peak Hours Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {peakHours.map((hour, index) => {
            const isHighest = hour.isPeak;
            const relativeWidth = (hour.members / maxCount) * 100;

            return (
              <div
                key={index}
                className="group relative bg-gray-50 dark:bg-primary-blue-400 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-secondary-blue-600 transition-all"
              >
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {hour.time}
                    </span>
                    {isHighest && (
                      <span className="flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-primary-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-green-500"></span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-end gap-2 mb-4">
                    <div
                      className={`text-3xl font-bold leading-none ${
                        isHighest
                          ? 'text-primary-green-500'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {hour.members}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 pb-1">
                      members
                    </div>
                  </div>

                  <div className="relative h-2.5 bg-gray-200 dark:bg-secondary-blue-700 rounded-full overflow-hidden">
                    <div
                      className={`absolute left-0 top-0 bottom-0 rounded-full transition-all duration-700 ease-out ${
                        isHighest
                          ? 'bg-gradient-to-r from-primary-green-500 to-primary-green-400'
                          : 'bg-gradient-to-r from-semantic-blue-500 to-semantic-blue-400'
                      }`}
                      style={{ width: `${relativeWidth}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {isHighest && (
                  <div className="absolute -top-1 -right-1 bg-primary-green-500 text-black text-[9px] font-bold px-2 py-0.5 rounded-full">
                    PEAK
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { gymBranch } = useGymBranch();
  const { data: dashboardData } = useAttendanceDashboard(gymBranch?.gymId);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <LiveStatusHeader currentTime={currentTime} />
      <StatsCards dashboardData={dashboardData} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TodaysSummary dashboardData={dashboardData} />
        <LiveActivityFeed />
      </div>
      <PeakHoursAnalysis dashboardData={dashboardData} />
    </div>
  );
}
