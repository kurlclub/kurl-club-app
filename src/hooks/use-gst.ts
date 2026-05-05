'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useGymBranch } from '@/providers/gym-branch-provider';
import { addGstNumber, deleteGstNumber, fetchGstNumber } from '@/services/gym';

export function useGst() {
  const queryClient = useQueryClient();
  const { gymBranch } = useGymBranch();

  const {
    data: gstData,
    isPending: isGstLoading,
    error: gstError,
  } = useQuery({
    queryKey: ['gst', gymBranch?.gymId],
    queryFn: () => {
      if (!gymBranch?.gymId) {
        throw new Error('No gym selected');
      }
      return fetchGstNumber(gymBranch.gymId);
    },
    enabled: !!gymBranch?.gymId,
    staleTime: 1000 * 60 * 5,
  });

  // Add GST mutation
  const addGstMutation = useMutation({
    mutationFn: (gstNumber: string) => {
      if (!gymBranch?.gymId) {
        throw new Error('No gym selected');
      }
      return addGstNumber(gymBranch.gymId, gstNumber);
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.success);
        queryClient.invalidateQueries({ queryKey: ['gst', gymBranch?.gymId] });
      } else if (result.error) {
        toast.error(result.error);
      }
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to add GST number'
      );
    },
  });

  // Delete GST mutation
  const deleteGstMutation = useMutation({
    mutationFn: () => {
      if (!gymBranch?.gymId) {
        throw new Error('No gym selected');
      }
      return deleteGstNumber(gymBranch.gymId);
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.success);
        queryClient.invalidateQueries({ queryKey: ['gst', gymBranch?.gymId] });
      } else if (result.error) {
        toast.error(result.error);
      }
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete GST number'
      );
    },
  });

  return {
    gstNumber: gstData?.data?.gstNumber ?? null,
    isGstLoading,
    gstError,
    addGst: addGstMutation.mutate,
    deleteGst: deleteGstMutation.mutate,
    isAddingGst: addGstMutation.isPending,
    isDeletingGst: deleteGstMutation.isPending,
  };
}
