'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useAuth } from '@/providers/auth-provider';
import { fetchGymProfilePicture, updateGym } from '@/services/gym';

export function useGymDetails() {
  const { gymDetails } = useAuth();
  return { data: gymDetails, isLoading: false };
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

  const { refreshUser, switchClub: switchClubAuth } = useAuth();

  const updateGymMutation = useMutation({
    mutationFn: ({ gymId, data }: { gymId: number; data: FormData }) =>
      updateGym(gymId, data),
    onSuccess: async (result, { gymId }) => {
      await queryClient.invalidateQueries({
        queryKey: ['gymProfilePicture', gymId],
      });
      await queryClient.refetchQueries({
        queryKey: ['gymProfilePicture', gymId],
      });
      await refreshUser();
      toast.success(result.success);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update gym'
      );
    },
  });

  const handleSwitchClub = async (gymId: number) => {
    const result = await switchClubAuth(gymId);
    if (result.success) {
      await queryClient.invalidateQueries();
    }
    return result;
  };

  return {
    updateGym: updateGymMutation.mutateAsync,
    isUpdating: updateGymMutation.isPending,
    switchClub: handleSwitchClub,
  };
}
