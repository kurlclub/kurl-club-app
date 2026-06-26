'use client';

import { useRouter } from 'next/navigation';

import { Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useMemberActivitySettings } from '@/hooks/use-member-activity';

interface InactiveDaysButtonProps {
  gymId?: number | string;
}

/**
 * Toolbar status button on the members list. Surfaces the gym's configured
 * "inactive after" threshold (or a "Not configured" state when it's 0 / null /
 * undefined) and links to the Operations settings to change it.
 */
export const InactiveDaysButton = ({ gymId }: InactiveDaysButtonProps) => {
  const router = useRouter();
  const { data, isLoading } = useMemberActivitySettings(gymId);

  const days = data?.inactiveAfterDays;
  const isConfigured = typeof days === 'number' && days > 0;

  return (
    <Button
      variant="outline"
      className="h-10 gap-2"
      onClick={() => router.push('/account-settings?tab=profile_gyms')}
      aria-label={
        isConfigured
          ? `Members are marked inactive after ${days} days. Open settings to change.`
          : 'Inactive members threshold not configured. Open settings to set it.'
      }
      title={
        isConfigured
          ? `Members are marked inactive after ${days} days`
          : 'Inactive days not configured'
      }
    >
      <Settings className="h-4 w-4 text-primary-green-500" />
      {isLoading ? (
        <span className="text-secondary-blue-200">Inactive days…</span>
      ) : isConfigured ? (
        <span className="text-secondary-blue-100">
          Inactive after{' '}
          <span className="font-semibold text-white tabular-nums">{days}d</span>
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-secondary-yellow-500">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-secondary-yellow-500" />
          Inactive days · Not configured
        </span>
      )}
    </Button>
  );
};
