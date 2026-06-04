'use client';

import Image from 'next/image';
import { useFormContext } from 'react-hook-form';

import { z } from 'zod/v4';

import { adminstratorFormSchema, trainerFormSchema } from '@/schemas';
import { StaffType } from '@/types/staff';

import AdministratorForm from './administrator-form';
import TrainerForm from './trainer-form';

type TrainerFormValues = z.infer<typeof trainerFormSchema>;
type AdministratorFormValues = z.infer<typeof adminstratorFormSchema>;

const staffTypeOptions: Array<{
  value: StaffType;
  label: string;
  characterImage: string;
}> = [
  {
    value: 'trainer',
    label: 'Trainer',
    characterImage: '/assets/png/trainer.png',
  },
  {
    value: 'staff',
    label: 'Staff',
    characterImage: '/assets/png/staff.png',
  },
];

export const StaffTypeCards = ({
  value,
  onSelect,
}: {
  value?: StaffType;
  onSelect: (value: StaffType) => void;
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {staffTypeOptions.map((option) => {
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className={`relative text-left rounded-[14px] border transition-all overflow-hidden min-h-27.5 ${
                isSelected
                  ? 'border-primary-green-500'
                  : 'border-secondary-blue-400 hover:border-secondary-blue-300'
              }`}
            >
              <div
                className="absolute inset-0 bg-linear-to-br from-[#141720] via-[#1C1F24] to-[#282D35]"
                style={{ zIndex: 0 }}
              />
              <div
                className="relative flex flex-col justify-between h-full items-center gap-3 p-4 pb-0"
                style={{ zIndex: 1 }}
              >
                <p className="text-white text-lg font-medium">
                  Add {option.label}
                </p>
                <div style={{ zIndex: 2 }}>
                  <Image
                    src={option.characterImage}
                    alt={option.label}
                    width={140}
                    height={130}
                    className="object-contain pointer-events-none"
                    priority
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface StaffFormProps {
  staffType: StaffType;
  onSubmit: (data: TrainerFormValues | AdministratorFormValues) => void;
  isSubmitting: boolean;
  gymId?: number;
}

export default function StaffForm({
  staffType,
  onSubmit,
  isSubmitting,
  gymId,
}: StaffFormProps) {
  const form = useFormContext();

  const activeId =
    staffType === 'trainer' ? 'trainer-form' : 'administrator-form';

  return (
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
  );
}
