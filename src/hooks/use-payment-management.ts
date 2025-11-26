'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  type ExtendBufferRequest,
  type PaymentRequest,
  emailPaymentReport,
  exportPaymentReport,
  extendBuffer,
  fullPayment,
  getPaymentHistory,
  partialPayment,
} from '@/services/transaction';

export function usePaymentManagement() {
  const queryClient = useQueryClient();

  const partialPaymentMutation = useMutation({
    mutationFn: (data: PaymentRequest) => partialPayment(data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['gymPayments'] });
        queryClient.invalidateQueries({ queryKey: ['paymentHistory'] });
        queryClient.invalidateQueries({ queryKey: ['memberPaymentDetails'] });
        toast.success(result.success);
      } else if (result.error) {
        toast.error(result.error);
      }
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to record partial payment'
      );
    },
  });

  const fullPaymentMutation = useMutation({
    mutationFn: (data: PaymentRequest) => fullPayment(data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['gymPayments'] });
        queryClient.invalidateQueries({ queryKey: ['paymentHistory'] });
        queryClient.invalidateQueries({ queryKey: ['memberPaymentDetails'] });
        toast.success(result.success);
      } else if (result.error) {
        toast.error(result.error);
      }
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to record full payment'
      );
    },
  });

  const extendBufferMutation = useMutation({
    mutationFn: (data: ExtendBufferRequest) => extendBuffer(data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['gymPayments'] });
        queryClient.invalidateQueries({ queryKey: ['memberPaymentDetails'] });
        toast.success(result.success);
      } else if (result.error) {
        toast.error(result.error);
      }
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to extend buffer'
      );
    },
  });

  return {
    recordPartialPayment: partialPaymentMutation.mutateAsync,
    recordFullPayment: fullPaymentMutation.mutateAsync,
    extendBuffer: extendBufferMutation.mutateAsync,
    isProcessing:
      partialPaymentMutation.isPending ||
      fullPaymentMutation.isPending ||
      extendBufferMutation.isPending,
  };
}

export function usePaymentHistory(memberId: number) {
  return useQuery({
    queryKey: ['paymentHistory', memberId],
    queryFn: () => getPaymentHistory(memberId),
    enabled: !!memberId,
  });
}

export function useInvoiceManagement() {
  const exportMutation = useMutation({
    mutationFn: (paymentId: number) => exportPaymentReport(paymentId),
  });

  const emailMutation = useMutation({
    mutationFn: (paymentId: number) => emailPaymentReport(paymentId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.success);
      } else if (result.error) {
        toast.error(result.error);
      }
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to send invoice email'
      );
    },
  });

  return {
    exportInvoice: exportMutation.mutateAsync,
    sendInvoiceEmail: emailMutation.mutateAsync,
    isExporting: exportMutation.isPending,
    isSending: emailMutation.isPending,
  };
}
