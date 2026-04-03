import { describe, expect, it } from 'vitest';

import {
  getSubscriptionStatusState,
  mergeCurrentSubscription,
} from '@/lib/subscription/subscription-state';
import { DEFAULT_SUBSCRIPTION_PLAN_FEATURES } from '@/types/subscription';

describe('subscription state helpers', () => {
  it('merges plan entitlements with lifecycle metadata for the current subscription view', () => {
    const merged = mergeCurrentSubscription({
      subscriptionPlan: {
        id: 3,
        name: 'PERFORMANCE',
        subtitle: 'Growth',
        description: '<p>Growth</p>',
        monthlyPrice: 899,
        sixMonthsPrice: 4499,
        yearlyPrice: 8999,
        badge: 'Popular',
        subscriptionDate: '2026-03-04T17:27:24.233437',
        limits: {
          maxClubs: 3,
          maxMembers: 1000,
          maxTrainers: 20,
          maxStaffs: 20,
          maxMembershipPlans: null,
          maxWorkoutPlans: null,
          maxLeadsPerMonth: null,
        },
        features: DEFAULT_SUBSCRIPTION_PLAN_FEATURES,
      },
      subscriptionLifecycle: {
        subscriptionId: 77,
        billingCycle: 'monthly',
        startDate: '2026-04-01T00:00:00.000Z',
        endDate: '2026-05-01T00:00:00.000Z',
        status: 'active',
      },
    });

    expect(merged).toMatchObject({
      id: 3,
      subscriptionId: 77,
      billingCycle: 'monthly',
      name: 'PERFORMANCE',
    });
  });

  it('marks subscriptions as expiring when the end date is within seven days', () => {
    const state = getSubscriptionStatusState({
      subscriptionLifecycle: {
        subscriptionId: 77,
        billingCycle: 'monthly',
        startDate: '2026-04-01T00:00:00.000Z',
        endDate: '2026-04-07T00:00:00.000Z',
        status: 'active',
      },
      now: new Date('2026-04-03T00:00:00.000Z'),
    });

    expect(state).toEqual({
      daysRemaining: 4,
      isExpired: false,
      isExpiring: true,
      status: 'expiring',
    });
  });

  it('marks past or cancelled subscriptions as expired', () => {
    expect(
      getSubscriptionStatusState({
        subscriptionLifecycle: {
          subscriptionId: 77,
          billingCycle: 'monthly',
          startDate: '2026-03-01T00:00:00.000Z',
          endDate: '2026-04-01T00:00:00.000Z',
          status: 'active',
        },
        now: new Date('2026-04-03T00:00:00.000Z'),
      }).status
    ).toBe('expired');

    expect(
      getSubscriptionStatusState({
        subscriptionLifecycle: {
          subscriptionId: 77,
          billingCycle: 'monthly',
          startDate: '2026-03-01T00:00:00.000Z',
          endDate: '2026-05-01T00:00:00.000Z',
          status: 'cancelled',
        },
        now: new Date('2026-04-03T00:00:00.000Z'),
      }).status
    ).toBe('expired');
  });
});
