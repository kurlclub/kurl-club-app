import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';
import {
  TrainerActivityResponse,
  TrainerPerformanceSummary,
} from '@/types/trainer-activity';

// ----------------------------------------------------------------------------
// FETCH FUNCTIONS
// ----------------------------------------------------------------------------

export const fetchTrainerActivity = async (
  trainerId: number | string
): Promise<TrainerPerformanceSummary> => {
  const response = await api.get<TrainerActivityResponse>(
    `/TrainerActivity/${trainerId}`
  );
  return response.data;
};

// ----------------------------------------------------------------------------
// REACT QUERY HOOKS
// ----------------------------------------------------------------------------

export const useTrainerActivity = (trainerId: number | string) => {
  return useQuery({
    queryKey: ['trainerActivity', trainerId],
    queryFn: () => fetchTrainerActivity(trainerId),
    enabled: !!trainerId,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
};
