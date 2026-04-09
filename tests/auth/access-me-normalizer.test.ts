import { describe, expect, it } from 'vitest';

import { normalizeAccessMeData } from '@/services/auth/access-me-normalizer';

describe('normalizeAccessMeData', () => {
  it('normalizes a full /Access/me entitlement payload', () => {
    const entitlements = normalizeAccessMeData({
      role: 'admin',
      permissions: [
        {
          moduleKey: 'member_management',
          canView: true,
          canCreate: true,
          canEdit: true,
          canDelete: true,
        },
      ],
      subscriptionPlan: {
        id: 4,
        name: 'ENTERPRISE',
        subtitle: 'Powerful plan',
        description: '<p>Full access</p>',
        iconUrl: 'https://cdn.kurlclub.com/subscription-plans/enterprise.png',
        monthlyPrice: 1099,
        sixMonthsPrice: 2099,
        yearlyPrice: 4099,
        badge: 'Enterprise',
        billingCycle: 'monthly',
        isActive: true,
        subscriptionDate: '2026-03-04T17:27:24.233437',
        nextBillingDate: '2026-05-01T00:00:00.000Z',
        daysRemaining: 4,
        limits: {
          maxClubs: 10,
          maxMembers: 1000,
          maxTrainers: 25,
          maxStaffs: 30,
          maxMembershipPlans: null,
          maxWorkoutPlans: 100,
          maxLeadsPerMonth: 500,
        },
        features: {
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
          payrollManagement: true,
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
          invoice: {
            customTemplates: true,
          },
          notifications: {
            realtime: true,
            whatsApp: true,
            email: true,
            push: true,
          },
        },
      },
    });

    expect(entitlements.role).toBe('admin');
    expect(entitlements.permissions).toEqual([
      {
        moduleKey: 'member_management',
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
      },
    ]);
    expect(entitlements.subscriptionPlan).toMatchObject({
      subscriptionId: null,
      id: 4,
      name: 'ENTERPRISE',
      descriptionPlainText: 'Full access',
      iconUrl: 'https://cdn.kurlclub.com/subscription-plans/enterprise.png',
      isActive: true,
      status: 'expiring',
      billingCycle: 'monthly',
      billingAmount: 1099,
      currency: null,
      startDate: '2026-03-04T17:27:24.233437',
      endDate: '2026-05-01T00:00:00.000Z',
      nextBillingDate: '2026-05-01T00:00:00.000Z',
      daysRemaining: 4,
      limits: {
        maxClubs: 10,
        maxMembershipPlans: null,
        maxWorkoutPlans: 100,
      },
      features: {
        memberManagement: true,
        paymentManagement: true,
        attendance: {
          manual: true,
          automatic: true,
        },
        notifications: {
          realtime: true,
          push: true,
        },
      },
    });
  });

  it('fails closed for partial lifecycle, limits, and feature data', () => {
    const entitlements = normalizeAccessMeData({
      role: 'trainer',
      permissions: [
        {
          moduleKey: 'attendance_management',
          canView: true,
          canCreate: 'yes' as never,
          canEdit: false,
          canDelete: null as never,
        },
        {
          moduleKey: '',
          canView: true,
        },
        {
          canView: true,
        } as never,
      ],
      subscriptionPlan: {
        id: 2,
        name: 'Growth',
        description: '<p>Growth</p>',
        billingCycle: 'monthly',
        isActive: true,
        monthlyPrice: 699,
        sixMonthsPrice: 3499,
        yearlyPrice: 6999,
        subscriptionDate: '2026-04-01T00:00:00.000Z',
        nextBillingDate: null,
        daysRemaining: null,
        limits: {
          maxClubs: 1,
          maxMembers: null,
          maxTrainers: 'unlimited',
        },
        features: {
          memberManagement: true,
          attendance: {
            manual: true,
          },
          helpAndSupport: {
            email: true,
          },
        },
      },
    });

    expect(entitlements.permissions).toEqual([
      {
        moduleKey: 'attendance_management',
        canView: true,
        canCreate: false,
        canEdit: false,
        canDelete: false,
      },
    ]);
    expect(entitlements.subscriptionPlan).toBeNull();
  });

  it('returns an empty entitlement shell when the payload is missing', () => {
    expect(normalizeAccessMeData(null)).toEqual({
      role: '',
      permissions: [],
      subscriptionPlan: null,
    });
  });
});
