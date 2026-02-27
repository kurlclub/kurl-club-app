import { Fragment } from 'react';

import { EditableFormField } from '@/components/shared/form/editable-form-field';
import { useGymFormOptions } from '@/hooks/use-gymform-options';
import { bloodGroupOptions } from '@/lib/constants';
import { useGymBranch } from '@/providers/gym-branch-provider';
import type { EditableSectionProps } from '@/types/staff';

export function BasicDetailsSection({
  isEditing,
  details,
  onUpdate,
}: EditableSectionProps) {
  const { gymBranch } = useGymBranch();
  const { formOptions, loading, error } = useGymFormOptions(gymBranch?.gymId);

  return (
    <Fragment>
      {/* HEIGHT  */}
      <EditableFormField
        type="input"
        label="Height"
        value={details?.height}
        isEditing={isEditing}
        onChange={(value) => onUpdate('height', parseFloat(value))}
        suffix="CM"
      />

      {/* WEIGHT  */}
      <EditableFormField
        type="input"
        label="Weight"
        value={details?.weight}
        isEditing={isEditing}
        onChange={(value) => onUpdate('weight', parseFloat(value))}
        suffix="KG"
      />

      {/* WORKOUT_PLAN  */}
      <EditableFormField
        type="select"
        label="Workout plan"
        value={
          isEditing
            ? details?.workoutPlan
              ? String(details.workoutPlan)
              : undefined
            : formOptions?.workoutPlans.find(
                (t) => t.id === details?.workoutPlan
              )?.name || 'Not Selected'
        }
        isEditing={isEditing}
        onChange={(value) => onUpdate('workoutPlan', Number(value))}
        options={
          loading
            ? [{ value: '', label: 'Loading...' }]
            : error
              ? [{ value: '', label: 'Error loading data' }]
              : formOptions?.workoutPlans.map((plan) => ({
                  value: String(plan.id),
                  label: plan.name,
                })) || []
        }
      />

      {/* TRAINER_ASSIGNED  */}
      <EditableFormField
        type="select"
        label="Assigned to"
        value={
          isEditing
            ? details?.personalTrainer
              ? String(details.personalTrainer)
              : undefined
            : formOptions?.trainers.find(
                (t) => t.id === details?.personalTrainer
              )?.trainerName || 'Not Assigned'
        }
        isEditing={isEditing}
        onChange={(value) => onUpdate('personalTrainer', Number(value))}
        options={
          loading
            ? [{ value: '', label: 'Loading...' }]
            : error
              ? [{ value: '', label: 'Error loading data' }]
              : formOptions?.trainers.map((trainer) => ({
                  value: String(trainer.id),
                  label: trainer.trainerName,
                  avatar: '/assets/svg/Trainer-pic.svg',
                })) || []
        }
      />

      {/* BLOOD_GROUP  */}
      <EditableFormField
        type="select"
        label="Blood Group"
        value={details?.bloodGroup}
        isEditing={isEditing}
        onChange={(value) => onUpdate('bloodGroup', value)}
        options={bloodGroupOptions}
      />
    </Fragment>
  );
}
