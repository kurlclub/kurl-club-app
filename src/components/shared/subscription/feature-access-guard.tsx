'use client';

import React from 'react';

import { FeatureLockOverlay } from '@/components/shared/subscription/feature-lock-overlay';
import { useSubscriptionAccess } from '@/hooks/use-subscription-access';
import type { SubscriptionAccessKey } from '@/types/subscription';

type FeatureAccessGuardProps = {
  feature: SubscriptionAccessKey;
  title?: string;
  message?: string;
  mode?: 'block' | 'overlay';
  children: React.ReactNode;
};

export function FeatureAccessGuard({
  feature,
  title,
  message,
  mode = 'block',
  children,
}: FeatureAccessGuardProps) {
  const { hasFeatureAccess, openUpgradeModal } = useSubscriptionAccess();
  const canAccess = hasFeatureAccess(feature);

  if (canAccess) return <>{children}</>;

  if (mode === 'overlay') {
    return (
      <div className="relative">
        <div className="pointer-events-none select-none blur-sm saturate-[0.8] opacity-45">
          {children}
        </div>
        <FeatureLockOverlay
          title={title || 'Feature locked'}
          message={message || 'Upgrade your subscription to unlock this.'}
          onUpgrade={() =>
            openUpgradeModal({
              title: title || 'Upgrade required',
              message: message || 'Upgrade your subscription to unlock this.',
            })
          }
        />
      </div>
    );
  }

  return (
    <FeatureLockOverlay
      title={title || 'Feature locked'}
      message={message || 'Upgrade your subscription to unlock this.'}
      fullScreen
      onUpgrade={() =>
        openUpgradeModal({
          title: title || 'Upgrade required',
          message: message || 'Upgrade your subscription to unlock this.',
        })
      }
    />
  );
}
