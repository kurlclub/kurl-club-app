'use client';

import { useEffect, useMemo } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@kurlclub/ui-components';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod/v4';

import {
  KFormField,
  KFormFieldType,
} from '@/components/shared/form/k-formfield';
import { KSheet } from '@/components/shared/form/k-sheet';
import { FormControl } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn, toUtcDateOnlyISOString } from '@/lib/utils';
import { useGymBranch } from '@/providers/gym-branch-provider';
import {
  type CreateLeadPayload,
  createLead,
  updateLead,
} from '@/services/lead';
import { useGymStaffs } from '@/services/staff';
import { Lead } from '@/types/lead';
import type { StaffType } from '@/types/staff';

const leadFormSchema = z.object({
  leadName: z.string().min(1, 'Lead name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  followUpDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Please select a valid date.',
    }),
  assignedTo: z.string().optional(),
  source: z.enum(['walk_in', 'online', 'ads']),
  status: z.enum(['new', 'interested', 'contacted', 'lost']),
  note: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

const normalizeLeadStatus = (status?: string): LeadFormValues['status'] => {
  const normalized = (status || '').toLowerCase();
  if (
    normalized === 'new' ||
    normalized === 'interested' ||
    normalized === 'contacted' ||
    normalized === 'lost'
  ) {
    return normalized;
  }

  return 'new';
};

interface AddLeadProps {
  closeSheet: () => void;
  isOpen: boolean;
  initialData?: Partial<Lead>;
}

const AddLead: React.FC<AddLeadProps> = ({
  isOpen,
  closeSheet,
  initialData,
}) => {
  const { gymBranch } = useGymBranch();
  const queryClient = useQueryClient();
  const { data: gymStaffs = [] } = useGymStaffs(gymBranch?.gymId ?? '');

  const createLeadMutation = useMutation({
    mutationFn: (payload: CreateLeadPayload) =>
      createLead(gymBranch!.gymId, payload),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['leads', gymBranch?.gymId] });
      toast.success(result.message || 'Lead added successfully');
      closeSheet();
      handleReset();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to add lead'
      );
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: ({
      leadId,
      payload,
    }: {
      leadId: number;
      payload: CreateLeadPayload;
    }) => updateLead(gymBranch!.gymId, leadId, payload),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['leads', gymBranch?.gymId] });
      toast.success(result.message || 'Lead updated successfully');
      closeSheet();
      handleReset();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update lead'
      );
    },
  });

  const initialAssignedToValue = useMemo(() => {
    if (initialData?.assignedToUserType && initialData?.assignedToUserId) {
      return `${initialData.assignedToUserType.toLowerCase()}:${initialData.assignedToUserId}`;
    }

    return '';
  }, [initialData]);

  const assignedToOptions = useMemo(() => {
    const options = gymStaffs
      .filter((staff) => !!staff.name)
      .map((staff) => ({
        label: `${staff.name} (${staff.role.toLocaleLowerCase() === 'trainer' ? 'Trainer' : 'Staff'})`,
        value: `${staff.role.toLowerCase()}:${staff.id}`,
      }));

    return options;
  }, [gymStaffs]);

  const defaultFormValues = useMemo<LeadFormValues>(
    () => ({
      leadName: initialData?.leadName || '',
      phone: initialData?.phone || '',
      followUpDate: initialData?.followUpDate || '',
      assignedTo: initialAssignedToValue,
      source:
        (initialData?.source as 'walk_in' | 'online' | 'ads') || 'walk_in',
      status: normalizeLeadStatus(initialData?.interest),
      note: initialData?.note || '',
    }),
    [initialAssignedToValue, initialData]
  );

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: defaultFormValues,
  });

  const handleReset = () => {
    form.reset(defaultFormValues);
  };

  const parseAssignedTo = (value?: string) => {
    if (!value) return null;

    const [role, id] = value.split(':');
    if (!role || !id) return null;

    if (role !== 'staff' && role !== 'trainer') return null;

    const numericId = Number(id);
    if (!Number.isFinite(numericId)) return null;

    return { role: role as StaffType, id: numericId };
  };

  const onSubmit = async (data: LeadFormValues) => {
    if (!gymBranch?.gymId) {
      toast.error('Gym not selected. Please select a gym and try again.');
      return;
    }

    const payload: CreateLeadPayload = {
      name: data.leadName,
      phone: data.phone,
      source: data.source,
      status: data.status,
      notes: data.note || '',
    };

    if (data.followUpDate) {
      const normalizedDate = toUtcDateOnlyISOString(data.followUpDate);
      if (normalizedDate) {
        payload.followUpDate = normalizedDate;
      }
    }

    const assignee = parseAssignedTo(data.assignedTo);
    if (data.assignedTo && !assignee) {
      toast.error('Please select a valid assignee.');
      return;
    }

    if (assignee) {
      payload.assignedToUserId = assignee.id;
      payload.assignedToUserType = assignee.role;
    }

    if (initialData?.id) {
      await updateLeadMutation.mutateAsync({ leadId: initialData.id, payload });
      return;
    }

    await createLeadMutation.mutateAsync(payload);
  };

  // if initialData changes (editing) or sheet opens, reset the form accordingly
  useEffect(() => {
    if (isOpen) {
      form.reset(defaultFormValues);
    }
  }, [defaultFormValues, isOpen, form]);

  const selectedStatus = useWatch({
    control: form.control,
    name: 'status',
  });

  return (
    <FormProvider {...form}>
      <KSheet
        className="w-112.5"
        title={initialData ? 'Edit Lead' : 'Add Lead'}
        isOpen={isOpen}
        onClose={() => {
          handleReset();
          closeSheet();
        }}
        onCloseBtnClick={() => {
          handleReset();
          closeSheet();
        }}
        position="right"
        footer={
          <div className="flex items-center gap-3 justify-between w-full">
            {!initialData && (
              <Button variant="secondary" onClick={handleReset}>
                Reset
              </Button>
            )}
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  handleReset();
                  closeSheet();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="lead-form"
                disabled={
                  createLeadMutation.isPending || updateLeadMutation.isPending
                }
              >
                {initialData ? 'Save Changes' : 'Add Lead'}
              </Button>
            </div>
          </div>
        }
      >
        <form
          id="lead-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
        >
          {/* Lead Name */}
          <KFormField
            control={form.control}
            name="leadName"
            fieldType={KFormFieldType.INPUT}
            label="Lead Name"
            placeholder="Enter lead name"
          />

          {/* Phone Number with Country Code */}
          <KFormField
            control={form.control}
            name="phone"
            fieldType={KFormFieldType.PHONE_INPUT}
            label="Phone Number"
          />
          <div className="flex items-center gap-3">
            {/* Follow-up Date */}
            <KFormField
              control={form.control}
              name="followUpDate"
              fieldType={KFormFieldType.DATE_PICKER}
              label="Follow-up Date"
              mode="single"
              floating
              disabledDates={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today;
              }}
            />

            {/* Assigned To */}
            <KFormField
              control={form.control}
              name="assignedTo"
              fieldType={KFormFieldType.SELECT}
              label="Assigned To"
              placeholder="Select staff member"
              options={assignedToOptions}
            />
          </div>

          {/* Source Select */}
          <KFormField
            control={form.control}
            name="source"
            fieldType={KFormFieldType.SELECT}
            label="Source"
            placeholder="Select source"
            options={[
              { label: 'Walk In', value: 'walk_in' },
              { label: 'Online', value: 'online' },
              { label: 'Ads', value: 'ads' },
            ]}
          />

          <div className="flex flex-col gap-2">
            <Label className="text-sm leading-normal mb-1">Status</Label>

            <FormControl>
              <RadioGroup
                value={selectedStatus}
                onValueChange={(value) =>
                  form.setValue(
                    'status',
                    value as 'new' | 'interested' | 'contacted' | 'lost'
                  )
                }
                className="grid grid-cols-2 gap-3"
              >
                {(
                  [
                    {
                      value: 'new',
                      label: 'New',
                      dot: 'bg-secondary-yellow-500',
                      activeBorder: 'border-secondary-yellow-500',
                      activeBg: 'bg-secondary-yellow-500/10',
                    },
                    {
                      value: 'interested',
                      label: 'Interested',
                      dot: 'bg-neutral-green-500',
                      activeBorder: 'border-neutral-green-500',
                      activeBg: 'bg-neutral-green-500/10',
                    },
                    {
                      value: 'contacted',
                      label: 'Contacted',
                      dot: 'bg-semantic-blue-500',
                      activeBorder: 'border-semantic-blue-500',
                      activeBg: 'bg-semantic-blue-500/10',
                    },
                    {
                      value: 'lost',
                      label: 'Mark Lost',
                      dot: 'bg-alert-red-500',
                      activeBorder: 'border-alert-red-500',
                      activeBg: 'bg-alert-red-500/10',
                    },
                  ] as const
                ).map(({ value, label, dot, activeBorder, activeBg }) => (
                  <label
                    key={value}
                    htmlFor={value}
                    className={cn(
                      'flex items-center gap-2.5 border rounded-lg px-3 py-2.5 cursor-pointer transition-all',
                      selectedStatus === value
                        ? `${activeBorder} ${activeBg}`
                        : 'border-white/40 hover:border-white/80 k-transition'
                    )}
                  >
                    <RadioGroupItem
                      value={value}
                      id={value}
                      className="sr-only"
                    />
                    <span
                      className={cn('size-2.5 rounded-full shrink-0', dot)}
                    />
                    <span className="text-sm font-medium">{label}</span>
                  </label>
                ))}
              </RadioGroup>
            </FormControl>
          </div>

          {/* Note */}
          <KFormField
            control={form.control}
            name="note"
            fieldType={KFormFieldType.TEXTAREA}
            label="Notes"
            placeholder="Add any additional notes"
            maxLength={500}
          />
        </form>
      </KSheet>
    </FormProvider>
  );
};

export default AddLead;
