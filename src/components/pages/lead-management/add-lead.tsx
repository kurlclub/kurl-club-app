'use client';

import { useEffect, useMemo } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@kurlclub/ui-components';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, CircleQuestionMark, UsersRound } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod/v4';

import {
  KFormField,
  KFormFieldType,
} from '@/components/shared/form/k-formfield';
import { KSheet } from '@/components/shared/form/k-sheet';
import {
  KBadgeAds,
  KBadgeOnline,
  KBadgeWalkIn,
} from '@/components/shared/icons';
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
import { Lead, LeadSource } from '@/types/lead';
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
  source: z.enum(['walk_in', 'online', 'ads', 'referral', 'other']),
  status: z.enum(['new', 'interested', 'contacted', 'lost']),
  note: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

const sourceOptions: Array<{
  value: LeadFormValues['source'];
  label: string;
  icon: React.ReactNode;
}> = [
  {
    value: 'walk_in',
    label: 'Walk In',
    icon: <KBadgeWalkIn />,
  },
  {
    value: 'referral',
    label: 'Referral',
    icon: <UsersRound />,
  },
  {
    value: 'online',
    label: 'Online',
    icon: <KBadgeOnline />,
  },
  {
    value: 'ads',
    label: 'Advertisement',
    icon: <KBadgeAds />,
  },
  {
    value: 'other',
    label: 'Other',
    icon: <CircleQuestionMark />,
  },
];

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
      source: (initialData?.source as LeadSource) || 'walk_in',
      status: initialData ? normalizeLeadStatus(initialData.interest) : 'new',
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
      status: initialData ? data.status : 'new',
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

  const selectedSource = useWatch({
    control: form.control,
    name: 'source',
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

          <div className="flex flex-col gap-2 p-3 rounded-lg bg-secondary-blue-500">
            <Label className="text-sm leading-normal mb-1">Source</Label>

            <FormControl>
              <RadioGroup
                value={selectedSource}
                onValueChange={(value) =>
                  form.setValue('source', value as LeadFormValues['source'], {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                className="flex flex-wrap gap-2"
              >
                {sourceOptions.map(({ value, label, icon }) => {
                  const isSelected = selectedSource === value;

                  return (
                    <label
                      key={value}
                      htmlFor={`lead-source-${value}`}
                      className={cn(
                        'inline-flex h-9 items-center gap-2 rounded-full border px-3 text-sm font-medium cursor-pointer transition-all',
                        isSelected
                          ? 'border-primary-green-500 bg-primary-green-500/10 text-white'
                          : 'border-white/30 bg-primary-blue-400 text-white hover:border-white/70'
                      )}
                    >
                      <RadioGroupItem
                        value={value}
                        id={`lead-source-${value}`}
                        className="sr-only"
                      />
                      <span className="flex size-4 items-center justify-center">
                        {icon}
                      </span>
                      <span>{label}</span>
                      {isSelected && (
                        <span className="flex size-4 items-center justify-center rounded-full bg-primary-green-500 text-primary-blue-950">
                          <Check className="size-3 text-secondary-blue-500" />
                        </span>
                      )}
                    </label>
                  );
                })}
              </RadioGroup>
            </FormControl>
          </div>

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
