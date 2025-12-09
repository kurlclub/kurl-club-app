import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api';
import type {
  SessionPaymentDetailResponse,
  SessionPaymentResponse,
} from '@/types/payment';

export const fetchSessionPayments = async (gymId: number | string) => {
  const response = await api.get<SessionPaymentResponse>(
    `/SessionPayment/gym/${gymId}`
  );
  return response.data || [];
};

export const useSessionPayments = (gymId: number | string) => {
  return useQuery({
    queryKey: ['session-payments', gymId],
    queryFn: () => fetchSessionPayments(gymId),
    enabled: !!gymId,
    refetchOnMount: true,
    retry: 1,
  });
};

export const fetchMemberSessionDetails = async (memberId: number | string) => {
  const response = await api.get<SessionPaymentDetailResponse>(
    `/SessionPayment/member/${memberId}/sessions`
  );
  return response.data;
};

export const useMemberSessionDetails = (
  memberId: number | string | null,
  enabled = true
) => {
  return useQuery({
    queryKey: ['session-payment-details', memberId],
    queryFn: () => fetchMemberSessionDetails(memberId!),
    enabled: !!memberId && enabled,
    staleTime: 1000 * 60,
  });
};

export const useRecordSessionPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      sessionPaymentIds: number[];
      totalAmountPaid: number;
      paymentMethod: string;
      recordedBy: number;
    }) => {
      return api.post('/SessionPayment/pay', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-payments'] });
      queryClient.invalidateQueries({
        queryKey: ['session-payment-details'],
      });
    },
  });
};
