'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { FeatureLockOverlay } from '@/components/shared/subscription';
import { SubscriptionExpiredScreen } from '@/components/shared/subscription';
import { useSubscriptionAccess } from '@/hooks/use-subscription-access';
import {
  EXPIRED_ALLOWED_PREFIXES,
  ROUTE_FEATURE_GATES,
} from '@/lib/subscription/route-map';

export function SubscriptionRouteGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const {
    hasFeatureAccess,
    isExpired,
    openUpgradeModal,
    subscription,
    endDateLabel,
  } = useSubscriptionAccess();

  if (isExpired) {
    const isAllowed = EXPIRED_ALLOWED_PREFIXES.some((prefix) =>
      pathname.startsWith(prefix)
    );
    if (!isAllowed) {
      return (
        <SubscriptionExpiredScreen
          planName={subscription?.plan?.name}
          endDateLabel={endDateLabel}
        />
      );
    }
  }

  const gate = ROUTE_FEATURE_GATES.find((entry) =>
    pathname.startsWith(entry.prefix)
  );

  if (gate && !hasFeatureAccess(gate.feature)) {
    if (gate.mode === 'overlay') {
      return (
        <div className="relative">
          <div className="pointer-events-none select-none blur-sm saturate-[0.8] opacity-45">
            {children}
          </div>
          <FeatureLockOverlay
            title={gate.title}
            message={gate.message}
            onUpgrade={() =>
              openUpgradeModal({
                title: gate.title,
                message: gate.message,
              })
            }
          />
        </div>
      );
    }

    return (
      <FeatureLockOverlay
        title={gate.title}
        message={gate.message}
        fullScreen
        onUpgrade={() =>
          openUpgradeModal({
            title: gate.title,
            message: gate.message,
          })
        }
      />
    );
  }

  return <>{children}</>;
}
