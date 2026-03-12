'use client';

import Link from 'next/link';

import { AlertTriangle, Crown } from 'lucide-react';

import { Button } from '@/components/ui/button';

type SubscriptionExpiredScreenProps = {
  planName?: string;
  endDateLabel?: string;
};

export function SubscriptionExpiredScreen({
  planName,
  endDateLabel,
}: SubscriptionExpiredScreenProps) {
  return (
    <div className="fixed inset-0 z-50 bg-secondary-blue-700/80 backdrop-blur-md flex items-center justify-center p-6">
      <div className="max-w-lg w-full rounded-2xl border border-secondary-blue-400 bg-secondary-blue-500 text-white p-8 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-alert-red-500/20 border border-alert-red-500/40 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-alert-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Subscription expired</h2>
            <p className="text-sm text-primary-blue-100 mt-1">
              Your {planName || 'current'} plan ended on{' '}
              {endDateLabel || 'your billing date'}.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-secondary-blue-400 bg-primary-blue-400/40 p-4">
          <div className="flex items-center gap-2 text-sm text-primary-blue-100">
            <Crown className="h-4 w-4 text-primary-green-500" />
            <span>Upgrade to restore full access to the app.</span>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button asChild className="h-11">
            <Link href="/account-settings?tab=subscription">See plans</Link>
          </Button>
          <Button
            variant="outline"
            className="h-11 border-white/15 bg-transparent hover:bg-white/5"
            asChild
          >
            <Link href="/account-settings">Account settings</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
