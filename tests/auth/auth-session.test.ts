import { describe, expect, it } from 'vitest';

import {
  APP_SESSION_STORAGE_VERSION,
  migrateLegacyStorageToSession,
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
        userRole: 'legacy_admin',
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
        subscriptionPlan: null,
      },
      subscriptionLifecycle: null,
    };

    const parsed = parseStoredAppSession(serializeStoredAppSession(session));

    expect(parsed).toEqual({
      version: APP_SESSION_STORAGE_VERSION,
      ...session,
    });
  });

  it('migrates legacy cached state into canonical entitlements and lifecycle data', () => {
    const encryptedLegacyUser = encrypt(
      JSON.stringify({
        userId: 9,
        userName: 'Legacy Owner',
        userEmail: 'legacy@kurlclub.com',
        userRole: 'owner',
        uid: 'uid-9',
        photoURL: null,
        isMultiClub: true,
        gyms: [
          {
            gymId: 101,
            gymName: 'Legacy Gym',
            gymLocation: 'Calicut',
          },
        ],
        clubs: [
          {
            gymId: 101,
            gymName: 'Legacy Gym',
            location: 'Calicut',
            status: 1,
            gymIdentifier: 'KC-LEG',
            photoPath: null,
          },
        ],
        subscription: {
          plan: {
            id: 3,
            name: 'PERFORMANCE',
            tier: 'popular',
            status: 'active',
          },
          subscriptionId: 7001,
          billingCycle: 'yearly',
          startDate: '2026-01-01T00:00:00.000Z',
          endDate: '2026-12-31T00:00:00.000Z',
          usageLimits: {
            maxClubs: 3,
            maxMembers: 1000,
            maxTrainers: 10,
            maxStaffs: 8,
          },
          features: {
            memberManagement: true,
            paymentTracking: true,
            manualAttendance: true,
            liveAttendance: true,
            reportsAnalytics: true,
            basicReports: true,
            chatSupport: true,
            emailSupport: true,
            phoneSupport: false,
            whatsAppNotifications: true,
          },
        },
      })
    );
    const encryptedLegacyGymDetails = encrypt(
      JSON.stringify({
        id: 101,
        gymName: 'Legacy Gym',
        location: 'Calicut',
        contactNumber1: '9999999999',
        contactNumber2: null,
        email: 'legacy-gym@kurlclub.com',
        socialLinks: null,
        gymAdminId: 9,
        status: '1',
        gymIdentifier: 'KC-LEG',
        photoPath: null,
      })
    );

    const migrated = migrateLegacyStorageToSession({
      encryptedLegacyUser,
      encryptedLegacyGymDetails,
    });

    expect(migrated?.entitlements).toMatchObject({
      role: 'owner',
      permissions: [],
      subscriptionPlan: {
        id: 3,
        name: 'PERFORMANCE',
        limits: {
          maxClubs: 3,
          maxMembers: 1000,
          maxTrainers: 10,
          maxStaffs: 8,
          maxMembershipPlans: null,
        },
        features: {
          memberManagement: true,
          paymentManagement: true,
          attendance: {
            manual: true,
            automatic: true,
          },
          expenses: {
            reportsDashboard: true,
          },
          helpAndSupport: {
            whatsApp: true,
            email: true,
            call: false,
          },
        },
      },
    });
    expect(migrated?.subscriptionLifecycle).toEqual({
      subscriptionId: 7001,
      billingCycle: 'yearly',
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2026-12-31T00:00:00.000Z',
      status: 'active',
    });
  });

  it('rewrites legacy cached state as a migrated session payload', () => {
    const encryptedLegacyUser = encrypt(
      JSON.stringify({
        userId: 1,
        userName: 'Legacy',
        userEmail: 'legacy@kurlclub.com',
        userRole: 'admin',
        uid: 'legacy-uid',
        isMultiClub: false,
        gyms: [],
        clubs: [],
      })
    );

    const resolved = resolveStoredAppSession({
      encryptedLegacyUser,
      encryptedLegacyGymDetails: null,
      encryptedSession: null,
    });

    expect(resolved.didMigrateLegacyState).toBe(true);
    expect(resolved.session?.entitlements?.role).toBe('admin');
  });
});
