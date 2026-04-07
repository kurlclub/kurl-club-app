import { describe, expect, it } from 'vitest';

import {
  getEnabledSubscriptionCapabilities,
  getPermissionForModule,
  hasPermissionAccess,
  hasSubscriptionAccess,
  isSubscriptionLimitExceeded,
} from '@/lib/subscription/access-policy';
import type { AuthEntitlements } from '@/types/access';
import { DEFAULT_SUBSCRIPTION_PLAN_FEATURES } from '@/types/subscription';

const fullPlan: NonNullable<AuthEntitlements['subscriptionPlan']> = {
  subscriptionId: 42,
  id: 4,
  name: 'ENTERPRISE',
  subtitle: 'Powerful',
  description: '<p>Enterprise</p>',
  descriptionPlainText: 'Enterprise',
  iconUrl: 'https://cdn.example.com/subscriptions/enterprise.png',
  isActive: true,
  status: 'active',
  billingCycle: 'monthly',
  currency: null,
  billingAmount: 1099,
  monthlyPrice: 1099,
  sixMonthsPrice: 1099,
  yearlyPrice: 1099,
  badge: 'Enterprise',
  subscriptionDate: '2026-03-04T17:27:24.233437',
  startDate: '2026-03-04T17:27:24.233437Z',
  endDate: '2026-04-04T17:27:24.233437Z',
  nextBillingDate: '2026-04-04T17:27:24.233437Z',
  daysRemaining: 12,
  cancelAtPeriodEnd: false,
  limits: {
    maxClubs: 10,
    maxMembers: 1000,
    maxTrainers: 50,
    maxStaffs: 40,
    maxMembershipPlans: 25,
    maxWorkoutPlans: 25,
    maxLeadsPerMonth: 500,
  },
  features: {
    ...DEFAULT_SUBSCRIPTION_PLAN_FEATURES,
    studioDashboard: {
      enabled: true,
      paymentInsights: true,
      skipperStats: true,
      attendanceStats: true,
    },
    memberManagement: true,
    paymentManagement: true,
    attendance: {
      manual: true,
      automatic: true,
      memberInsights: true,
      deviceManagement: true,
    },
    leadsManagement: true,
    programs: {
      membershipPlans: true,
      workoutPlans: true,
    },
    staffManagement: {
      activityTracking: true,
      staffLogin: true,
    },
    expenses: {
      reportsDashboard: true,
      expenseManagement: true,
    },
    helpAndSupport: {
      ticketingPortal: true,
      whatsApp: true,
      email: true,
      call: true,
    },
    whatsAppNotifications: {
      paymentReminders: true,
      membershipExpiry: true,
      lowAttendance: true,
      specialDays: true,
    },
    notifications: {
      realtime: true,
      whatsApp: true,
      email: true,
      push: true,
    },
  },
};

describe('subscription access policy', () => {
  it('resolves every semantic access key from the canonical nested plan', () => {
    const expectedKeys = [
      'memberManagement',
      'paymentTracking',
      'attendanceTracking',
      'manualAttendance',
      'liveAttendance',
      'staffManagement',
      'membershipManagement',
      'basicReports',
      'leadManagement',
      'emailSupport',
      'chatSupport',
      'phoneSupport',
      'reportsAnalytics',
      'realTimeNotifications',
      'whatsAppNotifications',
    ] as const;

    for (const key of expectedKeys) {
      expect(hasSubscriptionAccess(fullPlan, key)).toBe(true);
    }

    expect(getEnabledSubscriptionCapabilities(fullPlan)).toEqual(expectedKeys);
  });

  it('checks usage limits against the canonical limit model', () => {
    expect(isSubscriptionLimitExceeded(fullPlan, 'maxMembers', 999)).toBe(
      false
    );
    expect(isSubscriptionLimitExceeded(fullPlan, 'maxMembers', 1000)).toBe(
      true
    );
    expect(
      isSubscriptionLimitExceeded(
        {
          ...fullPlan,
          limits: {
            ...fullPlan.limits,
            maxLeadsPerMonth: null,
          },
        },
        'maxLeadsPerMonth',
        1000
      )
    ).toBe(false);
  });

  it('reads permission access from the canonical entitlement store', () => {
    const entitlements: AuthEntitlements = {
      role: 'admin',
      subscriptionPlan: fullPlan,
      permissions: [
        {
          moduleKey: 'member_management',
          canView: true,
          canCreate: true,
          canEdit: false,
          canDelete: false,
        },
      ],
    };

    expect(getPermissionForModule(entitlements, 'member_management')).toEqual({
      moduleKey: 'member_management',
      canView: true,
      canCreate: true,
      canEdit: false,
      canDelete: false,
    });
    expect(hasPermissionAccess(entitlements, 'member_management')).toBe(true);
    expect(
      hasPermissionAccess(entitlements, 'member_management', 'canEdit')
    ).toBe(false);
  });
});
