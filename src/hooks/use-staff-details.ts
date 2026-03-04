'use client';

import { useCallback, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useGymBranch } from '@/providers/gym-branch-provider';
import { updateStaff, useStaffByID } from '@/services/staff';
import { StaffDetails, StaffType } from '@/types/staff';

import { useInvalidateFormOptions } from './use-gymform-options';

export function useStaffDetails(userId: string | number, role?: string) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftDetails, setDraftDetails] = useState<StaffDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { gymBranch } = useGymBranch();
  const invalidateFormOptions = useInvalidateFormOptions();
  const queryClient = useQueryClient();

  const { data, isLoading: loading } = useStaffByID(userId, role as StaffType);
  const details = draftDetails ?? data ?? null;

  const updateStaffDetail = useCallback(
    <K extends keyof StaffDetails>(key: K, value: StaffDetails[K]) => {
      setDraftDetails((prev) => {
        const sourceDetails = prev ?? details;
        return sourceDetails ? { ...sourceDetails, [key]: value } : null;
      });
    },
    [details]
  );

  const handleSave = useCallback(async () => {
    const detailsToSave = draftDetails ?? details;
    if (!detailsToSave) return false;

    try {
      const formData = new FormData();

      for (const key in detailsToSave) {
        const formKey = key;
        const value = detailsToSave[key as keyof StaffDetails];

        // Skip fields that shouldn't be sent to API
        if (['hasProfilePicture', 'status', 'gymId'].includes(key)) {
          continue;
        }

        if (value !== undefined && value !== null) {
          if (formKey === 'profilePicture' && value instanceof File) {
            formData.append(formKey, value);
          } else if (formKey === 'profilePicture' && value === null) {
            formData.append(formKey, 'null');
          } else {
            formData.append(formKey, String(value));
          }
        }
      }

      const response = await updateStaff(userId, formData, role as StaffType);

      if (response.status === 'Success') {
        toast.success(response.message);
        setIsEditing(false);
        setDraftDetails(null);
        queryClient.setQueryData(
          ['staff', userId, role as StaffType],
          detailsToSave
        );

        // Invalidate form options if updating a trainer (trainers appear in formData)
        if (role === 'trainer' && gymBranch?.gymId) {
          invalidateFormOptions(gymBranch.gymId);
        }

        return true;
      } else {
        toast.error('Failed to update staff details.');

        return false;
      }
    } catch (error) {
      console.error('Failed to save staff details:', error);
      setError('Failed to save staff details');
      toast.error('An error occurred while updating the staff details.');
      return false;
    }
  }, [
    details,
    draftDetails,
    gymBranch,
    invalidateFormOptions,
    queryClient,
    role,
    userId,
  ]);

  const toggleEdit = useCallback(() => {
    if (isEditing) {
      setDraftDetails(null);
      setIsEditing(false);
      return;
    }

    if (details) {
      setDraftDetails({ ...details });
    }
    setIsEditing(true);
  }, [details, isEditing]);

  return {
    details,
    isEditing,
    loading,
    error,
    updateStaffDetail,
    handleSave,
    toggleEdit,
    setIsEditing,
  };
}
