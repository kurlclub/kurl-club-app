'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  fetchGymById,
  fetchGymProfilePicture,
  updateGym,
} from '@/services/gym';

export function useGymDetails(gymId: number) {
  return useQuery({
    queryKey: ['gymDetails', gymId],
    queryFn: () => fetchGymById(gymId),
    enabled: !!gymId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useGymProfilePicture(gymId: number) {
  return useQuery({
    queryKey: ['gymProfilePicture', gymId],
    queryFn: () => fetchGymProfilePicture(gymId),
    enabled: !!gymId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useGymManagement() {
  const queryClient = useQueryClient();

  const updateGymMutation = useMutation({
    mutationFn: ({ gymId, data }: { gymId: number; data: FormData }) =>
      updateGym(gymId, data),
    onSuccess: (result, { gymId }) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['gymDetails', gymId] });
        queryClient.invalidateQueries({
          queryKey: ['gymProfilePicture', gymId],
        });
        toast.success(result.success);
      } else if (result.error) {
        toast.error(result.error);
      }
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update gym'
      );
    },
  });

  return {
    updateGym: updateGymMutation.mutateAsync,
    isUpdating: updateGymMutation.isPending,
  };
}
