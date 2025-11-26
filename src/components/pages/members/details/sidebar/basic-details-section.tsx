import { Fragment, useState } from 'react';

import { Eye } from 'lucide-react';

import { EditableFormField } from '@/components/shared/form/editable-form-field';
import { DocumentPreviewModal } from '@/components/shared/modals/document-preview-modal';
import FileUploader from '@/components/shared/uploaders/file-uploader';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FormOptionsResponse } from '@/hooks/use-gymform-options';
import {
  bloodGroupOptions,
  idTypeOptions,
  purposeOptions,
} from '@/lib/constants';
import type { EditableSectionProps } from '@/types/members';

export function BasicDetailsSection({
  isEditing,
  details,
  onUpdate,
  formOptions,
}: EditableSectionProps & { formOptions?: FormOptionsResponse }) {
  const options = formOptions;
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <Fragment>
      {/* HEIGHT  */}
      <EditableFormField
        type="input"
        label="Height"
        value={details?.height}
        isEditing={isEditing}
        onChange={(value) =>
          onUpdate('height', value === '' ? 0 : parseFloat(value) || 0)
        }
        suffix="CM"
      />

      {/* WEIGHT  */}
      <EditableFormField
        type="input"
        label="Weight"
        value={details?.weight}
        isEditing={isEditing}
        onChange={(value) =>
          onUpdate('weight', value === '' ? 0 : parseFloat(value) || 0)
        }
        suffix="KG"
      />

      {/* PACKAGE  */}
      <EditableFormField
        type="select"
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
      <EditableFormField
        type="select"
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
      <EditableFormField
        type="select"
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
      <EditableFormField
        type="select"
        label="Blood Group"
        value={details?.bloodGroup}
        isEditing={isEditing}
        onChange={(value) => onUpdate('bloodGroup', value)}
        options={bloodGroupOptions}
      />

      {/* FITNESS_GOAL  */}
      <EditableFormField
        type="select"
        label="Fitness Goal"
        value={details?.fitnessGoal}
        isEditing={isEditing}
        onChange={(value) => onUpdate('fitnessGoal', value)}
        options={purposeOptions}
      />

      {/* MEDICAL_HISTORY  */}
      <EditableFormField
        type="input"
        label="Medical History"
        value={details?.medicalHistory}
        isEditing={isEditing}
        onChange={(value) => onUpdate('medicalHistory', value)}
      />

      {/* ID_TYPE  */}
      <EditableFormField
        type="select"
        label="ID Type"
        value={details?.idType}
        isEditing={isEditing}
        onChange={(value) => onUpdate('idType', value)}
        options={idTypeOptions}
      />

      {/* ID_NUMBER  */}
      <EditableFormField
        type="input"
        label="ID Number"
        value={details?.idNumber}
        isEditing={isEditing}
        onChange={(value) => onUpdate('idNumber', value)}
      />

      {/* ID_COPY_PATH  */}
      {isEditing ? (
        <div className="py-3 flex flex-col gap-2">
          <Label className="text-primary-blue-100 font-normal text-sm leading-normal">
            ID Document
          </Label>
          <FileUploader
            file={
              details?.idCopyPath && details.idCopyPath instanceof File
                ? details.idCopyPath
                : null
            }
            onChange={(file) => onUpdate('idCopyPath', file || null)}
            existingFileUrl={
              details?.idCopyPath && typeof details.idCopyPath === 'string'
                ? details.idCopyPath
                : undefined
            }
            label="Upload ID Document"
          />
        </div>
      ) : (
        details?.idCopyPath && (
          <>
            <div className="py-3 flex flex-col gap-2">
              <Label className="text-primary-blue-100 font-normal text-sm leading-normal">
                ID Document
              </Label>
              <Button
                type="button"
                variant="link"
                onClick={() => setPreviewOpen(true)}
                className="text-primary-green-500 hover:text-primary-green-400 text-[15px] leading-[140%] font-normal underline inline-flex items-center gap-1 p-0 h-auto justify-start"
              >
                <Eye className="h-4 w-4" />
                View Document
              </Button>
            </div>

            <DocumentPreviewModal
              open={previewOpen}
              onOpenChange={setPreviewOpen}
              documentUrl={
                typeof details.idCopyPath === 'string' ? details.idCopyPath : ''
              }
              title="ID Document Preview"
            />
          </>
        )
      )}
    </Fragment>
  );
}
