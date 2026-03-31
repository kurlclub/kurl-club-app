// ----------------------------------------------------------------------------
// CORE ENTITY
// ----------------------------------------------------------------------------

export interface TrainerActivityLog {
  activityId: number;
  trainerId: number;
  trainerName: string;
  activityDate: string;
  memberId: number;
  memberName: string;
  memberIdentifier: string;
  logId: number;
}

// ----------------------------------------------------------------------------
// AGGREGATE / SUMMARY TYPES
// ----------------------------------------------------------------------------

export interface WeeklyActivityPoint {
  weekLabel: string; // e.g. "Week 1", "Mar 24"
  sessionsLogged: number;
}

export interface TrainerPerformanceSummary {
  trainerId: number;
  trainerName: string;

  // All-time counts
  totalLogsAllTime: number;

  // Current month counts
  totalLogsThisMonth: number;
  activeMembersThisMonth: number;
  avgLogsPerMemberThisMonth: number;

  // Current week counts
  totalLogsThisWeek: number;

  lastActivityDate: string | null;

  // For the bar chart — last 8 weeks
  weeklyActivity: WeeklyActivityPoint[];

  // For the timeline — recent entries
  recentActivity: TrainerActivityLog[];
}

// ----------------------------------------------------------------------------
// API RESPONSE TYPES
// ----------------------------------------------------------------------------

export interface TrainerActivityResponse {
  status: string;
  data: TrainerPerformanceSummary;
}
