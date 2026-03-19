'use client';

import { useEffect, useMemo } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@kurlclub/ui-components';
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
import { cn } from '@/lib/utils';

const supportFormSchema = z.object({
  subject: z
    .string()
    .min(1, 'Subject is required')
    .min(3, 'Subject must be at least 3 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters'),
  category: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
});

type SupportFormValues = z.infer<typeof supportFormSchema>;

interface AddSupportProps {
  closeSheet: () => void;
  isOpen: boolean;
  initialData?: Partial<SupportFormValues>;
}

const AddSupport: React.FC<AddSupportProps> = ({
  isOpen,
  closeSheet,
  initialData,
}) => {
  const defaultFormValues = useMemo<SupportFormValues>(
    () => ({
      subject: initialData?.subject || '',
      description: initialData?.description || '',
      category: initialData?.category || '',
      priority:
        (initialData?.priority as 'low' | 'medium' | 'high') || 'medium',
    }),
    [initialData]
  );

  const form = useForm<SupportFormValues>({
    resolver: zodResolver(supportFormSchema),
    defaultValues: defaultFormValues,
  });

  const handleReset = () => {
    form.reset(defaultFormValues);
  };

  const onSubmit = async (data: SupportFormValues) => {
    try {
      // TODO: Add API call to submit support request
      console.log('Support Request:', data);
      toast.success('Support request submitted successfully');
      closeSheet();
      handleReset();
    } catch (error) {
      toast.error('Failed to submit support request');
    }
  };

  // if initialData changes (editing) or sheet opens, reset the form accordingly
  useEffect(() => {
    if (isOpen) {
      form.reset(defaultFormValues);
    }
  }, [defaultFormValues, isOpen, form]);

  const selectedPriority = useWatch({
    control: form.control,
    name: 'priority',
  });

  return (
    <FormProvider {...form}>
      <KSheet
        className="w-112.5"
        title={initialData ? 'Edit Request Support' : 'Add Request Support'}
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
              <Button type="submit" form="support-form">
                {initialData ? 'Save Changes' : 'Submit Request'}
              </Button>
            </div>
          </div>
        }
      >
        <form
          id="support-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
        >
          {/* Subject */}
          <KFormField
            control={form.control}
            name="subject"
            fieldType={KFormFieldType.INPUT}
            label="Subject"
            placeholder="Enter support subject"
          />

          {/* Description */}
          <KFormField
            control={form.control}
            name="description"
            fieldType={KFormFieldType.TEXTAREA}
            label="Description"
            placeholder="Describe your issue in detail"
            maxLength={500}
          />

          {/* Category (Optional) */}
          <KFormField
            control={form.control}
            name="category"
            fieldType={KFormFieldType.SELECT}
            label="Category"
            placeholder="Select a category (optional)"
            options={[
              { label: 'Technical Issue', value: 'technical' },
              { label: 'Billing & Payments', value: 'billing' },
              { label: 'Account Access', value: 'account' },
              { label: 'Feature Request', value: 'feature_request' },
              { label: 'Bug Report', value: 'bug' },
              { label: 'Performance Issue', value: 'performance' },
              { label: 'Data / Reports Issue', value: 'data' },
              { label: 'Staff Management', value: 'staff' },
              { label: 'Membership / Plans', value: 'membership' },
              { label: 'Onboarding Help', value: 'onboarding' },
              { label: 'General Inquiry', value: 'general' },
              { label: 'Other', value: 'other' },
            ]}
          />

          {/* Priority */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm leading-normal mb-1">Priority</Label>

            <FormControl>
              <RadioGroup
                value={selectedPriority}
                onValueChange={(value) =>
                  form.setValue('priority', value as 'low' | 'medium' | 'high')
                }
                className="grid grid-cols-3 gap-3"
              >
                {(
                  [
                    {
                      value: 'low',
                      label: 'Low',
                      dot: 'bg-neutral-green-500',
                      activeBorder: 'border-neutral-green-500',
                      activeBg: 'bg-neutral-green-500/10',
                    },
                    {
                      value: 'medium',
                      label: 'Medium',
                      dot: 'bg-secondary-yellow-500',
                      activeBorder: 'border-secondary-yellow-500',
                      activeBg: 'bg-secondary-yellow-500/10',
                    },
                    {
                      value: 'high',
                      label: 'High',
                      dot: 'bg-alert-red-500',
                      activeBorder: 'border-alert-red-500',
                      activeBg: 'bg-alert-red-500/10',
                    },
                  ] as const
                ).map(({ value, label, dot, activeBorder, activeBg }) => (
                  <label
                    key={value}
                    htmlFor={`priority-${value}`}
                    className={cn(
                      'flex items-center gap-2.5 border rounded-lg px-3 py-2.5 cursor-pointer transition-all',
                      selectedPriority === value
                        ? `${activeBorder} ${activeBg}`
                        : 'border-white/40 hover:border-white/80 k-transition'
                    )}
                  >
                    <RadioGroupItem
                      value={value}
                      id={`priority-${value}`}
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
        </form>
      </KSheet>
    </FormProvider>
  );
};

export default AddSupport;
