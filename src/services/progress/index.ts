import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { api } from '@/lib/api';
import {
  CreateProgressLogPayload,
  ProgressLog,
  ProgressLogListResponse,
  ProgressLogResponse,
  TrainerTodayLogsResponse,
  UpdateProgressLogPayload,
} from '@/types/progress';

// ----------------------------------------------------------------------------
// FETCH FUNCTIONS
// ----------------------------------------------------------------------------

export const fetchProgressLogs = async (
  memberId: number | string,
  fromDate?: string,
  toDate?: string
): Promise<ProgressLog[]> => {
  const params = new URLSearchParams();
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);

  const url = `/ProgressLog/${memberId}${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await api.get<ProgressLogListResponse>(url);
  return response.data ?? [];
};

export const fetchTrainerTodayLogs = async (
  trainerId: number | string
): Promise<number[]> => {
  const response = await api.get<TrainerTodayLogsResponse>(
    `/ProgressLog/trainer/${trainerId}/today`
  );
  return response.data?.loggedMemberIds ?? [];
};

// ----------------------------------------------------------------------------
// REACT QUERY HOOKS — READ
// ----------------------------------------------------------------------------

export const useTrainerTodayLogs = (trainerId: number | string) => {
  return useQuery({
    queryKey: ['trainerTodayLogs', trainerId],
    queryFn: () => fetchTrainerTodayLogs(trainerId),
    enabled: !!trainerId,
    staleTime: 1000 * 60, // 1 min — refreshed often
    retry: 1,
  });
};

export const useProgressLogs = (
  memberId: number | string,
  fromDate?: string,
  toDate?: string
) => {
  return useQuery({
    queryKey: ['progressLogs', memberId, fromDate, toDate],
    queryFn: () => fetchProgressLogs(memberId, fromDate, toDate),
    enabled: !!memberId,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
};

// ----------------------------------------------------------------------------
// API MUTATIONS
// ----------------------------------------------------------------------------

export const createProgressLog = async (
  data: CreateProgressLogPayload
): Promise<ProgressLogResponse> => {
  return api.post<ProgressLogResponse>('/ProgressLog', data);
};

export const updateProgressLog = async (
  logId: number,
  data: Omit<UpdateProgressLogPayload, 'logId'>
): Promise<ProgressLogResponse> => {
  return api.put<ProgressLogResponse>(`/ProgressLog/${logId}`, data);
};

export const deleteProgressLog = async (logId: number): Promise<void> => {
  await api.delete(`/ProgressLog/${logId}`);
};

const invalidateProgressQueries = async (
  queryClient: ReturnType<typeof useQueryClient>,
  memberId: number | string
) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['progressLogs', memberId] }),
    queryClient.invalidateQueries({ queryKey: ['trainerTodayLogs'] }),
    queryClient.invalidateQueries({ queryKey: ['trainerActivity'] }),
  ]);
};

// ----------------------------------------------------------------------------
// REACT QUERY HOOKS — MUTATIONS
// ----------------------------------------------------------------------------

export const useCreateProgressLog = (memberId: number | string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProgressLog,
    onSuccess: async () => {
      toast.success('Progress log added');
      await invalidateProgressQueries(queryClient, memberId);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add progress log');
    },
  });
};

export const useUpdateProgressLog = (memberId: number | string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      logId,
      data,
    }: {
      logId: number;
      data: Omit<UpdateProgressLogPayload, 'logId'>;
    }) => updateProgressLog(logId, data),
    onSuccess: async () => {
      toast.success('Progress log updated');
      await invalidateProgressQueries(queryClient, memberId);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update progress log');
    },
  });
};

export const useDeleteProgressLog = (memberId: number | string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProgressLog,
    onSuccess: async () => {
      toast.success('Progress log deleted');
      await invalidateProgressQueries(queryClient, memberId);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete progress log');
    },
  });
};
