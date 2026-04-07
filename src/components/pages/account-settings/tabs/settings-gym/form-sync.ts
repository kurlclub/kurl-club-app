'use client';

import { useEffect, useState } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';

import { toast } from 'sonner';

interface LoadSettingsFormValuesForGymInput<TValues, TSettings> {
  gymId: number | null;
  getDefaultValues: () => TValues;
  fetchSettings: (gymId: number) => Promise<TSettings | null>;
  mapSettingsToValues: (settings?: TSettings | null) => TValues;
}

export const loadSettingsFormValuesForGym = async <TValues, TSettings>({
  gymId,
  getDefaultValues,
  fetchSettings,
  mapSettingsToValues,
}: LoadSettingsFormValuesForGymInput<TValues, TSettings>): Promise<TValues> => {
  const defaultValues = getDefaultValues();

  if (!gymId) {
    return defaultValues;
  }

  const settings = await fetchSettings(gymId);
  return mapSettingsToValues(settings);
};

interface UseSyncSettingsFormWithGymInput<
  TValues extends FieldValues,
  TSettings,
> extends LoadSettingsFormValuesForGymInput<TValues, TSettings> {
  errorMessage: string;
  form: UseFormReturn<TValues>;
  onValuesSynced?: (values: TValues) => void;
}

export const useSyncSettingsFormWithGym = <
  TValues extends FieldValues,
  TSettings,
>({
  gymId,
  getDefaultValues,
  fetchSettings,
  mapSettingsToValues,
  errorMessage,
  form,
  onValuesSynced,
}: UseSyncSettingsFormWithGymInput<TValues, TSettings>) => {
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const syncForm = async () => {
      const defaultValues = getDefaultValues();
      form.reset(defaultValues);
      onValuesSynced?.(defaultValues);

      if (!gymId) {
        setIsSyncing(false);
        return;
      }

      setIsSyncing(true);

      try {
        const nextValues = await loadSettingsFormValuesForGym({
          gymId,
          getDefaultValues,
          fetchSettings,
          mapSettingsToValues,
        });

        if (!isMounted) return;

        form.reset(nextValues);
        onValuesSynced?.(nextValues);
      } catch (error) {
        if (!isMounted) return;
        console.error(errorMessage, error);
        toast.error(errorMessage);
      } finally {
        if (isMounted) {
          setIsSyncing(false);
        }
      }
    };

    void syncForm();

    return () => {
      isMounted = false;
    };
  }, [
    errorMessage,
    fetchSettings,
    form,
    getDefaultValues,
    gymId,
    mapSettingsToValues,
    onValuesSynced,
  ]);

  return isSyncing;
};
