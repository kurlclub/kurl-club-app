import { FormProvider, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Globe } from 'lucide-react';
import { z } from 'zod';

import {
  KFormField,
  KFormFieldType,
} from '@/components/shared/form/k-formfield';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const regionalSettingsSchema = z.object({
  currency: z.string().min(1, 'Currency is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  dateFormat: z.string().min(1, 'Date format is required'),
  numberFormat: z.string().min(1, 'Number format is required'),
});

type RegionalSettingsForm = z.infer<typeof regionalSettingsSchema>;

const CURRENCIES = [
  { label: '₹ Indian Rupee (INR)', value: 'INR' },
  { label: '$ US Dollar (USD)', value: 'USD' },
  { label: '€ Euro (EUR)', value: 'EUR' },
  { label: '£ British Pound (GBP)', value: 'GBP' },
  { label: '$ Australian Dollar (AUD)', value: 'AUD' },
  { label: '$ Canadian Dollar (CAD)', value: 'CAD' },
  { label: '¥ Japanese Yen (JPY)', value: 'JPY' },
  { label: 'د.إ UAE Dirham (AED)', value: 'AED' },
];

const TIMEZONES = [
  { label: 'Asia/Kolkata (IST)', value: 'Asia/Kolkata' },
  { label: 'America/New_York (EST)', value: 'America/New_York' },
  { label: 'Europe/London (GMT)', value: 'Europe/London' },
  { label: 'Asia/Dubai (GST)', value: 'Asia/Dubai' },
  { label: 'Australia/Sydney (AEST)', value: 'Australia/Sydney' },
];

const DATE_FORMATS = [
  { label: 'DD/MM/YYYY (31/12/2025)', value: 'DD/MM/YYYY' },
  { label: 'MM/DD/YYYY (12/31/2025)', value: 'MM/DD/YYYY' },
  { label: 'YYYY-MM-DD (2025-12-31)', value: 'YYYY-MM-DD' },
];

const NUMBER_FORMATS = [
  { label: '1,234.56 (Comma separator)', value: 'en-US' },
  { label: '1.234,56 (Dot separator)', value: 'de-DE' },
  { label: '1 234,56 (Space separator)', value: 'fr-FR' },
];

export default function RegionalSettings() {
  const form = useForm<RegionalSettingsForm>({
    resolver: zodResolver(regionalSettingsSchema),
    defaultValues: {
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      dateFormat: 'DD/MM/YYYY',
      numberFormat: 'en-US',
    },
  });

  const onSubmit = async (data: RegionalSettingsForm) => {
    console.log('Regional settings:', data);
    // TODO: Implement API call
  };

  const isDirty = form.formState.isDirty;

  return (
    <Card className="bg-white dark:bg-secondary-blue-500 border-gray-200 dark:border-primary-blue-400">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Globe className="h-5 w-5 text-primary-green-600 dark:text-primary-green-500 mt-1" />
            <div>
              <CardTitle className="text-gray-900 dark:text-white">
                Currency & Regional Settings
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-secondary-blue-200">
                Configure currency, timezone, and format preferences
              </CardDescription>
            </div>
          </div>
          {isDirty && (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => form.reset()}
              >
                Discard
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={form.handleSubmit(onSubmit)}
              >
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <FormProvider {...form}>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <KFormField
                fieldType={KFormFieldType.SELECT}
                control={form.control}
                name="currency"
                label="Currency"
                options={CURRENCIES}
                className="bg-gray-50 dark:bg-primary-blue-400"
              />
              <KFormField
                fieldType={KFormFieldType.SELECT}
                control={form.control}
                name="timezone"
                label="Timezone"
                options={TIMEZONES}
                className="bg-gray-50 dark:bg-primary-blue-400"
              />
              <KFormField
                fieldType={KFormFieldType.SELECT}
                control={form.control}
                name="dateFormat"
                label="Date Format"
                options={DATE_FORMATS}
                className="bg-gray-50 dark:bg-primary-blue-400"
              />
              <KFormField
                fieldType={KFormFieldType.SELECT}
                control={form.control}
                name="numberFormat"
                label="Number Format"
                options={NUMBER_FORMATS}
                className="bg-gray-50 dark:bg-primary-blue-400"
              />
            </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
