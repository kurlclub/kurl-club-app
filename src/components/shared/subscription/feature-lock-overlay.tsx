'use client';

import Link from 'next/link';

import { Crown } from 'lucide-react';

import { Button } from '@/components/ui/button';

type FeatureLockOverlayProps = {
  title: string;
  message: string;
  ctaLabel?: string;
  onUpgrade?: () => void;
  secondaryLabel?: string;
  onDismiss?: () => void;
  fullScreen?: boolean;
};

export function FeatureLockOverlay({
  title,
  message,
  ctaLabel = 'See plans',
  onUpgrade,
  secondaryLabel = 'Maybe later',
  onDismiss,
  fullScreen = false,
}: FeatureLockOverlayProps) {
  const containerClass = fullScreen
    ? 'fixed inset-0 z-50'
    : 'absolute inset-0 z-20';

  return (
    <div className={containerClass}>
      <div className="absolute inset-0 backdrop-blur-sm bg-secondary-blue-700/70" />
      <div className="relative h-full w-full flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-secondary-blue-400 bg-secondary-blue-500 text-white p-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-primary-green-500/15 border border-primary-green-500/30 flex items-center justify-center">
              <Crown className="h-5 w-5 text-primary-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-sm text-primary-blue-100 mt-1">{message}</p>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2">
            {onUpgrade ? (
              <Button className="h-11" onClick={onUpgrade}>
                {ctaLabel}
              </Button>
            ) : (
              <Button asChild className="h-11">
                <Link href="/account-settings?tab=subscription">
                  {ctaLabel}
                </Link>
              </Button>
            )}
            {onDismiss && (
              <Button
                variant="outline"
                className="h-11 border-white/15 bg-transparent hover:bg-white/5"
                onClick={onDismiss}
              >
                {secondaryLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
