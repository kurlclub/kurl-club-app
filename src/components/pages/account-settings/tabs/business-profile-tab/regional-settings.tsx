'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { Globe } from 'lucide-react';
import { toast } from 'sonner';

import {
  SettingsDirtyActions,
  SettingsSection,
} from '@/components/pages/account-settings/components';
import {
  COUNTRIES,
  type Country,
  resolveDefaultCountry,
} from '@/lib/constants/countries';
import { getGymCurrencyRegion, updateGymCurrencyRegion } from '@/services/gym';

import { CountrySelect } from './country-select';

// Lazy-loaded (client-only) so the world-atlas dataset never reaches other routes.
const RegionMap = dynamic(() => import('./region-map'), { ssr: false });

interface RegionalSettingsProps {
  gymId?: number;
}

const FALLBACK_COUNTRY =
  COUNTRIES.find((country) => country.cca2 === 'IN') ?? COUNTRIES[0];

export default function RegionalSettings({ gymId }: RegionalSettingsProps) {
  const queryClient = useQueryClient();

  const [isPrefilling, setIsPrefilling] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // `saved` is the persisted baseline; `selected` is the in-progress choice.
  const [saved, setSaved] = useState<Country>(FALLBACK_COUNTRY);
  const [selected, setSelected] = useState<Country>(FALLBACK_COUNTRY);

  useEffect(() => {
    if (!gymId) {
      setSaved(FALLBACK_COUNTRY);
      setSelected(FALLBACK_COUNTRY);
      return;
    }

    let isMounted = true;

    const loadRegionalSettings = async () => {
      setIsPrefilling(true);
      try {
        const data = await getGymCurrencyRegion(gymId);
        if (!isMounted) return;

        const country =
          resolveDefaultCountry({
            region: data.region,
            currency: data.currency,
          }) ?? FALLBACK_COUNTRY;

        setSaved(country);
        setSelected(country);
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
  }, [gymId]);

  const isDirty = selected.cca2 !== saved.cca2;

  const handleSave = async () => {
    if (!gymId) {
      toast.error('No gym selected');
      return;
    }

    try {
      setIsSaving(true);
      const result = await updateGymCurrencyRegion(gymId, {
        currency: selected.currency,
        region: selected.regionCode,
        countryCode: selected.callingCode,
      });

      // Refresh the app-wide currency so every amount reflects the new symbol.
      queryClient.invalidateQueries({ queryKey: ['gymCurrency', gymId] });
      setSaved(selected);
      toast.success(result.success);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to update currency and regional settings'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SettingsSection
      icon={Globe}
      title="Currency & Regional Settings"
      description="Pick your country to set the currency, region, and dial code used across the app"
      className="min-h-[280px]"
      background={<RegionMap selectedCcn3={selected.ccn3} />}
      headerAction={
        isDirty ? (
          <SettingsDirtyActions
            onDiscard={() => setSelected(saved)}
            onSave={handleSave}
            isSaving={isSaving}
            isBusy={isSaving || isPrefilling || !gymId}
          />
        ) : undefined
      }
    >
      <div className="space-y-4 xl:max-w-lg">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-secondary-blue-100">
            Country
          </label>
          <CountrySelect
            selected={selected}
            onSelect={setSelected}
            disabled={isSaving || isPrefilling || !gymId}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md border border-secondary-blue-400 bg-gray-50 dark:bg-secondary-blue-500 px-3 py-2.5">
            <p className="text-xs text-secondary-blue-200">Currency</p>
            <p className="mt-0.5 text-sm font-medium text-white">
              {selected.currency} ({selected.symbol})
            </p>
          </div>
          <div className="rounded-md border border-secondary-blue-400 bg-gray-50 dark:bg-secondary-blue-500 px-3 py-2.5">
            <p className="text-xs text-secondary-blue-200">Country code</p>
            <p className="mt-0.5 text-sm font-medium text-white">
              {selected.cca2} ({selected.callingCode})
            </p>
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
