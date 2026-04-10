import type {
  SubscriptionPlanEntitlement,
  SubscriptionPlanStatus,
} from '@/types/subscription';

export type SubscriptionRuntimeStatus = SubscriptionPlanStatus | 'none';

export const getSubscriptionStatusState = ({
  subscriptionPlan,
}: {
  subscriptionPlan: SubscriptionPlanEntitlement | null;
}): {
  daysRemaining: number | null;
  isExpired: boolean;
  isExpiring: boolean;
  status: SubscriptionRuntimeStatus;
} => {
  if (!subscriptionPlan) {
    return {
      daysRemaining: null,
      isExpired: false,
      isExpiring: false,
      status: 'none',
    };
  }

  const isActive = subscriptionPlan.isActive ?? false;
  const days = subscriptionPlan.daysRemaining ?? 0;

  // Simple logic: if isActive is true, subscription is active
  const status: SubscriptionRuntimeStatus = isActive ? 'active' : 'expired';
  const isExpiring = isActive && days <= 7 && days > 0;

  return {
    daysRemaining: isActive ? days : null,
    isExpired: !isActive,
    isExpiring,
    status,
  };
};
