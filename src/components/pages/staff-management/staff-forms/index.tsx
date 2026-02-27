'use client';

import { useFormContext } from 'react-hook-form';

import { z } from 'zod/v4';

import { KSelect } from '@/components/shared/form/k-select';
import { adminstratorFormSchema, trainerFormSchema } from '@/schemas';
import { StaffType } from '@/types/staff';

import AdministratorForm from './administrator-form';
import TrainerForm from './trainer-form';

type TrainerFormValues = z.infer<typeof trainerFormSchema>;
type AdministratorFormValues = z.infer<typeof adminstratorFormSchema>;

interface StaffFormProps {
  staffType: StaffType;
  onStaffTypeChange: (staffType: StaffType) => void;
  onSubmit: (data: TrainerFormValues | AdministratorFormValues) => void;
  isSubmitting: boolean;
  gymId?: number;
}

export default function StaffForm({
  staffType,
  onStaffTypeChange,
  onSubmit,
  isSubmitting,
  gymId,
}: StaffFormProps) {
  const form = useFormContext();

  const activeId =
    staffType === 'trainer' ? 'trainer-form' : 'administrator-form';

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <KSelect
          label="Staff Type"
          value={staffType}
          onValueChange={(value) => onStaffTypeChange(value as StaffType)}
          options={[
            { label: 'Trainer', value: 'trainer' },
            { label: 'Staff', value: 'staff' },
          ]}
          className="border-white! rounded-lg!"
        />
      </div>

      <form
        id={activeId}
        onSubmit={form.handleSubmit((data) =>
          onSubmit(data as TrainerFormValues | AdministratorFormValues)
        )}
        className="space-y-4"
      >
        {staffType === 'trainer' && (
          <TrainerForm gymId={gymId} isSubmitting={isSubmitting} />
        )}

        {staffType === 'staff' && (
          <AdministratorForm gymId={gymId} isSubmitting={isSubmitting} />
        )}
      </form>
    </div>
  );
}
