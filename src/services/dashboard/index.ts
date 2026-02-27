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
    memberId: number;
    memberIdentifier: string;
    memberName: string;
    photoPath: string | null;
    lastCheckIn: string;
    daysSinceLastCheckIn: number;
  }>;
  attendanceStats: Array<{
    date: string;
    day: string;
    count: number | null;
  }>;
  outstandingPayments: OutstandingPayments[];
}

export const fetchDashboardData = async (
  gymId: number,
  fromDate?: string,
  toDate?: string
): Promise<DashboardData> => {
  const response = await api.get<ApiResponse<DashboardData>>(
    `/Dashboard/${gymId}/gymDashboard`,
    {
      params: {
        ...(fromDate && { fromDate }),
        ...(toDate && { toDate }),
      },
    }
  );
  return response.data!;
};

export const useDashboardData = (
  gymId: number,
  fromDate?: string,
  toDate?: string
) => {
  return useQuery({
    queryKey: ['dashboardData', gymId, fromDate, toDate],
    queryFn: () => fetchDashboardData(gymId, fromDate, toDate),
    enabled: !!gymId,
    staleTime: 1000 * 60 * 3, // 3 minutes
    retry: 1,
  });
};
