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
import { safeFormatDate, safeParseDate } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import {
  DEFAULT_SUBSCRIPTION_FEATURES,
  DEFAULT_USAGE_LIMITS,
  SubscriptionFeatureKey,
  SubscriptionFeatures,
  UsageLimits,
  UserSubscription,
} from '@/types/subscription';

type UpgradeModalState = {
  title: string;
  message: string;
};

type SubscriptionStatus = 'active' | 'expiring' | 'expired' | 'none';

type SubscriptionContextValue = {
  subscription: UserSubscription | null;
  features: SubscriptionFeatures;
  usageLimits: UsageLimits;
  status: SubscriptionStatus;
  daysRemaining: number | null;
  isExpired: boolean;
  isExpiring: boolean;
  hasFeatureAccess: (feature: SubscriptionFeatureKey) => boolean;
  requireFeatureAccess: (
    feature: SubscriptionFeatureKey,
    context?: { title?: string; message?: string }
  ) => boolean;
  isLimitExceeded: (
    limitKey: keyof UsageLimits,
    currentCount: number
  ) => boolean;
  requireLimitAccess: (
    limitKey: keyof UsageLimits,
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

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const getDaysRemaining = (endDate: Date | undefined, now: Date) => {
  if (!endDate) return null;
  const diff = endDate.getTime() - now.getTime();
  return Math.ceil(diff / MS_PER_DAY);
};

export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const subscription =
    (user?.subscription as UserSubscription | undefined) || null;

  const features = useMemo(
    () => ({
      ...DEFAULT_SUBSCRIPTION_FEATURES,
      ...(subscription?.features || {}),
    }),
    [subscription?.features]
  );
  const usageLimits = useMemo(
    () => ({
      ...DEFAULT_USAGE_LIMITS,
      ...(subscription?.usageLimits || {}),
    }),
    [subscription?.usageLimits]
  );
  const endDate = safeParseDate(subscription?.endDate);
  const now = new Date();
  const daysRemaining = getDaysRemaining(endDate, now);
  const endDateLabel = safeFormatDate(subscription?.endDate, 'en-GB', 'N/A');

  const isExpired =
    !!subscription &&
    (subscription.plan?.status === 'expired' ||
      subscription.plan?.status === 'cancelled' ||
      (endDate ? endDate.getTime() < now.getTime() : false));

  const isExpiring =
    !!subscription &&
    !isExpired &&
    typeof daysRemaining === 'number' &&
    daysRemaining <= 7 &&
    daysRemaining >= 0;

  const status: SubscriptionStatus = subscription
    ? isExpired
      ? 'expired'
      : isExpiring
        ? 'expiring'
        : 'active'
    : 'none';

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
    (feature: SubscriptionFeatureKey) => {
      const value = features[feature];
      if (typeof value === 'number') {
        return value > 0;
      }
      return value === true;
    },
    [features]
  );

  const requireFeatureAccess = useCallback(
    (
      feature: SubscriptionFeatureKey,
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

  const isLimitExceeded = useCallback(
    (limitKey: keyof UsageLimits, currentCount: number) => {
      const limit = usageLimits[limitKey];
      if (!Number.isFinite(limit) || limit <= 0) return false;
      return currentCount >= limit;
    },
    [usageLimits]
  );

  const requireLimitAccess = useCallback(
    (
      limitKey: keyof UsageLimits,
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
    if (isLoading || !isExpiring || !subscription?.subscriptionId) return true;
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
    subscription?.subscriptionId,
  ]);

  const expiringModalOpen =
    !isLoading &&
    isExpiring &&
    !!subscription?.subscriptionId &&
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
      features,
      usageLimits,
      status,
      daysRemaining,
      isExpired,
      isExpiring,
      hasFeatureAccess,
      requireFeatureAccess,
      isLimitExceeded,
      requireLimitAccess,
      openUpgradeModal,
      closeUpgradeModal,
      endDateLabel,
    }),
    [
      subscription,
      features,
      usageLimits,
      status,
      daysRemaining,
      isExpired,
      isExpiring,
      hasFeatureAccess,
      requireFeatureAccess,
      isLimitExceeded,
      requireLimitAccess,
      openUpgradeModal,
      closeUpgradeModal,
      endDateLabel,
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
        planName={subscription?.plan?.name}
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
