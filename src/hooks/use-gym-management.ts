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
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useGymProfilePicture(gymId: number) {
  return useQuery({
    queryKey: ['gymProfilePicture', gymId],
    queryFn: () => fetchGymProfilePicture(gymId),
    enabled: !!gymId,
    staleTime: 1000 * 60 * 5, // 5 minutes - balance between performance and freshness
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
}

export function useGymManagement() {
  const queryClient = useQueryClient();

  const updateGymMutation = useMutation({
    mutationFn: ({ gymId, data }: { gymId: number; data: FormData }) =>
      updateGym(gymId, data),
    onSuccess: async (result, { gymId }) => {
      await queryClient.invalidateQueries({ queryKey: ['gymDetails', gymId] });
      await queryClient.invalidateQueries({
        queryKey: ['gymProfilePicture', gymId],
      });
      // Trigger immediate refetch to update all components
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['gymDetails', gymId] }),
        queryClient.refetchQueries({ queryKey: ['gymProfilePicture', gymId] }),
      ]);
      toast.success(result.success);
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
