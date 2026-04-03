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
              id: 4,
              name: 'ENTERPRISE',
              subtitle: 'Powerful',
              description: '<p>Enterprise</p>',
              monthlyPrice: 1099,
              sixMonthsPrice: 1099,
              yearlyPrice: 1099,
              badge: 'Enterprise',
              subscriptionDate: '2026-03-04T17:27:24.233437',
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
                memberManagement: true,
                paymentManagement: true,
                attendance: {
                  manual: true,
                  automatic: false,
                  memberInsights: true,
                  deviceManagement: true,
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
          subscription: {
            plan: {
              id: 4,
              name: 'ENTERPRISE',
              tier: 'enterprise',
              status: 'active',
            },
            subscriptionId: 6001,
            billingCycle: 'monthly',
            startDate: '2026-04-01T00:00:00.000Z',
            endDate: '2026-05-01T00:00:00.000Z',
            usageLimits: {
              maxClubs: 10000,
              maxMembers: 10000,
              maxTrainers: 10000,
              maxStaffs: 9999,
            },
            features: {},
          },
        },
      });
    });

    const result = await fetchAppSession('uid-22');

    expect(getMock).toHaveBeenCalledTimes(2);
    expect(result.session.user).toMatchObject({
      uid: 'uid-22',
      userId: 22,
      userRole: 'owner',
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
        id: 4,
        name: 'ENTERPRISE',
        features: {
          memberManagement: true,
          paymentManagement: true,
        },
      },
    });
    expect(result.session.subscriptionLifecycle).toEqual({
      subscriptionId: 6001,
      billingCycle: 'monthly',
      startDate: '2026-04-01T00:00:00.000Z',
      endDate: '2026-05-01T00:00:00.000Z',
      status: 'active',
    });
  });
});
