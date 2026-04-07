'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  SubscriptionExpiringModal,
  UpgradePromptModal,
} from '@/components/shared/subscription';
import {
  getEnabledSubscriptionCapabilities,
  hasPermissionAccess,
  hasSubscriptionAccess,
  isSubscriptionLimitExceeded,
} from '@/lib/subscription/access-policy';
import {
  type SubscriptionRuntimeStatus,
  getSubscriptionStatusState,
} from '@/lib/subscription/subscription-state';
import { safeFormatDate } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import type { PermissionModuleKey } from '@/types/access';
import type {
  SubscriptionAccessKey,
  SubscriptionLimitKey,
  SubscriptionLimits,
  SubscriptionPlanEntitlement,
} from '@/types/subscription';
import { DEFAULT_SUBSCRIPTION_LIMITS } from '@/types/subscription';

type UpgradeModalState = {
  title: string;
  message: string;
};

type SubscriptionContextValue = {
  subscription: SubscriptionPlanEntitlement | null;
  usageLimits: SubscriptionLimits;
  enabledCapabilities: SubscriptionAccessKey[];
  status: SubscriptionRuntimeStatus;
  daysRemaining: number | null;
  isExpired: boolean;
  isExpiring: boolean;
  hasFeatureAccess: (feature: SubscriptionAccessKey) => boolean;
  requireFeatureAccess: (
    feature: SubscriptionAccessKey,
    context?: { title?: string; message?: string }
  ) => boolean;
  hasPermissionAccess: (
    moduleKey: PermissionModuleKey,
    action?: 'canView' | 'canCreate' | 'canEdit' | 'canDelete'
  ) => boolean;
  isLimitExceeded: (
    limitKey: SubscriptionLimitKey,
    currentCount: number
  ) => boolean;
  requireLimitAccess: (
    limitKey: SubscriptionLimitKey,
    currentCount: number,
    context?: { title?: string; message?: string }
  ) => boolean;
  openUpgradeModal: (payload: UpgradeModalState) => void;
  closeUpgradeModal: () => void;
  endDateLabel: string;
};

const SubscriptionContext = createContext<SubscriptionContextValue | null>(
  null
);

