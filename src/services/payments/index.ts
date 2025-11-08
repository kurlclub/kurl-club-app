import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';
import { PaymentResponse } from '@/types/payment';

export const fetchGymPayments = async (gymId: number | string) => {
  const response = await api.get<PaymentResponse>(
    `/Transaction/GetPaymentDetailsByGymId/${gymId}`
  );

  if (response.status === 'Success' && response.data) {
    // Add memberIdentifier for backward compatibility
    return response.data.map((member) => ({
      ...member,
      memberIdentifier:
        member.memberIdentifier ||
        `KC${member.memberId.toString().padStart(3, '0')}`,
    }));
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Outstanding: Use memberStatus from API
  const outstandingPayments = data
    .filter(
      (member) => member.memberStatus === 'Outstanding' && member.currentCycle
    )
    .sort((a, b) => {
      // Sort by urgency: buffer end date or due date
      const aDate = a.currentCycle.bufferEndDate
        ? new Date(a.currentCycle.bufferEndDate)
        : new Date(a.currentCycle.dueDate);
      const bDate = b.currentCycle.bufferEndDate
        ? new Date(b.currentCycle.bufferEndDate)
        : new Date(b.currentCycle.dueDate);
      return aDate.getTime() - bDate.getTime();
    });

  // Expired: Use memberStatus from API (includes Expired and Debts)
  const expiredPayments = data
    .filter(
      (member) =>
        (member.memberStatus === 'Expired' ||
          member.memberStatus === 'Debts') &&
        member.currentCycle
    )
    .sort((a, b) => {
      // Sort by most overdue first
      const aDate = a.currentCycle.bufferEndDate
        ? new Date(a.currentCycle.bufferEndDate)
        : new Date(a.currentCycle.dueDate);
      const bDate = b.currentCycle.bufferEndDate
        ? new Date(b.currentCycle.bufferEndDate)
        : new Date(b.currentCycle.dueDate);
      return aDate.getTime() - bDate.getTime();
    });

  // Completed: Use memberStatus from API
  const completedPayments = data
    .filter(
      (member) => member.memberStatus === 'Completed' && member.currentCycle
    )
    .sort(
      (a, b) =>
        new Date(b.currentCycle.lastAmountPaidDate).getTime() -
        new Date(a.currentCycle.lastAmountPaidDate).getTime()
    );

  // History: All payments sorted by recent
  const historyPayments = data
    .filter((member) => member.currentCycle)
    .sort(
      (a, b) =>
        new Date(b.currentCycle.lastAmountPaidDate).getTime() -
        new Date(a.currentCycle.lastAmountPaidDate).getTime()
    );

  return {
    isLoading,
    error,
    outstandingPayments,
    expiredPayments,
    completedPayments,
    historyPayments,
  };
};
