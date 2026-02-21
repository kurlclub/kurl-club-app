import { useEffect, useState } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api';
import {
  AttendanceRealtimeConnectionState,
  AttendanceRealtimeUpdate,
  attendanceSignalRService,
} from '@/services/attendance/signalr';

// Types
export type DashboardData = {
  totalCheckIns: number;
  totalCheckOuts: number;
  currentlyActive: number;
  avgSessionMinutes: number;
  peakHoursAnalysis: Array<{
    time: string;
    members: number;
    isPeak: boolean;
  }>;
};

export type MemberAnalyticsItem = {
  memberId: number;
  memberIdentifier: string;
  memberName: string;
  photoPath: string | null;
  attendanceRate: number;
  visitsThisMonth: number;
  totalVisits: number;
  currentStreak: number;
  longestStreak: number;
  averageDuration: number;
  peakTime: string;
};

export type MemberAnalyticsResponse = {
  topPerformers: Array<{
    memberId: number;
    memberIdentifier: string;
    name: string;
    photoPath: string | null;
    visits: number;
    streak: number;
  }>;
  atRiskMembers: Array<{
    memberId: number;
    memberIdentifier: string;
    name: string;
    photoPath: string | null;
    visits: number;
    lastVisitDate: string | null;
    daysAgo: number | null;
  }>;
  memberAnalytics: MemberAnalyticsItem[];
  summary: {
    totalMembers: number;
    activeMembers: number;
    averageAttendanceRate: number;
    topPerformerCount: number;
    atRiskCount: number;
  };
};

export type CheckInRequest = {
  memberId: number;
  gymId: number;
  recordedBy: number;
};

export type CheckOutRequest = {
  memberId: number;
  gymId: number;
  recordedBy: number;
};

export type AttendanceRecordResponse = {
  id: number;
  memberId: number;
  memberIdentifier: string;
  memberName: string;
  date: string;
  checkInTime: string;
  checkOutTime: string | null;
  duration: number;
  status: string;
  recordedBy?: {
    userId: number;
    userName: string | null;
    email: string;
    role: string;
  } | null;
  mode: string;
  profilePicture?: string;
  photoPath?: string | null;
};

export type AttendanceApiResponse = {
  status: string;
  message: string;
  data: AttendanceRecordResponse[];
  appliedFilters?: unknown;
  availableFilters?: unknown;
  pagination?: unknown;
  summary?: unknown;
};

const FALLBACK_POLLING_INTERVAL_MS = 30 * 1000;
const SAFETY_REFRESH_INTERVAL_MS = 10 * 60 * 1000;

// API Functions
export const fetchAttendanceDashboard = async (gymId: number) => {
  return await api.get<DashboardData>(`/Attendance/${gymId}/dashboard`);
};

export const fetchMemberAnalytics = async (gymId: number) => {
  const response = await api.get<{ data: MemberAnalyticsResponse }>(
    `/Attendance/${gymId}/member-analytics`
  );
  return response.data;
};

export const fetchAttendanceRecords = async (gymId: number) => {
  return await api.get<AttendanceApiResponse>(
    `/Attendance/${gymId}/attendance`
  );
};

export const checkInMember = async (data: CheckInRequest) => {
  return await api.post('/Attendance/checkin', data);
};

export const checkOutMember = async (data: CheckOutRequest) => {
  return await api.post('/Attendance/checkout', data);
};

// React Query Hooks
export const useAttendanceDashboard = (gymId: number | undefined) => {
  return useQuery({
    queryKey: ['attendance-dashboard', gymId],
    queryFn: () => fetchAttendanceDashboard(gymId!),
    enabled: !!gymId,
    refetchInterval: 30000,
  });
};

export const useMemberAnalytics = (gymId: number | undefined) => {
  return useQuery({
    queryKey: ['member-analytics', gymId],
    queryFn: () => fetchMemberAnalytics(gymId!),
    enabled: !!gymId,
  });
};

interface UseAttendanceRecordsOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
}

export const useAttendanceRecords = (
  gymId: number | undefined,
  { enabled = true, refetchInterval = 30000 }: UseAttendanceRecordsOptions = {}
) => {
  return useQuery({
    queryKey: ['attendance-records', gymId],
    queryFn: () => fetchAttendanceRecords(gymId!),
    enabled: enabled && !!gymId,
    refetchInterval,
    refetchIntervalInBackground: false,
  });
};

export const useCheckInMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: checkInMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-dashboard'] });
    },
  });
};

export const useCheckOutMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: checkOutMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-dashboard'] });
    },
  });
};

