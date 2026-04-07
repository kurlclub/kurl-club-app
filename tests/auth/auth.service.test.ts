import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchAppSession } from '@/services/auth/auth';

const { getMock, postMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  api: {
    get: getMock,
    post: postMock,
  },
}));

describe('fetchAppSession', () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
  });

  it('hydrates business data and entitlements together from both endpoints', async () => {
    getMock.mockImplementation((url: string) => {
      if (url === '/Access/me') {
        return Promise.resolve({
          status: 'success',
          data: {
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
              subscriptionId: 6001,
              id: 4,
              name: 'ENTERPRISE',
              subtitle: 'Powerful',
              description: '<p>Enterprise</p>',
              descriptionPlainText: 'Enterprise',
              iconUrl:
                'https://cdn.kurlclub.com/subscription-plans/enterprise.png',
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
        });
      }

      return Promise.resolve({
        status: 'success',
        data: {
          userId: 22,
          userName: 'Web Admin',
          userEmail: 'web-admin@kurlclub.com',
          photoPath: '/avatar.png',
          userRole: 'owner',
          isMultiClub: true,
          clubs: [
            {
              gymId: 52,
              gymName: 'Prime Club',
              location: 'Thrissur',
              contactNumber1: '9999999999',
              contactNumber2: null,
              email: 'prime@kurlclub.com',
              socialLinks: null,
              gymAdminId: 22,
              status: 1,
              gymIdentifier: 'KC-PRIME',
              photoPath: null,
            },
          ],
        },
      });
    });

    const result = await fetchAppSession('uid-22');

    expect(getMock).toHaveBeenCalledTimes(2);
    expect(result.session.user).toMatchObject({
      uid: 'uid-22',
      userId: 22,
      userRole: 'owner',
      clubs: [
        {
          gymId: 52,
          contactNumber1: '9999999999',
          email: 'prime@kurlclub.com',
          gymAdminId: 22,
        },
      ],
      gyms: [
        {
          gymId: 52,
          gymName: 'Prime Club',
          gymLocation: 'Thrissur',
        },
      ],
    });
    expect(result.session.gymDetails?.gymIdentifier).toBe('KC-PRIME');
    expect(result.session.entitlements).toMatchObject({
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
        subscriptionId: 6001,
        id: 4,
        name: 'ENTERPRISE',
        descriptionPlainText: 'Enterprise',
        iconUrl: 'https://cdn.kurlclub.com/subscription-plans/enterprise.png',
        status: 'expiring',
        billingCycle: 'monthly',
        startDate: '2026-04-01T00:00:00.000Z',
        endDate: '2026-05-01T00:00:00.000Z',
        nextBillingDate: '2026-05-01T00:00:00.000Z',
        daysRemaining: 5,
        features: {
          memberManagement: true,
          paymentManagement: true,
        },
      },
    });
  });

  it('fails closed when /Access/me returns a partial subscription plan', async () => {
    getMock.mockImplementation((url: string) => {
      if (url === '/Access/me') {
        return Promise.resolve({
          status: 'success',
          data: {
            role: 'admin',
            permissions: [],
            subscriptionPlan: {
              subscriptionId: 6001,
              id: 4,
              name: 'ENTERPRISE',
              subtitle: 'Powerful',
              description: '<p>Enterprise</p>',
              descriptionPlainText: '',
              iconUrl: null,
              monthlyPrice: 1099,
              sixMonthsPrice: 1099,
              yearlyPrice: 1099,
              badge: 'Enterprise',
              status: 'active',
              billingCycle: 'monthly',
              currency: 'INR',
              billingAmount: 1099,
              subscriptionDate: '2026-03-04T17:27:24.233437',
              startDate: '2026-04-01T00:00:00.000Z',
              endDate: '2026-05-01T00:00:00.000Z',
              nextBillingDate: null,
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
        });
      }

      return Promise.resolve({
        status: 'success',
        data: {
          userId: 22,
          userName: 'Web Admin',
          userEmail: 'web-admin@kurlclub.com',
          photoPath: '/avatar.png',
          userRole: 'owner',
          isMultiClub: false,
          clubs: [
            {
              gymId: 52,
              gymName: 'Prime Club',
              location: 'Thrissur',
              contactNumber1: '9999999999',
              contactNumber2: null,
              email: 'prime@kurlclub.com',
              socialLinks: null,
              gymAdminId: 22,
              status: 1,
              gymIdentifier: 'KC-PRIME',
              photoPath: null,
            },
          ],
        },
      });
    });

    const result = await fetchAppSession('uid-22');

    expect(result.session.entitlements?.subscriptionPlan).toBeNull();
  });
});
