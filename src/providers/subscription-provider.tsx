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
  mergeCurrentSubscription,
} from '@/lib/subscription/subscription-state';
import { safeFormatDate } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import type { PermissionModuleKey } from '@/types/access';
import type {
  CurrentSubscription,
  SubscriptionAccessKey,
  SubscriptionLifecycle,
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
  subscription: CurrentSubscription | null;
  subscriptionPlan: SubscriptionPlanEntitlement | null;
  subscriptionLifecycle: SubscriptionLifecycle | null;
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
  const { user, entitlements, subscriptionLifecycle, isLoading } = useAuth();
  const subscriptionPlan = entitlements?.subscriptionPlan ?? null;
  const subscription = useMemo(
    () => mergeCurrentSubscription({ subscriptionPlan, subscriptionLifecycle }),
    [subscriptionLifecycle, subscriptionPlan]
  );

  const usageLimits = useMemo(
    () => subscriptionPlan?.limits ?? DEFAULT_SUBSCRIPTION_LIMITS,
    [subscriptionPlan]
  );
  const enabledCapabilities = useMemo(
    () => getEnabledSubscriptionCapabilities(subscriptionPlan),
    [subscriptionPlan]
  );
  const { daysRemaining, isExpired, isExpiring, status } = useMemo(
    () =>
      getSubscriptionStatusState({
        subscriptionLifecycle,
      }),
    [subscriptionLifecycle]
  );
  const endDateLabel = safeFormatDate(
    subscriptionLifecycle?.endDate,
    'en-GB',
    'N/A'
  );

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
    (feature: SubscriptionAccessKey) =>
      hasSubscriptionAccess(subscriptionPlan, feature),
    [subscriptionPlan]
  );

  const requireFeatureAccess = useCallback(
    (
      feature: SubscriptionAccessKey,
      context?: { title?: string; message?: string }
    ) => {
      if (hasFeatureAccess(feature)) return true;

      openUpgradeModal({
        title: context?.title || 'Upgrade required',
        message:
          context?.message ||
          'Your current plan does not include this feature.',
      });
      return false;
    },
    [hasFeatureAccess, openUpgradeModal]
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
      isSubscriptionLimitExceeded(subscriptionPlan, limitKey, currentCount),
    [subscriptionPlan]
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
    if (isLoading || !isExpiring || !subscriptionLifecycle?.subscriptionId) {
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
    subscriptionLifecycle?.subscriptionId,
  ]);

  const expiringModalOpen =
    !isLoading &&
    isExpiring &&
    !!subscriptionLifecycle?.subscriptionId &&
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
      subscriptionPlan,
      subscriptionLifecycle,
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
      subscriptionLifecycle,
      subscriptionPlan,
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