const getRecordTimestamp = (record: AttendanceRecordResponse) => {
  const raw = record.checkOutTime || record.checkInTime || record.date;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

const sortAttendanceRecords = (records: AttendanceRecordResponse[]) => {
  return [...records].sort(
    (a, b) => getRecordTimestamp(b) - getRecordTimestamp(a)
  );
};

const upsertAttendanceRecord = (
  records: AttendanceRecordResponse[],
  updatedRecord: AttendanceRecordResponse
) => {
  const index = records.findIndex((record) => record.id === updatedRecord.id);

  if (index === -1) {
    return sortAttendanceRecords([updatedRecord, ...records]);
  }

  const next = [...records];
  next[index] = { ...next[index], ...updatedRecord };
  return sortAttendanceRecords(next);
};

export const mergeAttendanceRealtimeUpdate = (
  previousRecords: AttendanceRecordResponse[] | undefined,
  update: AttendanceRealtimeUpdate
) => {
  const records = previousRecords || [];
  const updatedRecord = update.data as AttendanceRecordResponse;

  if (update.eventType === 'check_out') {
    const existingById = records.findIndex(
      (record) => record.id === updatedRecord.id
    );
    if (existingById >= 0) {
      return upsertAttendanceRecord(records, updatedRecord);
    }

    const openSessionIndex = records.findIndex(
      (record) =>
        record.memberId === updatedRecord.memberId && !record.checkOutTime
    );
    if (openSessionIndex >= 0) {
      const next = [...records];
      next[openSessionIndex] = { ...next[openSessionIndex], ...updatedRecord };
      return sortAttendanceRecords(next);
    }
  }

  return upsertAttendanceRecord(records, updatedRecord);
};

interface AttendanceRealtimeSyncOptions {
  enabled?: boolean;
  onUpdate?: (update: AttendanceRealtimeUpdate) => void;
  onConnectionError?: (error: unknown) => void;
  onConnectionStateChange?: (state: AttendanceRealtimeConnectionState) => void;
  retryDelayMs?: number;
}

export const useAttendanceRealtimeSync = (
  gymId: number | undefined,
  {
    enabled = true,
    onUpdate,
    onConnectionError,
    onConnectionStateChange,
    retryDelayMs = 5000,
  }: AttendanceRealtimeSyncOptions = {}
) => {
  const queryClient = useQueryClient();
  const [connectionState, setConnectionState] =
    useState<AttendanceRealtimeConnectionState>('disconnected');

  useEffect(() => {
    if (!enabled || !gymId) {
      setConnectionState('disconnected');
      onConnectionStateChange?.('disconnected');
      return;
    }

    let unsubscribe: (() => void) | undefined;
    let isCancelled = false;
    let hasJoinedGymGroup = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const updateConnectionState = (
      state: AttendanceRealtimeConnectionState
    ) => {
      if (isCancelled) return;
      setConnectionState(state);
      onConnectionStateChange?.(state);
    };

    const unsubscribeConnectionState =
      attendanceSignalRService.subscribeConnectionState(updateConnectionState);

    const setupRealtimeSync = async () => {
      try {
        await attendanceSignalRService.connect();
        await attendanceSignalRService.joinGymGroup(gymId);
        hasJoinedGymGroup = true;

        if (isCancelled) {
          await attendanceSignalRService
            .leaveGymGroup(gymId)
            .catch(() => undefined);
          hasJoinedGymGroup = false;
          return;
        }

        unsubscribe = attendanceSignalRService.subscribeAttendanceUpdates(
          (update) => {
            queryClient.setQueryData<AttendanceApiResponse>(
              ['attendance-records', gymId],
              (previous) => {
                if (!previous) return previous;

                return {
                  ...previous,
                  data: mergeAttendanceRealtimeUpdate(previous.data, update),
                };
              }
            );

            queryClient.invalidateQueries({
              queryKey: ['attendance-dashboard', gymId],
            });
            onUpdate?.(update);
          }
        );

        if (isCancelled) {
          unsubscribe?.();
          unsubscribe = undefined;
          await attendanceSignalRService
            .leaveGymGroup(gymId)
            .catch(() => undefined);
          hasJoinedGymGroup = false;
        }
      } catch (error) {
        updateConnectionState('disconnected');
        onConnectionError?.(error);
        if (!isCancelled) {
          retryTimer = setTimeout(setupRealtimeSync, retryDelayMs);
        }
      }
    };

    setupRealtimeSync();

    return () => {
      isCancelled = true;
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
      unsubscribeConnectionState?.();
      unsubscribe?.();
      if (hasJoinedGymGroup) {
        attendanceSignalRService.leaveGymGroup(gymId).catch(() => undefined);
      }
    };
  }, [
    enabled,
    gymId,
    onConnectionError,
    onConnectionStateChange,
    onUpdate,
    queryClient,
    retryDelayMs,
  ]);

  return {
    connectionState,
    isConnected: connectionState === 'connected',
  };
};

export const ATTENDANCE_POLLING = {
  FALLBACK_POLLING_INTERVAL_MS,
  SAFETY_REFRESH_INTERVAL_MS,
} as const;
