'use client';

import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@kurlclub/ui-components';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toUtcDateOnlyISOString } from '@/lib/utils';
import { Lead } from '@/types/lead';

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
  note: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

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
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      leadName: initialData?.leadName || '',
      phone: initialData?.phone || '',
      followUpDate: initialData?.followUpDate,
      assignedTo: initialData?.assignedTo || '',
      source:
        (initialData?.source as 'walk_in' | 'online' | 'ads') || 'walk_in',
      note: initialData?.note || '',
    },
  });

  const handleReset = () => {
    form.reset(initialData || {});
  };

  const onSubmit = (data: LeadFormValues) => {
    // convert the date back to an ISO string if the server expects that
    const payload = {
      ...data,
      followUpDate: data.followUpDate
        ? toUtcDateOnlyISOString(data.followUpDate)
        : undefined,
    };

    if (initialData) {
      console.log('Edit lead payload:', payload);
    } else {
      console.log('Add lead payload:', payload);
    }
    // after submit, close sheet and reset form
    closeSheet();
    handleReset();
  };

  // if initialData changes (editing) or sheet opens, reset the form accordingly
  useEffect(() => {
    if (isOpen) {
      form.reset(initialData || {});
    }
  }, [initialData, isOpen, form]);

  return (
    <FormProvider {...form}>
      <KSheet
        className="w-[582px]"
        title={initialData ? 'Edit Lead' : 'Add Lead'}
        isOpen={isOpen}
        onClose={closeSheet}
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
              <Button type="submit" form="lead-form">
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
            />

            {/* Assigned To */}
            <KFormField
              control={form.control}
              name="assignedTo"
              fieldType={KFormFieldType.SELECT}
              label="Assigned To"
              placeholder="Select staff member"
              options={[
                { label: 'John Doe', value: 'john_doe' },
                { label: 'Jane Smith', value: 'jane_smith' },
                { label: 'Mike Johnson', value: 'mike_johnson' },
              ]}
            />
          </div>

          {/* Source Radio Buttons */}
          <FormControl>
            <RadioGroup
              value={form.watch('source')}
              onValueChange={(value) =>
                form.setValue('source', value as 'walk_in' | 'online' | 'ads')
              }
              className="flex items-center gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="walk_in" id="walk_in" />
                <label htmlFor="walk_in" className="text-white cursor-pointer">
                  Walk In
                </label>
                <KBadgeWalkIn />
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="online" id="online" />
                <label htmlFor="online" className="text-white cursor-pointer">
                  Online
                </label>
                <KBadgeOnline />
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="ads" id="ads" />
                <label htmlFor="ads" className="text-white cursor-pointer">
                  Ads
                </label>
                <KBadgeAds />
              </div>
            </RadioGroup>
          </FormControl>

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
