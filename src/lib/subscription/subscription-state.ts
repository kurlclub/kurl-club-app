import { safeParseDate } from '@/lib/utils';
import type {
  CurrentSubscription,
  SubscriptionLifecycle,
  SubscriptionPlanEntitlement,
} from '@/types/subscription';

export type SubscriptionRuntimeStatus =
  | 'active'
  | 'expiring'
  | 'expired'
  | 'none';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const getSubscriptionDaysRemaining = (
  endDate: Date | string | null | undefined,
  now: Date = new Date()
) => {
  const parsedEndDate =
    endDate instanceof Date ? endDate : safeParseDate(endDate ?? undefined);

  if (!parsedEndDate) return null;

  const diff = parsedEndDate.getTime() - now.getTime();
  return Math.ceil(diff / MS_PER_DAY);
};

export const mergeCurrentSubscription = ({
  subscriptionPlan,
  subscriptionLifecycle,
}: {
  subscriptionPlan: SubscriptionPlanEntitlement | null;
  subscriptionLifecycle: SubscriptionLifecycle | null;
}): CurrentSubscription | null => {
  if (!subscriptionPlan || !subscriptionLifecycle) return null;

  return {
    ...subscriptionPlan,
    ...subscriptionLifecycle,
  };
};

export const getSubscriptionStatusState = ({
  subscriptionLifecycle,
  now = new Date(),
}: {
  subscriptionLifecycle: SubscriptionLifecycle | null;
  now?: Date;
}) => {
  const endDate = safeParseDate(subscriptionLifecycle?.endDate);
  const daysRemaining = getSubscriptionDaysRemaining(endDate, now);

  const isExpired =
    !!subscriptionLifecycle &&
    (subscriptionLifecycle.status === 'expired' ||
      subscriptionLifecycle.status === 'cancelled' ||
      (endDate ? endDate.getTime() < now.getTime() : false));

  const isExpiring =
    !!subscriptionLifecycle &&
    !isExpired &&
    typeof daysRemaining === 'number' &&
    daysRemaining <= 7 &&
    daysRemaining >= 0;

  const status: SubscriptionRuntimeStatus = subscriptionLifecycle
    ? isExpired
      ? 'expired'
      : isExpiring
        ? 'expiring'
        : 'active'
    : 'none';

  return {
    daysRemaining,
    isExpired,
    isExpiring,
    status,
  };
};
