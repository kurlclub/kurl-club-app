import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';
import { RecurringPaymentMember } from '@/types/payment';

type PaymentTabResponse = {
  status: string;
  data: RecurringPaymentMember[];
  summary: {
    totalMembers: number;
    totalDebt: number;
  };
  appliedFilters: {
    search: string | null;
    membershipPlan: string | null;
    sortBy: string | null;
    sortOrder: string;
  };
  availableFilters: {
    membershipPlans: Array<{
      value: string;
      displayName: string;
      count: number;
    }>;
    sortOptions: string[];
    sortOrders: string[];
  };
  pagination: {
    totalCount: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
};

export const fetchCurrentDuePayments = async (
  gymId: number | string,
  filters?: {
    search?: string;
    membershipPlan?: string;
    sortBy?: string;
    sortOrder?: string;
  }
) => {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.membershipPlan)
    params.append('membershipPlan', filters.membershipPlan);
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

  const queryString = params.toString();
  const url = `/Payment/${gymId}/current-due${queryString ? `?${queryString}` : ''}`;

  return await api.get<PaymentTabResponse>(url);
};

export const useCurrentDuePayments = (
  gymId: number | string,
  filters?: {
    search?: string;
    membershipPlan?: string;
    sortBy?: string;
    sortOrder?: string;
  }
) => {
  return useQuery({
    queryKey: ['current-due-payments', gymId, filters],
    queryFn: () => fetchCurrentDuePayments(gymId, filters),
    enabled: !!gymId,
    staleTime: 1000 * 60 * 2,
    refetchOnMount: false,
    retry: 1,
    placeholderData: (previousData) => previousData,
  });
};

export const fetchOverduePayments = async (
  gymId: number | string,
  filters?: {
    search?: string;
    membershipPlan?: string;
    sortBy?: string;
    sortOrder?: string;
  }
) => {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.membershipPlan)
    params.append('membershipPlan', filters.membershipPlan);
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

  const queryString = params.toString();
  const url = `/Payment/${gymId}/overdue${queryString ? `?${queryString}` : ''}`;

  return await api.get<PaymentTabResponse>(url);
};

export const useOverduePayments = (
  gymId: number | string,
  filters?: {
    search?: string;
    membershipPlan?: string;
    sortBy?: string;
    sortOrder?: string;
  }
) => {
  return useQuery({
    queryKey: ['overdue-payments', gymId, filters],
    queryFn: () => fetchOverduePayments(gymId, filters),
    enabled: !!gymId,
    staleTime: 1000 * 60 * 2,
    refetchOnMount: false,
    retry: 1,
    placeholderData: (previousData) => previousData,
  });
};

export const fetchCompletedPayments = async (
  gymId: number | string,
  filters?: {
    search?: string;
    membershipPlan?: string;
    sortBy?: string;
    sortOrder?: string;
  }
) => {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.membershipPlan)
    params.append('membershipPlan', filters.membershipPlan);
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

  const queryString = params.toString();
  const url = `/Payment/${gymId}/completed${queryString ? `?${queryString}` : ''}`;

  return await api.get<PaymentTabResponse>(url);
};

export const useCompletedPayments = (
  gymId: number | string,
  filters?: {
    search?: string;
    membershipPlan?: string;
    sortBy?: string;
    sortOrder?: string;
  }
) => {
  return useQuery({
    queryKey: ['completed-payments', gymId, filters],
    queryFn: () => fetchCompletedPayments(gymId, filters),
    enabled: !!gymId,
    staleTime: 1000 * 60 * 2,
    refetchOnMount: false,
    retry: 1,
    placeholderData: (previousData) => previousData,
  });
};

export const fetchPaymentHistory = async (
  gymId: number | string,
  filters?: {
    search?: string;
    paymentMethod?: string;
    status?: string;
  }
) => {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.paymentMethod)
    params.append('paymentMethod', filters.paymentMethod);
  if (filters?.status) params.append('status', filters.status);

  const queryString = params.toString();
  const url = `/Payment/gym/${gymId}/history${queryString ? `?${queryString}` : ''}`;

  const response = await api.get<{
    status: string;
    data: Array<{
      paymentId: number;
      memberId: number;
      memberName: string;
      memberIdentifier: string;
      photoPath: string;
      amount: number;
      paymentDate: string;
      paymentMethod: string;
      status: string;
      paymentCycleId: number;
      cycleStartDate: string;
      cycleEndDate: string;
      cycleStatus: string;
    }>;
    summary: {
      totalPayments: number;
      totalRevenue: number;
      fromDate: string | null;
      toDate: string | null;
    };
    availableFilters?: {
      paymentMethods: Array<{ value: string; count: number }>;
      statuses: Array<{ value: string; count: number }>;
    };
  }>(url);

  return response;
};

export const usePaymentHistory = (
  gymId: number | string,
  filters?: {
    search?: string;
    paymentMethod?: string;
    status?: string;
  }
) => {
  return useQuery({
    queryKey: ['payment-history', gymId, filters],
    queryFn: () => fetchPaymentHistory(gymId, filters),
    enabled: !!gymId,
    refetchOnMount: true,
    retry: 1,
  });
};
