import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Globe } from 'lucide-react';
import { toast } from 'sonner';
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
import {
  COUNTRY_CODES,
  CURRENCIES,
  REGIONS,
} from '@/lib/constants/regional-options';
import { getGymCurrencyRegion, updateGymCurrencyRegion } from '@/services/gym';

const regionalSettingsSchema = z.object({
  currency: z.string().min(1, 'Currency is required'),
  region: z.string().min(1, 'Region is required'),
  countryCode: z.string().min(1, 'Country code is required'),
});

type RegionalSettingsForm = z.infer<typeof regionalSettingsSchema>;

interface RegionalSettingsProps {
  gymId?: number;
}

export default function RegionalSettings({ gymId }: RegionalSettingsProps) {
  const [isPrefilling, setIsPrefilling] = useState(false);

  const form = useForm<RegionalSettingsForm>({
    resolver: zodResolver(regionalSettingsSchema),
    defaultValues: {
      currency: 'INR',
      region: 'IND',
      countryCode: '+91',
    },
  });

  const isSaving = form.formState.isSubmitting;

  useEffect(() => {
    if (!gymId) {
      form.reset({
        currency: 'INR',
        region: 'IND',
        countryCode: '+91',
      });
      return;
    }

    let isMounted = true;

    const loadRegionalSettings = async () => {
      setIsPrefilling(true);
      try {
        const data = await getGymCurrencyRegion(gymId);
        if (!isMounted) return;

        form.reset({
          currency: data.currency,
          region: data.region,
          countryCode: data.countryCode,
        });
      } catch (error) {
        if (!isMounted) return;
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load currency and regional settings'
        );
      } finally {
        if (isMounted) setIsPrefilling(false);
      }
    };

    loadRegionalSettings();

    return () => {
      isMounted = false;
    };
  }, [gymId, form]);

  const onSubmit = async (data: RegionalSettingsForm) => {
    if (!gymId) {
      toast.error('No gym selected');
      return;
    }

    try {
      const result = await updateGymCurrencyRegion(gymId, data);
      if (result.data) {
        form.reset({
          currency: result.data.currency,
          region: result.data.region,
          countryCode: result.data.countryCode,
        });
      }
      toast.success(result.success);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to update currency and regional settings'
      );
    }
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
                disabled={isSaving || isPrefilling}
              >
                Discard
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={form.handleSubmit(onSubmit)}
                disabled={isSaving || isPrefilling || !gymId}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
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
                name="region"
                label="Region"
                options={REGIONS}
                className="bg-gray-50 dark:bg-primary-blue-400"
              />
              <KFormField
                fieldType={KFormFieldType.SELECT}
                control={form.control}
                name="countryCode"
                label="Country Code"
                options={COUNTRY_CODES}
                className="bg-gray-50 dark:bg-primary-blue-400"
              />
            </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
