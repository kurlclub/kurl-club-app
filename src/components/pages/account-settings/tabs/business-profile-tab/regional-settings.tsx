import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Globe } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  SettingsDirtyActions,
  SettingsSection,
} from '@/components/pages/account-settings/components';
import {
  KFormField,
  KFormFieldType,
} from '@/components/shared/form/k-formfield';
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
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <SettingsSection
          icon={Globe}
          title="Currency & Regional Settings"
          description="Configure currency, region, and country code preferences"
          headerAction={
            isDirty ? (
              <SettingsDirtyActions
                onDiscard={() => form.reset()}
                onSave={form.handleSubmit(onSubmit)}
                isSaving={isSaving}
                isBusy={isSaving || isPrefilling || !gymId}
              />
            ) : undefined
          }
        >
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
        </SettingsSection>
      </form>
    </FormProvider>
  );
}
