import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod';

import { safeParseDate } from '@/lib/utils';
import { createMemberSchema } from '@/schemas/index';
import { createMember, fetchPendingMemberDetails } from '@/services/member';

type CreateMemberDetailsData = z.infer<typeof createMemberSchema>;

export const useMemberForm = (gymId?: number, onboardingId?: number) => {
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const [existingIdCopyUrl, setExistingIdCopyUrl] = useState<string | null>(
    null
  );
  const [isLoadingOnboarding, setIsLoadingOnboarding] = useState(false);

  const form = useForm<CreateMemberDetailsData>({
    resolver: zodResolver(createMemberSchema),
    defaultValues: {
      profilePicture: null,
      memberName: '',
      onboardingType: undefined,
      email: '',
      phone: '',
      amountPaid: '',
      dob: '',
      doj: new Date().toISOString(),
      height: '',
      weight: '',
      address: '',
      gender: '',
      membershipPlanId: '',
      feeStatus: '',
      personalTrainer: '',
      bloodGroup: '',
      workoutPlanId: '',
      modeOfPayment: '',
      currentPackageStartDate: '',
      customSessionRate: '',
      numberOfSessions: '',
      idType: '',
      idNumber: '',
      idCopyPath: null,
      fitnessGoal: '',
      medicalHistory: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelation: '',
    },
  });

  const queryClient = useQueryClient();

  // Fetch onboarding data if onboardingId is provided
  useEffect(() => {
    const resolvedOnboardingId = Number(onboardingId);
    if (!Number.isFinite(resolvedOnboardingId) || resolvedOnboardingId <= 0) {
      return;
    }

    setIsLoadingOnboarding(true);
    fetchPendingMemberDetails(resolvedOnboardingId)
      .then((data) => {
        setExistingPhotoUrl(data.photoPath || null);
        setExistingIdCopyUrl(
          typeof data.idCopyPath === 'string' ? data.idCopyPath : null
        );

        form.reset({
          profilePicture: null,
          memberName: data.memberName || data.name || '',
          onboardingType: undefined,
          email: data.email || '',
          phone: data.phone || '',
          gender: data.gender || '',
          dob: safeParseDate(data.dob)?.toISOString() || '',
          height: String(data.height || ''),
          weight: String(data.weight || ''),
          bloodGroup: data.bloodGroup || '',
          address: data.address || '',
          idType: data.idType || '',
          idNumber: data.idNumber || '',
          idCopyPath: data.idCopyPath ? 'existing' : null,
          fitnessGoal: data.fitnessGoal || '',
          medicalHistory: data.medicalHistory || '',
          emergencyContactName: data.emergencyContactName || '',
          emergencyContactPhone: data.emergencyContactPhone || '',
          emergencyContactRelation: data.emergencyContactRelation || '',
          doj: new Date().toISOString(),
          membershipPlanId: '',
          feeStatus: '',
          personalTrainer: '',
          workoutPlanId: '',
          amountPaid: '',
          modeOfPayment: '',
          currentPackageStartDate: '',
          customSessionRate: '',
          numberOfSessions: '',
        });
      })
      .catch((error) => {
        console.error('Failed to fetch onboarding details:', error);
        toast.error('Failed to load member details');
      })
      .finally(() => {
        setIsLoadingOnboarding(false);
      });
  }, [onboardingId, form]);

  const handleSubmit = async (
    data: CreateMemberDetailsData,
    memberIdentifier?: string
  ) => {
    const formData = new FormData();

    // Handle ProfilePicture vs PhotoPath
    if (data.profilePicture instanceof File) {
      formData.append('ProfilePicture', data.profilePicture);
    } else if (existingPhotoUrl) {
      formData.append('PhotoPath', existingPhotoUrl);
    }

    // Handle IdCopyFile vs IdCopyPath
    if (data.idCopyPath instanceof File) {
      formData.append('IdCopyFile', data.idCopyPath);
    } else if (existingIdCopyUrl && data.idCopyPath === 'existing') {
      formData.append('IdCopyPath', existingIdCopyUrl);
    }

    // Append other fields
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'profilePicture' || key === 'idCopyPath') return;

      if (key === 'personalTrainer') {
        return formData.append(
          'PersonalTrainer',
          value === '' ? '0' : String(value)
        );
      }

      if (key === 'numberOfSessions' && value === '') return;

      // Map frontend field names to API field names
      const fieldMap: Record<string, string> = {
        memberName: 'MemberName',
        dob: 'Dob',
        bloodGroup: 'BloodGroup',
        gender: 'Gender',
        membershipPlanId: 'MembershipPlanId',
        feeStatus: 'FeeStatus',
        doj: 'DOJ',
        phone: 'Phone',
        email: 'Email',
        height: 'Height',
        weight: 'Weight',
        address: 'Address',
        amountPaid: 'AmountPaid',
        workoutPlanId: 'WorkoutPlanId',
        customSessionRate: 'PerSessionRate',
        numberOfSessions: 'NumberOfSessions',
        idNumber: 'IdNumber',
        fitnessGoal: 'FitnessGoal',
        medicalHistory: 'MedicalHistory',
        idType: 'IdType',
        emergencyContactName: 'EmergencyContactName',
        emergencyContactPhone: 'EmergencyContactPhone',
        emergencyContactRelation: 'EmergencyContactRelation',
        modeOfPayment: 'ModeOfPayment',
        onboardingType: 'MemberOnboardingType',
        currentPackageStartDate: 'CurrentPackageStartDate',
      };

      const apiFieldName = fieldMap[key] || key;
      formData.append(apiFieldName, String(value));
    });

    const resolvedCurrentPackageStartDate =
      data.currentPackageStartDate && data.currentPackageStartDate.trim() !== ''
        ? data.currentPackageStartDate
        : data.doj;
    formData.set('CurrentPackageStartDate', resolvedCurrentPackageStartDate);

    if (gymId) {
      formData.append('GymId', String(gymId));
    }
    if (memberIdentifier) {
      formData.append('MemberIdentifier', memberIdentifier);
    }
    const resolvedOnboardingId = Number(onboardingId);
    if (Number.isFinite(resolvedOnboardingId) && resolvedOnboardingId > 0) {
      formData.append('OnboardingId', String(onboardingId));
    }

    const result = await createMember(formData);

    if (result.success) {
      toast.success(result.success);
      await queryClient.invalidateQueries({
        queryKey: ['gymMembers', gymId],
        refetchType: 'all',
      });
      if (onboardingId) {
        await queryClient.invalidateQueries({
          queryKey: ['pendingOnboardingMembers', gymId],
        });
      }
      return true;
    } else {
      toast.error(result.error);
      return false;
    }
  };

  return {
    form,
    handleSubmit,
    existingPhotoUrl,
    existingIdCopyUrl,
    setExistingPhotoUrl,
    setExistingIdCopyUrl,
    isLoadingOnboarding,
  };
};
