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
        monthlyPrice: 1099,
        sixMonthsPrice: 2099,
        yearlyPrice: 4099,
        badge: 'Enterprise',
        subscriptionDate: '2026-03-04T17:27:24.233437',
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
      id: 4,
      name: 'ENTERPRISE',
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

  it('fails closed for partial nested groups and malformed optional fields', () => {
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
    expect(entitlements.subscriptionPlan?.limits).toEqual({
      maxClubs: 1,
      maxMembers: null,
      maxTrainers: null,
      maxStaffs: null,
      maxMembershipPlans: null,
      maxWorkoutPlans: null,
      maxLeadsPerMonth: null,
    });
    expect(entitlements.subscriptionPlan?.features).toMatchObject({
      memberManagement: true,
      paymentManagement: false,
      attendance: {
        manual: true,
        automatic: false,
        memberInsights: false,
        deviceManagement: false,
      },
      helpAndSupport: {
        email: true,
        whatsApp: false,
        call: false,
      },
      notifications: {
        realtime: false,
        whatsApp: false,
        email: false,
        push: false,
      },
    });
  });

  it('returns an empty entitlement shell when the payload is missing', () => {
    expect(normalizeAccessMeData(null)).toEqual({
      role: '',
      permissions: [],
      subscriptionPlan: null,
    });
  });
});
