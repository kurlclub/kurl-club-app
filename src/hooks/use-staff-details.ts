'use client';

import { useCallback, useEffect, useState } from 'react';

import { toast } from 'sonner';

import { useGymBranch } from '@/providers/gym-branch-provider';
import { updateStaff, useStaffByID } from '@/services/staff';
import { StaffDetails, StaffType } from '@/types/staff';

import { useInvalidateFormOptions } from './use-gymform-options';

export function useStaffDetails(userId: string | number, role?: string) {
  const [isEditing, setIsEditing] = useState(false);
  const [details, setDetails] = useState<StaffDetails | null>(null);
  const [originalDetails, setOriginalDetails] = useState<StaffDetails | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const { gymBranch } = useGymBranch();
  const invalidateFormOptions = useInvalidateFormOptions();

  const { data, isLoading: loading } = useStaffByID(userId, role as StaffType);

  useEffect(() => {
    if (!data) return;

    setDetails(data);
    setOriginalDetails(data);
  }, [data]);

  const updateStaffDetail = useCallback(
    <K extends keyof StaffDetails>(key: K, value: StaffDetails[K]) => {
      setDetails((prev) => (prev ? { ...prev, [key]: value } : null));
    },
    []
  );

  const handleSave = useCallback(async () => {
    if (!details) return false;

    try {
      const formData = new FormData();

      for (const key in details) {
        const formKey = key;
        const value = details[key as keyof StaffDetails];

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
        // Update original details after successful save
        setOriginalDetails(details);

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
  }, [details, userId, role, gymBranch?.gymId, invalidateFormOptions]);

  const toggleEdit = useCallback(() => {
    setIsEditing((prev) => {
      // If we're currently editing and toggling off (canceling), reset to original
      if (prev && originalDetails) {
        setDetails(originalDetails);
      }
      return !prev;
    });
  }, [originalDetails]);

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
