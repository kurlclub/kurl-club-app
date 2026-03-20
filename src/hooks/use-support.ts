'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useGymBranch } from '@/providers/gym-branch-provider';
import {
  type CreateSupportTicketPayload,
  createSupportTicket,
  fetchSupportTicketDetail,
  fetchSupportTickets,
} from '@/services/support';

type SupportTicketInput = Omit<CreateSupportTicketPayload, 'gymId'>;

export function useSupport() {
  const { gymBranch } = useGymBranch();
  const queryClient = useQueryClient();

  const createSupportTicketMutation = useMutation({
    mutationFn: (data: SupportTicketInput) => {
      if (!gymBranch?.gymId) {
        throw new Error('No gym selected');
      }

      return createSupportTicket({
        ...data,
        gymId: gymBranch.gymId,
      });
    },
    onSuccess: (result) => {
      if (result.success && gymBranch?.gymId) {
        queryClient.invalidateQueries({
          queryKey: ['supportTickets', gymBranch.gymId],
        });
        toast.success(result.success);
      } else if (result.error) {
        toast.error(result.error);
      }
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to submit support request'
      );
    },
  });

  return {
    submitSupportTicket: createSupportTicketMutation.mutateAsync,
    isSubmitting: createSupportTicketMutation.isPending,
  };
}

export function useSupportTickets(gymId?: number) {
  return useQuery({
    queryKey: ['supportTickets', gymId],
    queryFn: () => {
      if (!gymId) throw new Error('No gym ID provided');
      return fetchSupportTickets(gymId);
    },
    enabled: !!gymId,
    staleTime: 30000,
  });
}

export function useSupportTicketDetail(gymId?: number, ticketId?: number) {
  return useQuery({
    queryKey: ['supportTicketDetail', gymId, ticketId],
    queryFn: () => {
      if (!gymId || !ticketId) throw new Error('Missing gym ID or ticket ID');
      return fetchSupportTicketDetail(gymId, ticketId);
    },
    enabled: !!gymId && !!ticketId,
    staleTime: 30000,
  });
}