export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, entitlements, isLoading } = useAuth();
  const subscription = entitlements?.subscriptionPlan ?? null;

  const usageLimits = useMemo(
    () => subscription?.limits ?? DEFAULT_SUBSCRIPTION_LIMITS,
    [subscription]
  );
  const enabledCapabilities = useMemo(
    () => getEnabledSubscriptionCapabilities(subscription),
    [subscription]
  );
  const { daysRemaining, isExpired, isExpiring, status } = useMemo(
    () =>
      getSubscriptionStatusState({
        subscriptionPlan: subscription,
      }),
    [subscription]
  );
  const endDateLabel = safeFormatDate(subscription?.endDate, 'en-GB', 'N/A');

  const [upgradeModal, setUpgradeModal] = useState<UpgradeModalState | null>(
    null
  );
  const [dismissedExpiringKey, setDismissedExpiringKey] = useState<
    string | null
  >(null);

  const openUpgradeModal = useCallback((payload: UpgradeModalState) => {
    setUpgradeModal(payload);
  }, []);

  const closeUpgradeModal = useCallback(() => {
    setUpgradeModal(null);
  }, []);

  const hasFeatureAccess = useCallback(
    (feature: SubscriptionAccessKey) => {
      if (status === 'expired' || status === 'none') {
        return false;
      }

      return hasSubscriptionAccess(subscription, feature);
    },
    [status, subscription]
  );

  const requireFeatureAccess = useCallback(
    (
      feature: SubscriptionAccessKey,
      context?: { title?: string; message?: string }
    ) => {
      if (hasFeatureAccess(feature)) return true;

      const upgradeMessage =
        status === 'expired'
          ? 'Your subscription has expired. Renew your plan to restore this feature.'
          : status === 'none'
            ? 'Choose a subscription plan to unlock this feature.'
            : context?.message ||
              'Your current plan does not include this feature.';

      openUpgradeModal({
        title:
          context?.title ||
          (status === 'expired' ? 'Subscription expired' : 'Upgrade required'),
        message: upgradeMessage,
      });
      return false;
    },
    [hasFeatureAccess, openUpgradeModal, status]
  );

  const hasPermissionAccessForModule = useCallback(
    (
      moduleKey: PermissionModuleKey,
      action: 'canView' | 'canCreate' | 'canEdit' | 'canDelete' = 'canView'
    ) => hasPermissionAccess(entitlements, moduleKey, action),
    [entitlements]
  );

  const isLimitExceeded = useCallback(
    (limitKey: SubscriptionLimitKey, currentCount: number) =>
      isSubscriptionLimitExceeded(subscription, limitKey, currentCount),
    [subscription]
  );

  const requireLimitAccess = useCallback(
    (
      limitKey: SubscriptionLimitKey,
      currentCount: number,
      context?: { title?: string; message?: string }
    ) => {
      if (!isLimitExceeded(limitKey, currentCount)) return true;

      openUpgradeModal({
        title: context?.title || 'Upgrade required',
        message:
          context?.message ||
          'You have reached your plan limit. Upgrade to add more.',
      });
      return false;
    },
    [isLimitExceeded, openUpgradeModal]
  );

  const expiringStorageKey = useMemo(
    () => `subscription-expiry-warning:${user?.userId ?? 'anon'}`,
    [user?.userId]
  );
  const expiringTodayKey = new Date().toISOString().slice(0, 10);

  const hasShownExpiringToday = useMemo(() => {
    if (isLoading || !isExpiring || !subscription?.id) {
      return true;
    }
    if (typeof window === 'undefined') return true;
    try {
      return localStorage.getItem(expiringStorageKey) === expiringTodayKey;
    } catch {
      return false;
    }
  }, [
    expiringStorageKey,
    expiringTodayKey,
    isExpiring,
    isLoading,
    subscription?.id,
  ]);

  const expiringModalOpen =
    !isLoading &&
    isExpiring &&
    !!subscription?.id &&
    !hasShownExpiringToday &&
    dismissedExpiringKey !== expiringTodayKey;

  useEffect(() => {
    if (!expiringModalOpen) return;
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(expiringStorageKey, expiringTodayKey);
    } catch {
      // ignore storage failures, modal is still shown
    }
  }, [expiringModalOpen, expiringStorageKey, expiringTodayKey]);

  const handleExpiringModalChange = useCallback(
    (open: boolean) => {
      if (open) return;
      setDismissedExpiringKey(expiringTodayKey);
      if (typeof window === 'undefined') return;
      try {
        localStorage.setItem(expiringStorageKey, expiringTodayKey);
      } catch {
        // ignore storage failures
      }
    },
    [expiringStorageKey, expiringTodayKey]
  );

  const contextValue = useMemo<SubscriptionContextValue>(
    () => ({
      subscription,
      usageLimits,
      enabledCapabilities,
      status,
      daysRemaining,
      isExpired,
      isExpiring,
      hasFeatureAccess,
      requireFeatureAccess,
      hasPermissionAccess: hasPermissionAccessForModule,
      isLimitExceeded,
      requireLimitAccess,
      openUpgradeModal,
      closeUpgradeModal,
      endDateLabel,
    }),
    [
      closeUpgradeModal,
      daysRemaining,
      enabledCapabilities,
      endDateLabel,
      hasFeatureAccess,
      hasPermissionAccessForModule,
      isExpired,
      isExpiring,
      isLimitExceeded,
      openUpgradeModal,
      requireFeatureAccess,
      requireLimitAccess,
      status,
      subscription,
      usageLimits,
    ]
  );

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
      <UpgradePromptModal
        open={!!upgradeModal}
        onOpenChange={(open) => {
          if (!open) closeUpgradeModal();
        }}
        title={upgradeModal?.title || 'Upgrade required'}
        message={upgradeModal?.message || 'Upgrade your subscription.'}
        onCancel={closeUpgradeModal}
      />
      <SubscriptionExpiringModal
        open={expiringModalOpen}
        onOpenChange={handleExpiringModalChange}
        planName={subscription?.name}
        endDateLabel={endDateLabel}
        daysRemaining={daysRemaining}
      />
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
};
