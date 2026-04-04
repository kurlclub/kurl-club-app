// ----------------------------------------------------------------------------
// ENUMS & CONSTANTS
// ----------------------------------------------------------------------------

export type EnergyLevel = 1 | 2 | 3 | 4 | 5;

// ----------------------------------------------------------------------------
// SUB-TYPES
// ----------------------------------------------------------------------------

export interface BodyMetrics {
  weight?: number | null;
  bodyFatPercent?: number | null;
  chestCm?: number | null;
  waistCm?: number | null;
  hipsCm?: number | null;
  armsCm?: number | null;
  thighsCm?: number | null;
}

export interface PerformanceEntry {
  exerciseName: string;
  sets: number;
  reps: number;
  weightKg?: number | null;
  notes?: string | null;
}

// ----------------------------------------------------------------------------
// CORE ENTITY
// ----------------------------------------------------------------------------

export interface ProgressLog {
  logId: number;
  memberId: number;
  memberName: string;
  trainerId: number;
  trainerName: string;
  logDate: string;
  sessionNotes?: string | null;
  energyLevel?: EnergyLevel | null;
  goalProgressPercent?: number | null;
  bodyMetrics: BodyMetrics;
  performanceEntries: PerformanceEntry[];
  createdAt: string;
}

// ----------------------------------------------------------------------------
// API RESPONSE TYPES
// ----------------------------------------------------------------------------

export interface ProgressLogListResponse {
  status: string;
  data: ProgressLog[];
  totalCount: number;
}

export interface ProgressLogResponse {
  status: string;
  message: string;
  data: ProgressLog;
}

// ----------------------------------------------------------------------------
// PAYLOAD TYPES
// ----------------------------------------------------------------------------

/** Body metrics as sent in POST/PUT payloads — backend uses weightKg, not weight */
export interface BodyMetricsPayload {
  weightKg?: number | null;
  bodyFatPercent?: number | null;
  chestCm?: number | null;
  waistCm?: number | null;
  hipsCm?: number | null;
  armsCm?: number | null;
  thighsCm?: number | null;
}

export interface CreateProgressLogPayload {
  memberId: number;
  gymId: number;
  logDate: string;
  sessionNotes?: string;
  energyLevel?: number;
  goalProgressPercent?: number;
  bodyMetrics?: BodyMetricsPayload;
  performanceEntries?: PerformanceEntry[];
}

export interface TrainerTodayLogsResponse {
  status: string;
  data: {
    loggedMemberIds: number[];
  };
}

export interface UpdateProgressLogPayload {
  logId: number;
  logDate?: string;
  sessionNotes?: string;
  energyLevel?: number;
  goalProgressPercent?: number;
  bodyMetrics?: BodyMetricsPayload;
  performanceEntries?: PerformanceEntry[];
}
