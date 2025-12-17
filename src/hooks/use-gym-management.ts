'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useAuth } from '@/providers/auth-provider';
import { fetchGymProfilePicture, updateGym } from '@/services/gym';
import { GymDetails } from '@/types/gym';

interface UseGymDetailsReturn {
  data: GymDetails | null;
  isLoading: boolean;
}

export function useGymDetails(): UseGymDetailsReturn {
  const { gymDetails } = useAuth();
  return { data: gymDetails, isLoading: false };
}

interface GymProfilePictureData {
  data: string;
}

export function useGymProfilePicture(gymId: number) {
  return useQuery<GymProfilePictureData | null>({
    queryKey: ['gymProfilePicture', gymId],
    queryFn: () => fetchGymProfilePicture(gymId),
    enabled: !!gymId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });
}

interface UpdateGymParams {
  gymId: number;
  data: FormData;
}

interface UpdateGymResult {
  success: string;
}

interface SwitchClubResult {
  success: boolean;
  error?: string;
}

interface UseGymManagementReturn {
  updateGym: (params: UpdateGymParams) => Promise<UpdateGymResult>;
  isUpdating: boolean;
  switchClub: (gymId: number) => Promise<SwitchClubResult>;
}

export function useGymManagement(): UseGymManagementReturn {
  const queryClient = useQueryClient();
  const { refreshUser, switchClub: switchClubAuth } = useAuth();

  const updateGymMutation = useMutation<
    UpdateGymResult,
    Error,
    UpdateGymParams
  >({
    mutationFn: ({ gymId, data }) => updateGym(gymId, data),
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

  const handleSwitchClub = async (gymId: number): Promise<SwitchClubResult> => {
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
