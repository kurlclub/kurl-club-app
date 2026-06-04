import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod/v4';

import { KSheet } from '@/components/shared/form/k-sheet';
import { Button } from '@/components/ui/button';
import { useSubscriptionAccess } from '@/hooks/use-subscription-access';
import { toUtcDateOnlyISOString } from '@/lib/utils';
import { useGymBranch } from '@/providers/gym-branch-provider';
import { adminstratorFormSchema, trainerFormSchema } from '@/schemas';
import { createStaff } from '@/services/staff';
import { StaffType } from '@/types/staff';

import StaffForm, { StaffTypeCards } from './staff-forms';

type CreateStaffDetailsProps = {
  closeSheet: () => void;
  isOpen: boolean;
  staffCount: number;
  trainerCount: number;
};

type TrainerFormValues = z.infer<typeof trainerFormSchema>;
type AdministratorFormValues = z.infer<typeof adminstratorFormSchema>;

const selectedStaffTypeMeta: Record<
  StaffType,
  {
    title: string;
  }
> = {
  trainer: {
    title: 'Trainer',
  },
  staff: {
    title: 'Staff',
  },
};

const StaffSheetTitle = ({
  staffType,
  onChange,
}: {
  staffType?: StaffType;
  onChange: () => void;
}) => {
  const title = staffType
    ? `Add ${selectedStaffTypeMeta[staffType].title}`
    : 'Choose Staff Type';

  return (
    <div className="flex items-center gap-3 pr-10">
      <span className="min-w-0 truncate">{title}</span>
      {staffType && (
        <Button
          type="button"
          variant="outlinePrimary"
          size="sm"
          onClick={onChange}
        >
          Change
        </Button>
      )}
    </div>
  );
};

export const AddStaff: React.FC<CreateStaffDetailsProps> = ({
  isOpen,
  closeSheet,
  staffCount,
  trainerCount,
}) => {
  const { gymBranch } = useGymBranch();
  const queryClient = useQueryClient();
  const [staffType, setStaffType] = useState<StaffType>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { requireLimitAccess } = useSubscriptionAccess();

  const trainerForm = useForm<TrainerFormValues>({
    resolver: zodResolver(trainerFormSchema),
    defaultValues: {
      ProfilePicture: null,
      TrainerName: '',
      Email: undefined,
      Phone: '',
      Dob: undefined,
      BloodGroup: '',
      Gender: '',
      AddressLine: '',
      Doj: toUtcDateOnlyISOString(new Date()),
      Certification: [],
      Username: '',
      Password: '',
    },
  });

  const adminForm = useForm<AdministratorFormValues>({
    resolver: zodResolver(adminstratorFormSchema),
    defaultValues: {
      ProfilePicture: null,
      Name: '',
      Email: undefined,
      Phone: '',
      Dob: undefined,
      bloodGroup: '',
      Gender: '',
      AddressLine: '',
      Doj: toUtcDateOnlyISOString(new Date()),
      Username: '',
      Password: '',
    },
  });

  const activeForm =
    staffType === 'trainer'
      ? trainerForm
      : staffType === 'staff'
        ? adminForm
        : null;
  const activeId =
    staffType === 'trainer'
      ? 'trainer-form'
      : staffType === 'staff'
        ? 'administrator-form'
        : undefined;

  const handleSubmit = async (
    data: TrainerFormValues | AdministratorFormValues
  ) => {
    if (!staffType || !activeForm) return;

    const limitKey = staffType === 'trainer' ? 'maxTrainers' : 'maxStaffs';
    const currentCount = staffType === 'trainer' ? trainerCount : staffCount;
    const allowed = requireLimitAccess(limitKey, currentCount, {
      title:
        staffType === 'trainer'
          ? 'Trainer limit reached'
          : 'Staff limit reached',
      message: 'Upgrade your plan to add more team members.',
    });
    if (!allowed) return;

    setIsSubmitting(true);
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      const value = data[key as keyof typeof data];

      if (key === 'ProfilePicture' && value instanceof File) {
        formData.append(key, value);
      } else if (
        key === 'Certification' &&
        Array.isArray(value) &&
        value.length > 0
      ) {
        const labels = value.map((cert) => cert.label);
        formData.append(key, JSON.stringify(labels));
      } else if (key === 'Certification') {
        // Certifications are optional - skip when none are selected
      } else if (key === 'Email' && (!value || value === '')) {
        // Skip empty email - don't append to FormData
      } else if (
        (key === 'BloodGroup' || key === 'bloodGroup') &&
        (!value || value === '')
      ) {
        // Blood group is optional - skip when empty
      } else if (
        (key === 'Username' || key === 'Password') &&
        (!value || value === '')
      ) {
        // Staff credentials are optional - skip if empty
      } else {
        formData.append(key, String(value));
      }
    });

    if (gymBranch?.gymId) {
      formData.append('Gymid', String(gymBranch.gymId));
    }

    const result = await createStaff(formData, staffType);

    if (result.success) {
      toast.success(result.success);
      activeForm.reset();
      setStaffType(undefined);
      closeSheet();
      queryClient.invalidateQueries({
        queryKey: ['gymStaffs', gymBranch?.gymId],
      });
    } else {
      toast.error(result.error);
    }

    setIsSubmitting(false);
  };

  const handleReset = () => {
    trainerForm.reset();
    adminForm.reset();
    setStaffType(undefined);
  };

  const handleChangeStaffType = () => {
    setStaffType(undefined);
  };

  const handleClose = () => {
    activeForm?.reset();
    setStaffType(undefined);
    closeSheet();
  };

  const footer = (
    <div className="flex justify-between items-center w-full gap-3">
      <Button
        type="button"
        variant="secondary"
        className="h-11.5 min-w-18.25"
        onClick={handleReset}
      >
        Reset
      </Button>
      <div className="flex justify-center gap-3">
        <Button
          onClick={handleClose}
          type="button"
          variant="secondary"
          className="h-11.5 min-w-22.5"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          form={activeId}
          type="submit"
          className="h-11.5 min-w-18.25"
          disabled={isSubmitting || !staffType}
        >
          {isSubmitting ? 'Adding...' : 'Add'}
        </Button>
      </div>
    </div>
  );

  return (
    <KSheet
      className="w-[536px]"
      isOpen={isOpen}
      onClose={closeSheet}
      title={
        <StaffSheetTitle
          staffType={staffType}
          onChange={handleChangeStaffType}
        />
      }
      footer={footer}
      onCloseBtnClick={handleClose}
    >
      {!staffType ? (
        <StaffTypeCards value={staffType} onSelect={setStaffType} />
      ) : staffType === 'trainer' ? (
        <FormProvider {...trainerForm}>
          <div>
            <StaffForm
              staffType={staffType}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              gymId={gymBranch?.gymId}
            />
          </div>
        </FormProvider>
      ) : (
        <FormProvider {...adminForm}>
          <div>
            <StaffForm
              staffType={staffType}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              gymId={gymBranch?.gymId}
            />
          </div>
        </FormProvider>
      )}
    </KSheet>
  );
};

export default AddStaff;
