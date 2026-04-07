import { describe, expect, it } from 'vitest';

import { getSubscriptionStatusState } from '@/lib/subscription/subscription-state';
import { DEFAULT_SUBSCRIPTION_PLAN_FEATURES } from '@/types/subscription';

describe('subscription state helpers', () => {
  it('reads expiring state directly from backend-owned plan fields', () => {
    const state = getSubscriptionStatusState({
      subscriptionPlan: {
        subscriptionId: 77,
        id: 3,
        name: 'PERFORMANCE',
        subtitle: 'Growth',
        description: '<p>Growth</p>',
        descriptionPlainText: 'Growth',
        iconUrl: null,
        monthlyPrice: 899,
        sixMonthsPrice: 4499,
        yearlyPrice: 8999,
        badge: 'Popular',
        status: 'expiring',
        billingCycle: 'monthly',
        currency: 'INR',
        billingAmount: 899,
        subscriptionDate: '2026-03-04T17:27:24.233437',
        startDate: '2026-04-01T00:00:00.000Z',
        endDate: '2026-05-01T00:00:00.000Z',
        nextBillingDate: '2026-05-01T00:00:00.000Z',
        daysRemaining: 4,
        cancelAtPeriodEnd: false,
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
    });

    expect(state).toEqual({
      daysRemaining: 4,
      isExpired: false,
      isExpiring: true,
      status: 'expiring',
    });
  });

  it('returns none when the canonical subscription plan is missing', () => {
    expect(
      getSubscriptionStatusState({
        subscriptionPlan: null,
      })
    ).toEqual({
      daysRemaining: null,
      isExpired: false,
      isExpiring: false,
      status: 'none',
    });
  });

  it('fails closed when a malformed plan slips through without status', () => {
    expect(
      getSubscriptionStatusState({
        subscriptionPlan: {
          subscriptionId: 77,
          id: 3,
          name: 'PERFORMANCE',
          subtitle: 'Growth',
          description: '<p>Growth</p>',
          descriptionPlainText: 'Growth',
          iconUrl: null,
          monthlyPrice: 899,
          sixMonthsPrice: 4499,
          yearlyPrice: 8999,
          badge: 'Popular',
          status: null,
          billingCycle: 'monthly',
          currency: 'INR',
          billingAmount: 899,
          subscriptionDate: '2026-03-04T17:27:24.233437',
          startDate: '2026-04-01T00:00:00.000Z',
          endDate: '2026-05-01T00:00:00.000Z',
          nextBillingDate: '2026-05-01T00:00:00.000Z',
          daysRemaining: 4,
          cancelAtPeriodEnd: false,
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
      }).status
    ).toBe('none');
  });
});
