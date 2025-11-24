import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';
import { ApiResponse, OutstandingPayments } from '@/types';

export interface DashboardData {
  totalMembers: number;
  outstandingPaymentsCount: number;
  skippersCount: number;
  newSignups: number;
  payments: {
    totalUnpaidMembers: number;
    totalOutstanding: number;
    totalPaidMembers: number;
    totalPaid: number;
  };
  skipperStats: Array<{
    gymNo: string;
    name: string;
    lastCheckIn: string;
    daysSinceLastCheckIn: number;
  }>;
  attendanceStats: Array<{
    day: string;
    count: number;
  }>;
  outstandingPayments: OutstandingPayments[];
}

export const fetchDashboardData = async (
  gymId: number
): Promise<DashboardData> => {
  const response = await api.get<ApiResponse<DashboardData>>(
    `/Dashboard/gymDashboard?gymId=${gymId}`
  );
  return response.data!;
};

export const useDashboardData = (gymId: number) => {
  return useQuery({
    queryKey: ['dashboardData', gymId],
    queryFn: () => fetchDashboardData(gymId),
    enabled: !!gymId,
    staleTime: 1000 * 60 * 3, // 3 minutes
    retry: 1,
  });
};
