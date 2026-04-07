import { describe, expect, it } from 'vitest';

import {
  APP_SESSION_STORAGE_VERSION,
  parseStoredAppSession,
  resolveStoredAppSession,
  serializeStoredAppSession,
} from '@/lib/auth-session';
import { encrypt } from '@/lib/crypto';
import type { AppSession } from '@/types/access';

describe('auth session storage', () => {
  it('serializes and parses the canonical app session', () => {
    const session: AppSession = {
      user: {
        userId: 7,
        userName: 'Admin User',
        userEmail: 'admin@kurlclub.com',
        userRole: 'admin',
        uid: 'uid-7',
        photoURL: null,
        isMultiClub: false,
        gyms: [
          {
            gymId: 11,
            gymName: 'Downtown Club',
            gymLocation: 'Palakkad',
          },
        ],
        clubs: [],
      },
      gymDetails: {
        id: 11,
        gymName: 'Downtown Club',
        location: 'Palakkad',
        contactNumber1: '9999999999',
        contactNumber2: null,
        email: 'downtown@kurlclub.com',
        socialLinks: null,
        gymAdminId: 7,
        status: '1',
        gymIdentifier: 'KC-DT',
        photoPath: null,
      },
      entitlements: {
        role: 'admin',
        permissions: [],
        subscriptionPlan: {
          subscriptionId: 6001,
          id: 4,
          name: 'ENTERPRISE',
          subtitle: 'Powerful',
          description: '<p>Enterprise</p>',
          descriptionPlainText: 'Enterprise',
          iconUrl: 'https://cdn.kurlclub.com/subscription-plans/enterprise.png',
          monthlyPrice: 1099,
          sixMonthsPrice: 1099,
          yearlyPrice: 1099,
          badge: 'Enterprise',
          status: 'expiring',
          billingCycle: 'monthly',
          currency: 'INR',
          billingAmount: 1099,
          subscriptionDate: '2026-03-04T17:27:24.233437',
          startDate: '2026-04-01T00:00:00.000Z',
          endDate: '2026-05-01T00:00:00.000Z',
          nextBillingDate: '2026-05-01T00:00:00.000Z',
          daysRemaining: 5,
          cancelAtPeriodEnd: false,
          limits: {
            maxClubs: 10000,
            maxMembers: 10000,
            maxTrainers: 10000,
            maxStaffs: 9999,
            maxMembershipPlans: null,
            maxWorkoutPlans: null,
            maxLeadsPerMonth: null,
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
      },
    };

    const parsed = parseStoredAppSession(serializeStoredAppSession(session));

    expect(parsed).toEqual({
      version: APP_SESSION_STORAGE_VERSION,
      ...session,
    });
  });

  it('rejects invalid canonical session payloads instead of migrating legacy state', () => {
    const parsed = parseStoredAppSession(
      encrypt(
        JSON.stringify({
          version: APP_SESSION_STORAGE_VERSION,
          user: {
            userId: 9,
            userName: 'Legacy Owner',
            userEmail: 'legacy@kurlclub.com',
            userRole: 'owner',
            uid: 'uid-9',
          },
          gymDetails: null,
          entitlements: {
            role: 'owner',
            permissions: [],
            subscriptionPlan: {
              id: 3,
              name: 'PERFORMANCE',
            },
          },
        })
      )
    );

    expect(parsed).toBeNull();
  });

  it('returns no resolved session when the stored payload is missing canonical entitlements', () => {
    const resolved = resolveStoredAppSession({
      encryptedSession: encrypt(
        JSON.stringify({
          version: APP_SESSION_STORAGE_VERSION,
          user: {
            userId: 9,
            userName: 'Legacy Owner',
            userEmail: 'legacy@kurlclub.com',
            userRole: 'owner',
            uid: 'uid-9',
            gyms: [],
            clubs: [],
          },
          gymDetails: null,
          entitlements: null,
        })
      ),
    });

    expect(resolved).toEqual({
      session: null,
      didMigrateLegacyState: false,
    });
  });
});
