import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api';

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
  name: string;
  profilePicture: string | null;
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
    profilePicture: string | null;
    visits: number;
    streak: number;
  }>;
  atRiskMembers: Array<{
    memberId: number;
    memberIdentifier: string;
    name: string;
    profilePicture: string | null;
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
  memberId: string;
  member: string;
  date: string;
  checkInTime: string;
  checkOutTime: string | null;
  duration: number;
  status: string;
  recordedBy: {
    userId: number;
    userName: string | null;
    email: string;
    role: string;
  };
  mode: string;
  profilePicture?: string;
  photoPath?: string;
};

export type AttendanceApiResponse = {
  status: string;
  message: string;
  data: AttendanceRecordResponse[];
};

// API Functions
export const fetchAttendanceDashboard = async (gymId: number) => {
  return await api.get<DashboardData>(`/Attendance/dashboard/${gymId}`);
};

export const fetchMemberAnalytics = async (gymId: number) => {
  const response = await api.get<{ data: MemberAnalyticsResponse }>(
    `/Attendance/member-analytics/${gymId}`
  );
  return response.data;
};

export const fetchAttendanceRecords = async (gymId: number) => {
  return await api.get<AttendanceApiResponse>(`/Attendance/gym/${gymId}`);
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

export const useAttendanceRecords = (gymId: number | undefined) => {
  return useQuery({
    queryKey: ['attendance-records', gymId],
    queryFn: () => fetchAttendanceRecords(gymId!),
    enabled: !!gymId,
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
