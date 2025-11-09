import Image from 'next/image';
import { Fragment } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormOptionsResponse } from '@/hooks/use-gymform-options';
import { bloodGroupOptions } from '@/lib/constants';
import type { EditableSectionProps } from '@/types/members';

export function BasicDetailsSection({
  isEditing,
  details,
  onUpdate,
  formOptions,
}: EditableSectionProps & { formOptions?: FormOptionsResponse }) {
  const options = formOptions;

  return (
    <Fragment>
      {/* HEIGHT  */}
      <EditableField
        label="Height"
        value={details?.height}
        isEditing={isEditing}
        onChange={(value) =>
          onUpdate('height', value === '' ? 0 : parseFloat(value) || 0)
        }
        suffix="CM"
      />

      {/* WEIGHT  */}
      <EditableField
        label="Weight"
        value={details?.weight}
        isEditing={isEditing}
        onChange={(value) =>
          onUpdate('weight', value === '' ? 0 : parseFloat(value) || 0)
        }
        suffix="KG"
      />

      {/* PACKAGE  */}
      <EditableSelect
        label="Package"
        value={
          isEditing
            ? details?.membershipPlanId
              ? String(details.membershipPlanId)
              : undefined
            : options?.membershipPlans.find(
                (plan) => plan.membershipPlanId === details?.membershipPlanId
              )?.planName || 'Not Selected'
        }
        isEditing={isEditing}
        onChange={(value) => onUpdate('membershipPlanId', Number(value))}
        options={
          options?.membershipPlans.map((plan) => ({
            value: String(plan.membershipPlanId),
            label: plan.planName,
          })) || []
        }
      />

      {/* WORKOUT_PLAN  */}
      <EditableSelect
        label="Workout plan"
        value={
          isEditing
            ? details?.workoutPlan
              ? String(details.workoutPlan)
              : undefined
            : options?.workoutPlans.find((t) => t.id === details?.workoutPlan)
                ?.name || 'Not Selected'
        }
        isEditing={isEditing}
        onChange={(value) => onUpdate('workoutPlan', Number(value))}
        options={
          options?.workoutPlans.map((plan) => ({
            value: String(plan.id),
            label: plan.name,
          })) || []
        }
      />

      {/* TRAINER_ASSIGNED  */}
      <EditableSelect
        label="Assigned to"
        value={
          isEditing
            ? details?.personalTrainer
              ? String(details.personalTrainer)
              : undefined
            : options?.trainers.find((t) => t.id === details?.personalTrainer)
                ?.trainerName || 'Not Assigned'
        }
        isEditing={isEditing}
        onChange={(value) => onUpdate('personalTrainer', Number(value))}
        options={
          options?.trainers.map((trainer) => ({
            value: String(trainer.id),
            label: trainer.trainerName,
            avatar: '/assets/svg/Trainer-pic.svg',
          })) || []
        }
      />

      {/* BLOOD_GROUP  */}
      <EditableSelect
        label="Blood Group"
        value={details?.bloodGroup}
        isEditing={isEditing}
        onChange={(value) => onUpdate('bloodGroup', value)}
        options={bloodGroupOptions}
      />
    </Fragment>
  );
}

interface EditableFieldProps {
  label?: string;
  value?: string | number;
  isEditing?: boolean;
  onChange: (value: string) => void;
  suffix?: string;
  customInput?: React.ReactNode;
}

export function EditableField({
  label,
  value,
  isEditing,
  onChange,
  suffix,
  customInput,
}: EditableFieldProps) {
  const displayValue =
    typeof value === 'number' && value === 0 ? '' : (value ?? '');

  return (
    <div className="py-3 flex flex-col gap-2">
      <Label className="text-primary-blue-100 font-normal text-sm leading-normal">
        {label}
      </Label>
      {isEditing ? (
        customInput ? (
          customInput
        ) : (
          <div className="flex items-center pb-1.5 border-b gap-2 border-primary-blue-300 group focus-within:border-white hover:border-white k-transition">
            <Input
              maxLength={suffix ? 6 : undefined}
              value={displayValue}
              onChange={(e) => onChange(e.target.value)}
              className="border-0 rounded-none h-auto p-0 text-[15px]! focus-visible:outline-0 focus-visible:ring-0"
            />
            {suffix && (
              <span className="text-white text-[15px] leading-[140%] font-normal">
                {suffix}
              </span>
            )}
          </div>
        )
      ) : (
        <div className="flex items-center gap-1">
          <p className="text-white text-[15px] leading-[140%] font-normal">
            {displayValue}
          </p>
          {suffix && (
            <span className="block text-white text-[15px] leading-[140%] font-normal">
              {suffix}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

interface EditableSelectProps<T extends string> {
  label: string;
  value?: T;
  isEditing: boolean;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string; avatar?: string }>;
}

function EditableSelect<T extends string>({
  label,
  value,
  isEditing,
  onChange,
  options,
}: EditableSelectProps<T>) {
  return (
    <div className="py-3 flex flex-col gap-2">
      <Label className="text-primary-blue-100 font-normal text-sm leading-normal">
        {label}
      </Label>
      {isEditing ? (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="border-0 border-b rounded-none focus:outline-hidden focus:shadow-none focus:ring-0 p-0 h-auto text-[15px] text-white font-normal leading-normal pb-2 border-primary-blue-300 focus:border-white hover:border-white k-transition focus:outline-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="shad-select-content">
            {options.map((option) => (
              <SelectItem
                className="shad-select-item"
                key={option.value}
                value={option.value}
              >
                <div className="flex items-center gap-2">
                  {option.avatar && (
                    <span className="w-6 h-6 flex items-center justify-center">
                      <Image
                        height={24}
                        width={24}
                        src={option.avatar}
                        alt={option.label}
                        className="rounded-full object-cover"
                      />
                    </span>
                  )}
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <p className="text-white text-[15px] leading-[140%] font-normal">
          {value}
        </p>
      )}
    </div>
  );
}
