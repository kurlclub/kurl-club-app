import { useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api';

export type FormOptionsResponse = {
  workoutPlans: { id: number; name: string; isDefault?: boolean }[];
  membershipPlans: {
    membershipPlanId: number;
    planName: string;
    details: string;
    fee: number;
    durationInDays: number;
    billingType: 'Recurring' | 'PerSession';
  }[];
  trainers: { id: number; trainerName: string }[];
  certificatesOptions: { id: number; name: string }[];
};

const fetchFormOptions = async (
  gymId: number
): Promise<FormOptionsResponse> => {
  const response = await api.get<{
    success: boolean;
    data: FormOptionsResponse;
  }>(`/Gym/${gymId}/formData`);

  if (!response.success) {
    throw new Error('Failed to load form options');
  }

  return response.data;
};

export const useGymFormOptions = (gymId?: number) => {
  const {
    data: formOptions,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['gymFormOptions', gymId],
    queryFn: () => fetchFormOptions(gymId!),
    enabled: !!gymId,
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  return {
    formOptions: formOptions || null,
    loading,
    error: error?.message || null,
  };
};

// Utility hook for invalidating form options cache
export const useInvalidateFormOptions = () => {
  const queryClient = useQueryClient();

  return (gymId: number) => {
    queryClient.invalidateQueries({
      queryKey: ['gymFormOptions', gymId],
    });
  };
};
