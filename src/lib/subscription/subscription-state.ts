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
  if (!subscriptionPlan || !subscriptionPlan.status) {
    return {
      daysRemaining: null,
      isExpired: false,
      isExpiring: false,
      status: 'none',
    };
  }

  return {
    daysRemaining:
      subscriptionPlan.status === 'expired'
        ? null
        : subscriptionPlan.daysRemaining,
    isExpired: subscriptionPlan.status === 'expired',
    isExpiring: subscriptionPlan.status === 'expiring',
    status: subscriptionPlan.status,
  };
};
