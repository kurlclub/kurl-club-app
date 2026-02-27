'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useGymBranch } from '@/providers/gym-branch-provider';
import { createStaff, deleteStaff } from '@/services/staff';
import { StaffType } from '@/types/staff';

import { useInvalidateFormOptions } from './use-gymform-options';

export function useStaffManagement() {
  const queryClient = useQueryClient();
  const { gymBranch } = useGymBranch();
  const invalidateFormOptions = useInvalidateFormOptions();

  // Create staff/trainer
  const createStaffMutation = useMutation({
    mutationFn: ({
      data,
      type,
    }: {
      data: FormData;
      type: 'staff' | 'trainer';
    }) => createStaff(data, type),
    onSuccess: (result, { type }) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: ['gymStaffs', gymBranch?.gymId],
        });
        // Only invalidate form options for trainers (they appear in formData)
        if (type === 'trainer' && gymBranch?.gymId) {
          invalidateFormOptions(gymBranch.gymId);
        }
        toast.success(result.success);
      } else if (result.error) {
        toast.error(result.error);
      }
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create staff'
      );
    },
  });

  // Delete staff/trainer
  const deleteStaffMutation = useMutation({
    mutationFn: ({ id, role }: { id: string | number; role: StaffType }) =>
      deleteStaff(id, role),
    onSuccess: (result, { role }) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: ['gymStaffs', gymBranch?.gymId],
        });
        // Only invalidate form options for trainers (they appear in formData)
        if (role === 'trainer' && gymBranch?.gymId) {
          invalidateFormOptions(gymBranch.gymId);
        }
        toast.success(result.success);
      } else if (result.error) {
        toast.error(result.error);
      }
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete staff'
      );
    },
  });

  return {
    createStaff: createStaffMutation.mutateAsync,
    deleteStaff: deleteStaffMutation.mutateAsync,
    isCreating: createStaffMutation.isPending,
    isDeleting: deleteStaffMutation.isPending,
  };
}
