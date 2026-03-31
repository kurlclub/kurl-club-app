'use client';

import { AlertCircle } from 'lucide-react';

import { useTrainerActivity } from '@/services/trainer-activity';

import { ActivityChart } from './activity-chart';
import { ActivityStats } from './activity-stats';
import { ActivityTimeline } from './activity-timeline';

interface TrainerActivityTabProps {
  trainerId: string;
}

export default function TrainerActivityTab({
  trainerId,
}: TrainerActivityTabProps) {
  const {
    data: summary,
    isLoading,
    isError,
    error,
  } = useTrainerActivity(trainerId);

  let errorMessage =
    'Could not load activity data. The backend endpoint may not be set up yet.';
  if (isError && error && error.message) {
    errorMessage = error.message;
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-primary-blue-400 bg-secondary-blue-500 p-4 mt-2">
        <AlertCircle className="w-4 h-4 text-alert-red-400 flex-shrink-0" />
        <p className="text-sm text-primary-blue-200">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stats Cards */}
      <ActivityStats
        summary={
          summary ?? {
            trainerId: Number(trainerId),
            trainerName: '',
            totalLogsAllTime: 0,
            totalLogsThisMonth: 0,
            activeMembersThisMonth: 0,
            avgLogsPerMemberThisMonth: 0,
            totalLogsThisWeek: 0,
            lastActivityDate: null,
            weeklyActivity: [],
            recentActivity: [],
          }
        }
        isLoading={isLoading}
      />

      {/* Weekly Bar Chart */}
      {!isLoading && summary && <ActivityChart data={summary.weeklyActivity} />}

      {/* Section header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-white">Recent Activity</p>
        {!isLoading && summary && (
          <span className="text-xs text-primary-blue-200">
            {summary.recentActivity.length} entries
          </span>
        )}
      </div>

      {/* Activity Log Timeline */}
      <ActivityTimeline
        logs={summary?.recentActivity ?? []}
        isLoading={isLoading}
      />
    </div>
  );
}
