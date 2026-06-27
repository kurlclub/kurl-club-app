'use client';

import Image from 'next/image';

import { cn } from '@/lib/utils';

export type DeviceProvider = {
  label: string;
  value: string;
  logo: string;
  // Per-brand display height so wordmarks of different aspect ratios / padding
  // read as the same optical size in the picker.
  logoClassName: string;
};

// The biometric device integrations we currently support.
export const DEVICE_PROVIDERS: DeviceProvider[] = [
  {
    label: 'Hikvision',
    value: 'Hikvision',
    logo: '/assets/svg/hikvision.svg',
    logoClassName: 'h-5',
  },
  {
    label: 'eSSL',
    value: 'eSSL',
    logo: '/assets/png/essl.png',
    logoClassName: 'h-9',
  },
];

export const getProviderLogo = (provider?: string): string | undefined => {
  if (!provider) return undefined;
  const normalized = provider.trim().toLowerCase();
  return DEVICE_PROVIDERS.find((p) => p.value.toLowerCase() === normalized)
    ?.logo;
};

export const ProviderLogo = ({
  provider,
  className,
}: {
  provider?: string;
  className?: string;
}) => {
  const logo = getProviderLogo(provider);
  if (!logo) return null;

  return (
    <Image
      src={logo}
      alt={`${provider} logo`}
      width={64}
      height={16}
      className={cn('h-4 w-auto shrink-0 object-contain', className)}
    />
  );
};

const GRID_COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
};

/**
 * Logo-card picker used when we support a small number of providers (<= 3).
 * For more, the form falls back to the searchable KSelect dropdown.
 */
export const DeviceProviderRadioGroup = ({
  value,
  onChange,
  label,
  mandatory = false,
}: {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  mandatory?: boolean;
}) => (
  <div>
    {label && (
      <p className="mb-2 text-sm text-primary-blue-100">
        {label}
        {mandatory && <span className="ml-px text-alert-red-500">*</span>}
      </p>
    )}
    <div
      role="radiogroup"
      aria-label={label ?? 'Device provider'}
      className={cn(
        'grid gap-3',
        GRID_COLS[DEVICE_PROVIDERS.length] ?? 'grid-cols-3'
      )}
    >
      {DEVICE_PROVIDERS.map((provider) => {
        const selected = value?.toLowerCase() === provider.value.toLowerCase();

        return (
          <button
            key={provider.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={provider.label}
            onClick={() => onChange(provider.value)}
            className={cn(
              'flex h-20 items-center justify-center rounded-xl border bg-secondary-blue-500 p-3 transition-colors focus:outline-none focus-visible:border-primary-green-500',
              selected
                ? 'border-primary-green-500'
                : 'border-transparent hover:border-secondary-blue-400'
            )}
          >
            <span className="flex h-full w-full items-center justify-center rounded-lg bg-white px-5">
              <ProviderLogo
                provider={provider.value}
                className={provider.logoClassName}
              />
            </span>
          </button>
        );
      })}
    </div>
  </div>
);
