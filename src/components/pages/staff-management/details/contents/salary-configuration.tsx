'use client';

import { useEffect, useMemo, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  KFormField,
  KFormFieldType,
} from '@/components/shared/form/k-formfield';
import { InfoBanner } from '@/components/shared/info-banner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useUpsertStaffSalary } from '@/hooks/use-payroll';
import { useStaffSalaryDetails } from '@/services/staff';
import { StaffType } from '@/types/staff';
import { formatCurrency } from '@/utils/format-currency';

interface SalaryConfigurationProps {
  staffId: string;
  staffRole: StaffType;
}

const salarySchema = z.object({
  amount: z.string().min(1, 'Salary amount is required'),
  salaryDate: z.date({ message: 'Salary date is required' }),
  isHourly: z.boolean(),
  payDay: z.string().optional(),
});

type SalaryFormData = z.infer<typeof salarySchema>;

function SalaryConfiguration({ staffId, staffRole }: SalaryConfigurationProps) {
  const {
    data: salaryDetails,
    isLoading,
    isError,
  } = useStaffSalaryDetails(staffId, staffRole);
  const upsertSalaryMutation = useUpsertStaffSalary();
  const isSaving = upsertSalaryMutation.isPending;
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  const form = useForm<SalaryFormData>({
    resolver: zodResolver(salarySchema),
    defaultValues: {
      amount: '',
      salaryDate: undefined,
      isHourly: false,
      payDay: '',
    },
    mode: 'onSubmit',
  });

  const isHourly = useWatch({ control: form.control, name: 'isHourly' });
  const amount = useWatch({ control: form.control, name: 'amount' });

  // Initialize form data
  useEffect(() => {
    if (!salaryDetails) return;

    const formData: SalaryFormData = {
      amount: String(salaryDetails.salary ?? ''),
      salaryDate: salaryDetails.salaryDate
        ? new Date(salaryDetails.salaryDate)
        : undefined!,
      isHourly: false,
      payDay: '',
    };

    form.reset(formData, { keepDefaultValues: false });

    const timer = setTimeout(() => setInitialDataLoaded(true), 100);
    return () => clearTimeout(timer);
  }, [salaryDetails, form]);

  const isDirty = useMemo(() => {
    const { isDirty, dirtyFields } = form.formState;
    return (
      isDirty &&
      (dirtyFields.amount ||
        dirtyFields.salaryDate ||
        dirtyFields.isHourly ||
        dirtyFields.payDay)
    );
  }, [form.formState]);

  const handleDiscard = () => {
    if (!salaryDetails) return;

    const formData: SalaryFormData = {
      amount: String(salaryDetails.salary ?? ''),
      salaryDate: salaryDetails.salaryDate
        ? new Date(salaryDetails.salaryDate)
        : undefined!,
      isHourly: false,
      payDay: '',
    };
    form.reset(formData);
  };

  const handleSubmit = async (data: SalaryFormData) => {
    const salaryValue = Number(data.amount);
    if (!data.amount || !Number.isFinite(salaryValue) || salaryValue <= 0) {
      toast.error('Please enter a valid salary amount.');
      return;
    }

    if (!data.salaryDate) {
      toast.error('Please select a salary date.');
      return;
    }

    if (!staffId) {
      toast.error('Staff not found.');
      return;
    }

    try {
      await upsertSalaryMutation.mutateAsync({
        employeeId: Number(staffId),
        employeeType: staffRole,
        salary: salaryValue,
        salaryDate: data.salaryDate,
      });
      form.reset(data);
      toast.success('Salary configuration saved.');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to save salary configuration.'
      );
    }
  };

  const numericSalary = Number(amount);
  const hasValidSalary = Number.isFinite(numericSalary) && numericSalary > 0;

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-secondary-blue-500 border-gray-200 dark:border-secondary-blue-400">
        <CardContent className="p-6">
          <p className="text-gray-600 dark:text-secondary-blue-100">
            Loading salary details...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="bg-white dark:bg-secondary-blue-500 border-gray-200 dark:border-secondary-blue-400">
        <CardContent className="p-6">
          <p className="text-red-500 dark:text-red-300">
            Failed to load salary details.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <FormProvider {...form}>
      <Card className="bg-white dark:bg-secondary-blue-500 border-gray-200 dark:border-secondary-blue-400 py-2">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-gray-900 dark:text-white">
                Salary Configuration
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-secondary-blue-200 text-[15px]">
                Set monthly payout amount and salary disbursement date
              </CardDescription>
            </div>
            {isDirty && initialDataLoaded && (
              <div
                className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200"
                aria-live="polite"
              >
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleDiscard}
                  disabled={isSaving}
                >
                  Discard
                </Button>
                <Button
                  type="button"
                  onClick={form.handleSubmit(handleSubmit)}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Salary Amount */}
          <KFormField
            fieldType={KFormFieldType.INPUT}
            control={form.control}
            name="amount"
            label="Salary amount"
            placeholder="Enter salary amount"
            className="bg-primary-blue-400"
            inputType="number"
            mandetory
          />

          {hasValidSalary && (
            <p className="text-xs text-gray-500 dark:text-secondary-blue-200 -mt-4">
              {formatCurrency(numericSalary)}{' '}
              {isHourly ? 'per hour' : 'per month'}
            </p>
          )}

          {/* Payment Frequency */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Controller
                control={form.control}
                name="isHourly"
                render={({ field }) => (
                  <Checkbox
                    id="isHourly"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label
                htmlFor="isHourly"
                className="text-sm font-medium text-gray-700 dark:text-secondary-blue-100 cursor-pointer"
              >
                Hourly payment
              </Label>
            </div>
            <p className="text-xs text-gray-500 dark:text-secondary-blue-200">
              {isHourly
                ? 'Payment will be calculated based on hours worked'
                : 'Payment will be a fixed monthly amount'}
            </p>
          </div>

          {/* Payment Day (Monthly only) */}
          {!isHourly && (
            <>
              <KFormField
                fieldType={KFormFieldType.INPUT}
                control={form.control}
                name="payDay"
                label="Payment day of month"
                placeholder="e.g., 1, 15, 30"
                className="bg-primary-blue-400"
                inputType="number"
              />
              <InfoBanner
                variant="info"
                icon="ℹ️"
                message="Enter a day between 1 and 31 for monthly salary disbursement"
              />
            </>
          )}

          {/* Salary Date */}
          <KFormField
            fieldType={KFormFieldType.UI_DATE_PICKER}
            control={form.control}
            name="salaryDate"
            label="Salary date"
            placeholder="Select salary date"
            mode="single"
            floating
            mandetory
          />
        </CardContent>
      </Card>
    </FormProvider>
  );
}

export default SalaryConfiguration;
