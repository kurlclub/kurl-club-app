'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useGymBranch } from '@/providers/gym-branch-provider';
import {
  type MemberOnboardingFormData,
  sendMemberOnboardingForm,
} from '@/services/messaging';

export function useMessaging() {
  const { gymBranch } = useGymBranch();

  const sendOnboardingMutation = useMutation({
    mutationFn: (data: Omit<MemberOnboardingFormData, 'gymId'>) => {
      if (!gymBranch?.gymId) throw new Error('No gym selected');
      return sendMemberOnboardingForm({ ...data, gymId: gymBranch.gymId });
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.success);
      } else if (result.error) {
        toast.error(result.error);
      }
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to send onboarding form'
      );
    },
  });

  return {
    sendOnboardingForm: sendOnboardingMutation.mutateAsync,
    isSending: sendOnboardingMutation.isPending,
  };
}
