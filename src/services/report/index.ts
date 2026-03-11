import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';
import { ApiResponse } from '@/types';
import {
  ReportBreakdownItem,
  ReportRevenueFlow,
  ReportsAndExpensesData,
} from '@/types/reports-and-expenses';

interface ReportApiData {
  currentMemberCollections: number;
  netProfit: number;
  totalRevenue: number;
  totalExpenses: number;
  revenueTrendPercentage: number;
  expenseTrendPercentage: number;
  revenueFlow: ReportRevenueFlow;
  revenueBreakdown: ReportBreakdownItem[];
}

interface ReportApiResponse extends ApiResponse<ReportApiData> {
  feature?: string;
}

export class ReportAccessError extends Error {
  feature?: string;
  status?: string;

  constructor(message: string, feature?: string, status?: string) {
    super(message);
    this.name = 'ReportAccessError';
    this.feature = feature;
    this.status = status;
  }
}

const mapReportData = (data: ReportApiData): ReportsAndExpensesData => ({
  currentMemberCollections: data.currentMemberCollections,
  netProfit: data.netProfit,
  totalRevenue: data.totalRevenue,
  totalExpenses: data.totalExpenses,
  revenueTrendPercentage: data.revenueTrendPercentage,
  expenseTrendPercentage: data.expenseTrendPercentage,
  revenueFlow: data.revenueFlow,
  expenseBreakdown: data.revenueBreakdown,
});

export const fetchReportsAndExpenses = async (
  gymId: number | string,
  fromDate?: string,
  toDate?: string
): Promise<ReportsAndExpensesData> => {
  try {
    const response = await api.get<ReportApiResponse>('/Report', {
      params: {
        gymId,
        ...(fromDate && { fromDate }),
        ...(toDate && { toDate }),
      },
    });

    if (response.status !== 'Success' || !response.data) {
      throw new ReportAccessError(
        response.message || 'Report data is unavailable.',
        response.feature,
        response.status
      );
    }

    return mapReportData(response.data);
  } catch (error) {
    const reportError = error as Error & {
      feature?: string;
      status?: string;
    };

    if (reportError.feature || reportError.status === 'Error') {
      throw new ReportAccessError(
        reportError.message,
        reportError.feature,
        reportError.status
      );
    }

    throw error;
  }
};

export const useReportsAndExpenses = (
  gymId: number | string,
  fromDate?: string,
  toDate?: string
) => {
  return useQuery({
    queryKey: ['reports-and-expenses', gymId, fromDate, toDate],
    queryFn: () => fetchReportsAndExpenses(gymId, fromDate, toDate),
    enabled: !!gymId,
    staleTime: 1000 * 60 * 3,
    retry: 1,
  });
};
