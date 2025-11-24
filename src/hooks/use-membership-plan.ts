'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useGymBranch } from '@/providers/gym-branch-provider';
import {
  createMembershipPlan,
  deleteMembershipPlan,
  getMembershipPlans,
  updateMembershipPlan,
} from '@/services/membership-plan';
import type { MembershipPlan } from '@/types/membership-plan';

import { useAppDialog } from './use-app-dialog';
import { useInvalidateFormOptions } from './use-gymform-options';

export function useMembershipPlans() {
  const queryClient = useQueryClient();
  const { showAlert } = useAppDialog();
  const { gymBranch } = useGymBranch();
  const invalidateFormOptions = useInvalidateFormOptions();

  // Get all membership plans
  const {
    data: plans = [],
    isPending,
    error,
  } = useQuery({
    queryKey: ['membershipPlans', gymBranch?.gymId],
    queryFn: () => {
      if (!gymBranch?.gymId) {
        throw new Error('No gym selected');
      }
      return getMembershipPlans(gymBranch.gymId);
    },
    enabled: !!gymBranch?.gymId,
    staleTime: 1000 * 60 * 3,
  });

  // Create a new membership plan
  const createPlanMutation = useMutation({
    mutationFn: (newPlan: MembershipPlan) => {
      if (!gymBranch?.gymId) {
        throw new Error('No gym selected');
      }
      return createMembershipPlan({
        ...newPlan,
        gymId: gymBranch.gymId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['membershipPlans', gymBranch?.gymId],
      });
      if (gymBranch?.gymId) {
        invalidateFormOptions(gymBranch.gymId);
      }
      toast.success('Membership plan created successfully');
      return true;
    },
    onError: (err) => {
      showAlert({
        title: 'Error creating membership plan',
        description:
          err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive',
      });
      return false;
    },
  });

  // Update an existing membership plan
  const updatePlanMutation = useMutation({
    mutationFn: ({ id, plan }: { id: number; plan: MembershipPlan }) => {
      if (!gymBranch?.gymId) {
        throw new Error('No gym selected');
      }
      return updateMembershipPlan(id, {
        ...plan,
        gymId: gymBranch.gymId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['membershipPlans', gymBranch?.gymId],
      });
      if (gymBranch?.gymId) {
        invalidateFormOptions(gymBranch.gymId);
      }
      toast.success('Membership plan updated successfully');
      return true;
    },
    onError: (err) => {
      showAlert({
        title: 'Error updating membership plan',
        description:
          err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive',
      });
      return false;
    },
  });

  // Delete a membership plan
  const deletePlanMutation = useMutation({
    mutationFn: (id: number) => deleteMembershipPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['membershipPlans', gymBranch?.gymId],
      });
      if (gymBranch?.gymId) {
        invalidateFormOptions(gymBranch.gymId);
      }
      toast.success('Membership plan deleted successfully');
      return true;
    },
    onError: (err) => {
      showAlert({
        title: 'Error deleting membership plan',
        description:
          err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive',
      });
      return false;
    },
  });

  return {
    plans,
    isLoading: isPending,
    error,
    createPlan: createPlanMutation.mutateAsync,
    updatePlan: updatePlanMutation.mutateAsync,
    deletePlan: deletePlanMutation.mutateAsync,
    isCreating: createPlanMutation.isPending,
    isUpdating: updatePlanMutation.isPending,
    isDeleting: deletePlanMutation.isPending,
  };
}
