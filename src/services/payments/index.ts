import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';
import { PaymentResponse } from '@/types/payment';

export const fetchGymPayments = async (gymId: number | string) => {
  const response = await api.get<PaymentResponse>(
    `/Transaction/GetPaymentDetailsByGymId/${gymId}`
  );

  if (response.status === 'Success' && response.data) {
    return response.data;
  }

  return [];
};

export const useGymPayments = (gymId: number | string) => {
  return useQuery({
    queryKey: ['gymPayments', gymId],
    queryFn: () => fetchGymPayments(gymId),
    enabled: !!gymId,
    refetchOnMount: true,
    retry: 1,
  });
};

export const useFilteredPayments = (gymId: number | string) => {
  const { data = [], isLoading, error } = useGymPayments(gymId);

  // Filter recurring payments only
  const recurringPayments = data.filter(
    (member) => member.billingType === 'Recurring' && member.currentCycle
  );

  // Current Due: Pending amount within grace period
  const currentDuePayments = recurringPayments
    .filter(
      (member) =>
        member.billingType === 'Recurring' &&
        member.paymentStatus === 'CurrentDue'
    )
    .sort((a, b) => {
      if (
        a.billingType !== 'Recurring' ||
        b.billingType !== 'Recurring' ||
        !a.currentCycle ||
        !b.currentCycle
      )
        return 0;
      const aDate = a.currentCycle.bufferEndDate
        ? new Date(a.currentCycle.bufferEndDate)
        : new Date(a.currentCycle.dueDate);
      const bDate = b.currentCycle.bufferEndDate
        ? new Date(b.currentCycle.bufferEndDate)
        : new Date(b.currentCycle.dueDate);
      return aDate.getTime() - bDate.getTime();
    });

  // Overdue: Past grace period or has debt cycles
  const overduePayments = recurringPayments
    .filter(
      (member) =>
        member.billingType === 'Recurring' && member.paymentStatus === 'Overdue'
    )
    .sort((a, b) => {
      if (
        a.billingType !== 'Recurring' ||
        b.billingType !== 'Recurring' ||
        !a.currentCycle ||
        !b.currentCycle
      )
        return 0;
      const aDate = a.currentCycle.bufferEndDate
        ? new Date(a.currentCycle.bufferEndDate)
        : new Date(a.currentCycle.dueDate);
      const bDate = b.currentCycle.bufferEndDate
        ? new Date(b.currentCycle.bufferEndDate)
        : new Date(b.currentCycle.dueDate);
      return aDate.getTime() - bDate.getTime();
    });

  // Completed: Fully paid
  const completedPayments = recurringPayments
    .filter(
      (member) =>
        member.billingType === 'Recurring' &&
        member.paymentStatus === 'Completed'
    )
    .sort((a, b) => {
      if (
        a.billingType !== 'Recurring' ||
        b.billingType !== 'Recurring' ||
        !a.currentCycle ||
        !b.currentCycle
      )
        return 0;
      return (
        new Date(b.currentCycle.lastAmountPaidDate).getTime() -
        new Date(a.currentCycle.lastAmountPaidDate).getTime()
      );
    });

  return {
    isLoading,
    error,
    currentDuePayments,
    overduePayments,
    completedPayments,
  };
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
