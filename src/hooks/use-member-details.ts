'use client';

import { useCallback, useEffect, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { updateMember, useMemberByID } from '@/services/member';
import { MemberDetails } from '@/types/member.types';

type MemberDetailsWithCurrentPackageStartDate = MemberDetails & {
  currentPackageStartDate?: string | null;
};

export function useMemberDetails(
  userId: string | number,
  initialData?: MemberDetails
) {
  const [isEditing, setIsEditing] = useState(false);
  const [details, setDetails] = useState<MemberDetails | null>(null);
  const [originalDetails, setOriginalDetails] = useState<MemberDetails | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading: loading } = useMemberByID(userId);

  useEffect(() => {
    const memberData = data || initialData;
    if (memberData) {
      setDetails(memberData);
      setOriginalDetails(memberData);
    }
  }, [data, initialData]);

  const updateMemberDetail = useCallback(
    <K extends keyof MemberDetails>(key: K, value: MemberDetails[K]) => {
      setDetails((prev) => {
        if (!prev) return null;
        return { ...prev, [key]: value };
      });
    },
    []
  );

  const handleSave = useCallback(async () => {
    if (!details) return false;

    // Validate required fields
    if (!details.height || details.height <= 0) {
      toast.error('Height is required and must be greater than 0');
      return false;
    }

    if (!details.weight || details.weight <= 0) {
      toast.error('Weight is required and must be greater than 0');
      return false;
    }

    try {
      const formData = new FormData();

      // Handle ProfilePicture vs PhotoPath
      if (details.profilePicture instanceof File) {
        formData.append('ProfilePicture', details.profilePicture);
        formData.append('PhotoPath', '');
      } else if (details.photoPath) {
        formData.append('PhotoPath', details.photoPath);
      }

      // Handle IdCopyFile vs IdCopyPath
      if (details.idCopyPath instanceof File) {
        formData.append('IdCopyFile', details.idCopyPath);
        formData.append('IdCopyPath', '');
      } else if (typeof details.idCopyPath === 'string') {
        formData.append('IdCopyPath', details.idCopyPath);
      }

      for (const key in details) {
        // Skip already handled fields
        if (
          key === 'profilePicture' ||
          key === 'photoPath' ||
          key === 'idCopyPath' ||
          key === 'currentPackageStartDate'
        )
          continue;

        let formKey = key === 'fullAddress' ? 'address' : key;
        const value = details[key as keyof MemberDetails];

        if (formKey === 'workoutPlan') {
          formKey = 'workoutPlanId';
        }

        if (value !== undefined && value !== null) {
          formData.append(formKey, String(value));
        }
      }

      const currentPackageStartDate =
        (details as MemberDetailsWithCurrentPackageStartDate)
          .currentPackageStartDate ||
        details.paymentCycleInfo?.startDate ||
        details.doj;
      formData.set('CurrentPackageStartDate', String(currentPackageStartDate));

      const response = await updateMember(userId, formData);

      if (response.status === 'Success') {
        toast.success(response.message);
        setIsEditing(false);

        // Invalidate only necessary queries
        await queryClient.invalidateQueries({ queryKey: ['member', userId] });
        // Ensure members list and any cached member lists are refreshed
        await queryClient.invalidateQueries({ queryKey: ['gymMembers'] });
        await queryClient.invalidateQueries({ queryKey: ['allGymMembers'] });

        return true;
      } else {
        toast.error('Failed to update member details.');

        return false;
      }
    } catch (error) {
      console.error('Failed to save member details:', error);
      setError('Failed to save member details');
      toast.error('An error occurred while updating the member details.');
      return false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [details, userId]);

  const toggleEdit = useCallback(() => {
    setIsEditing((prev) => {
      // If canceling edit, restore original values
      if (prev && originalDetails) {
        setDetails(originalDetails);
      }
      // If starting edit, store current values as original
      if (!prev && details) {
        setOriginalDetails({ ...details });
      }
      return !prev;
    });
  }, [details, originalDetails]);

  return {
    details,
    originalDetails,
    isEditing,
    loading,
    error,
    updateMemberDetail,
    handleSave,
    toggleEdit,
    setIsEditing,
  };
}
