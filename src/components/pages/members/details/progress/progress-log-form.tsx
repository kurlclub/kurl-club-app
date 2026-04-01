'use client';

import { useEffect } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';

import {
  KFormField,
  KFormFieldType,
} from '@/components/shared/form/k-formfield';
import { KSheet } from '@/components/shared/form/k-sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useGymBranch } from '@/providers/gym-branch-provider';
import {
  type ProgressLogFormData,
  progressLogSchema,
} from '@/schemas/progress.schema';
import {
  useCreateProgressLog,
  useUpdateProgressLog,
} from '@/services/progress';
import type { ProgressLog } from '@/types/progress';

const energyLevelOptions = [
  { label: '1 — Very Low', value: '1' },
  { label: '2 — Low', value: '2' },
  { label: '3 — Moderate', value: '3' },
  { label: '4 — High', value: '4' },
  { label: '5 — Very High', value: '5' },
];

interface ProgressLogFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: number | string;
  editLog?: ProgressLog | null;
}

export function ProgressLogForm({
  open,
  onOpenChange,
  memberId,
  editLog,
}: ProgressLogFormProps) {
  const { gymBranch } = useGymBranch();
  const { mutate: createLog, isPending: isCreating } =
    useCreateProgressLog(memberId);
  const { mutate: updateLog, isPending: isUpdating } =
    useUpdateProgressLog(memberId);
  const isProcessing = isCreating || isUpdating;

  const form = useForm<ProgressLogFormData>({
    resolver: zodResolver(progressLogSchema),
    defaultValues: {
      logDate: new Date().toISOString().split('T')[0],
      sessionNotes: '',
      energyLevel: '',
      goalProgressPercent: '',
      weight: '',
      bodyFatPercent: '',
      chestCm: '',
      waistCm: '',
      hipsCm: '',
      armsCm: '',
      thighsCm: '',
      performanceEntries: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'performanceEntries',
  });

  // Populate form when editing an existing log
  useEffect(() => {
    if (editLog) {
      form.reset({
        logDate: editLog.logDate.split('T')[0],
        sessionNotes: editLog.sessionNotes ?? '',
        energyLevel: editLog.energyLevel ? String(editLog.energyLevel) : '',
        goalProgressPercent:
          editLog.goalProgressPercent != null
            ? String(editLog.goalProgressPercent)
            : '',
        weight:
          editLog.bodyMetrics.weight != null
            ? String(editLog.bodyMetrics.weight)
            : '',
        bodyFatPercent:
          editLog.bodyMetrics.bodyFatPercent != null
            ? String(editLog.bodyMetrics.bodyFatPercent)
            : '',
        chestCm:
          editLog.bodyMetrics.chestCm != null
            ? String(editLog.bodyMetrics.chestCm)
            : '',
        waistCm:
          editLog.bodyMetrics.waistCm != null
            ? String(editLog.bodyMetrics.waistCm)
            : '',
        hipsCm:
          editLog.bodyMetrics.hipsCm != null
            ? String(editLog.bodyMetrics.hipsCm)
            : '',
        armsCm:
          editLog.bodyMetrics.armsCm != null
            ? String(editLog.bodyMetrics.armsCm)
            : '',
        thighsCm:
          editLog.bodyMetrics.thighsCm != null
            ? String(editLog.bodyMetrics.thighsCm)
            : '',
        performanceEntries: editLog.performanceEntries.map((e) => ({
          exerciseName: e.exerciseName,
          sets: String(e.sets),
          reps: String(e.reps),
          weightKg: e.weightKg != null ? String(e.weightKg) : '',
          notes: e.notes ?? '',
        })),
      });
    } else if (open) {
      form.reset({
        logDate: new Date().toISOString().split('T')[0],
        sessionNotes: '',
        energyLevel: '',
        goalProgressPercent: '',
        weight: '',
        bodyFatPercent: '',
        chestCm: '',
        waistCm: '',
        hipsCm: '',
        armsCm: '',
        thighsCm: '',
        performanceEntries: [],
      });
    }
  }, [editLog, open, form]);

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const onSubmit = (data: ProgressLogFormData) => {
    if (!gymBranch?.gymId) return;

    const payload = {
      memberId: Number(memberId),
      gymId: gymBranch.gymId,
      logDate: data.logDate,
      sessionNotes: data.sessionNotes || undefined,
      energyLevel: data.energyLevel ? Number(data.energyLevel) : undefined,
      goalProgressPercent: data.goalProgressPercent
        ? Number(data.goalProgressPercent)
        : undefined,
      bodyMetrics: {
        weightKg: data.weight ? Number(data.weight) : null,
        bodyFatPercent: data.bodyFatPercent
          ? Number(data.bodyFatPercent)
          : null,
        chestCm: data.chestCm ? Number(data.chestCm) : null,
        waistCm: data.waistCm ? Number(data.waistCm) : null,
        hipsCm: data.hipsCm ? Number(data.hipsCm) : null,
        armsCm: data.armsCm ? Number(data.armsCm) : null,
        thighsCm: data.thighsCm ? Number(data.thighsCm) : null,
      },
      performanceEntries: (data.performanceEntries ?? []).map((e) => ({
        exerciseName: e.exerciseName,
        sets: Number(e.sets),
        reps: Number(e.reps),
        weightKg: e.weightKg ? Number(e.weightKg) : null,
        notes: e.notes || null,
      })),
    };

    if (editLog) {
      updateLog(
        { logId: editLog.logId, data: payload },
        { onSuccess: handleClose }
      );
    } else {
      createLog(payload, { onSuccess: handleClose });
    }
  };

  const footer = (
    <div className="flex items-center justify-end gap-2 w-full">
      <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
        Cancel
      </Button>
      <Button onClick={form.handleSubmit(onSubmit)} disabled={isProcessing}>
        {isProcessing ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Saving...
          </div>
        ) : editLog ? (
          'Update Log'
        ) : (
          'Add Log'
        )}
      </Button>
    </div>
  );

  return (
    <KSheet
      isOpen={open}
      onClose={handleClose}
      title={editLog ? 'Edit Progress Log' : 'Add Progress Log'}
      footer={footer}
      className="w-[520px]"
    >
      <FormProvider {...form}>
        <div className="space-y-6 py-2">
          {/* Date + Energy + Goal */}
          <div className="grid grid-cols-2 gap-3">
            <KFormField
              fieldType={KFormFieldType.DATE_INPUT}
              control={form.control}
              name="logDate"
              label="Log Date"
              size="sm"
            />
            <KFormField
              fieldType={KFormFieldType.SELECT}
              control={form.control}
              name="energyLevel"
              label="Energy Level"
              options={energyLevelOptions}
              size="sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <KFormField
              fieldType={KFormFieldType.INPUT}
              control={form.control}
              name="goalProgressPercent"
              label="Goal Progress (%)"
              type="number"
              placeholder="0–100"
              size="sm"
              suffix="%"
            />
            <KFormField
              fieldType={KFormFieldType.TEXTAREA}
              control={form.control}
              name="sessionNotes"
              label="Session Notes"
            />
          </div>

          <Separator className="bg-primary-blue-400" />

          {/* Body Metrics */}
          <div>
            <p className="text-sm text-primary-blue-200 mb-3">Body Metrics</p>
            <div className="grid grid-cols-2 gap-3">
              <KFormField
                fieldType={KFormFieldType.INPUT}
                control={form.control}
                name="weight"
                label="Weight"
                type="number"
                size="sm"
                suffix="kg"
              />
              <KFormField
                fieldType={KFormFieldType.INPUT}
                control={form.control}
                name="bodyFatPercent"
                label="Body Fat"
                type="number"
                size="sm"
                suffix="%"
              />
              <KFormField
                fieldType={KFormFieldType.INPUT}
                control={form.control}
                name="chestCm"
                label="Chest"
                type="number"
                size="sm"
                suffix="cm"
              />
              <KFormField
                fieldType={KFormFieldType.INPUT}
                control={form.control}
                name="waistCm"
                label="Waist"
                type="number"
                size="sm"
                suffix="cm"
              />
              <KFormField
                fieldType={KFormFieldType.INPUT}
                control={form.control}
                name="hipsCm"
                label="Hips"
                type="number"
                size="sm"
                suffix="cm"
              />
              <KFormField
                fieldType={KFormFieldType.INPUT}
                control={form.control}
                name="armsCm"
                label="Arms"
                type="number"
                size="sm"
                suffix="cm"
              />
              <KFormField
                fieldType={KFormFieldType.INPUT}
                control={form.control}
                name="thighsCm"
                label="Thighs"
                type="number"
                size="sm"
                suffix="cm"
              />
            </div>
          </div>

          <Separator className="bg-primary-blue-400" />

          {/* Performance Entries */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-primary-blue-200">Exercises</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    exerciseName: '',
                    sets: '',
                    reps: '',
                    weightKg: '',
                    notes: '',
                  })
                }
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Exercise
              </Button>
            </div>

            {fields.length === 0 && (
              <p className="text-xs text-primary-blue-200 text-center py-3">
                No exercises added. Click &quot;Add Exercise&quot; to log
                workout performance.
              </p>
            )}

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="rounded-md border border-primary-blue-400 bg-primary-blue-500/20 p-3 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-primary-green-500 font-medium">
                      Exercise {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-primary-blue-200 hover:text-alert-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <KFormField
                    fieldType={KFormFieldType.INPUT}
                    control={form.control}
                    name={`performanceEntries.${index}.exerciseName`}
                    label="Exercise Name"
                    size="sm"
                  />

                  <div className="grid grid-cols-3 gap-2">
                    <KFormField
                      fieldType={KFormFieldType.INPUT}
                      control={form.control}
                      name={`performanceEntries.${index}.sets`}
                      label="Sets"
                      type="number"
                      size="sm"
                    />
                    <KFormField
                      fieldType={KFormFieldType.INPUT}
                      control={form.control}
                      name={`performanceEntries.${index}.reps`}
                      label="Reps"
                      type="number"
                      size="sm"
                    />
                    <KFormField
                      fieldType={KFormFieldType.INPUT}
                      control={form.control}
                      name={`performanceEntries.${index}.weightKg`}
                      label="Weight"
                      type="number"
                      size="sm"
                      suffix="kg"
                    />
                  </div>

                  <KFormField
                    fieldType={KFormFieldType.TEXTAREA}
                    control={form.control}
                    name={`performanceEntries.${index}.notes`}
                    label="Notes (optional)"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </FormProvider>
    </KSheet>
  );
}
