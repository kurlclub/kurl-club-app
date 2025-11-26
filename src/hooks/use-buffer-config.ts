'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useGymBranch } from '@/providers/gym-branch-provider';
import {
  type CreateBufferConfigData,
  createBufferConfig,
  deleteBufferConfig,
  getBufferConfigsByGym,
  updateBufferConfig,
} from '@/services/buffer-config';

export function useBufferConfigs() {
  const queryClient = useQueryClient();
  const { gymBranch } = useGymBranch();

  const {
    data: configs = [],
    isPending,
    error,
  } = useQuery({
    queryKey: ['bufferConfigs', gymBranch?.gymId],
    queryFn: () => {
      if (!gymBranch?.gymId) throw new Error('No gym selected');
      return getBufferConfigsByGym(gymBranch.gymId);
    },
    enabled: !!gymBranch?.gymId,
  });

  const createConfigMutation = useMutation({
    mutationFn: (newConfig: Omit<CreateBufferConfigData, 'gymId'>) => {
      if (!gymBranch?.gymId) throw new Error('No gym selected');
      return createBufferConfig({ ...newConfig, gymId: gymBranch.gymId });
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: ['bufferConfigs'],
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
          : 'Failed to create buffer config'
      );
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: ({
      id,
      config,
    }: {
      id: number;
      config: Omit<CreateBufferConfigData, 'gymId'>;
    }) => {
      if (!gymBranch?.gymId) throw new Error('No gym selected');
      return updateBufferConfig(id, { ...config, gymId: gymBranch.gymId });
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: ['bufferConfigs'],
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
          : 'Failed to update buffer config'
      );
    },
  });

  const deleteConfigMutation = useMutation({
    mutationFn: (id: number) => deleteBufferConfig(id),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: ['bufferConfigs'],
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
          : 'Failed to delete buffer config'
      );
    },
  });

  return {
    configs,
    isLoading: isPending,
    error,
    createConfig: createConfigMutation.mutateAsync,
    updateConfig: updateConfigMutation.mutateAsync,
    deleteConfig: deleteConfigMutation.mutateAsync,
    isCreating: createConfigMutation.isPending,
    isUpdating: updateConfigMutation.isPending,
    isDeleting: deleteConfigMutation.isPending,
  };
}
