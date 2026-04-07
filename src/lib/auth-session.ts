import { decrypt, encrypt } from '@/lib/crypto';
import { normalizeAccessMeData } from '@/services/auth/access-me-normalizer';
import type {
  AppClub,
  AppGymSummary,
  AppSession,
  AppUser,
  LegacyUserSubscription,
  StoredAppSession,
} from '@/types/access';
import type { GymDetails } from '@/types/gym';
import type {
  SubscriptionLifecycle,
  SubscriptionPlanEntitlement,
} from '@/types/subscription';

export const APP_SESSION_STORAGE_KEY = 'appSession';
export const LEGACY_USER_STORAGE_KEY = 'appUser';
export const LEGACY_GYM_DETAILS_STORAGE_KEY = 'gymDetails';
export const APP_SESSION_STORAGE_VERSION = 1;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getString = (value: unknown) => (typeof value === 'string' ? value : '');

const getNullableString = (value: unknown) =>
  typeof value === 'string' || value === null ? value : null;

const getNumber = (value: unknown, fallback = 0) =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const normalizeGymSummary = (value: unknown): AppGymSummary | null => {
  if (!isRecord(value)) return null;
  return {
    gymId: getNumber(value.gymId),
    gymName: getString(value.gymName),
    gymLocation: getString(value.gymLocation),
  };
};

const normalizeClub = (value: unknown): AppClub | null => {
  if (!isRecord(value)) return null;
  return {
    gymId: getNumber(value.gymId),
    gymName: getString(value.gymName),
    location: getString(value.location),
    contactNumber1: getString(value.contactNumber1),
    contactNumber2: getNullableString(value.contactNumber2),
    email: getString(value.email),
    socialLinks:
      typeof value.socialLinks === 'string' ||
      Array.isArray(value.socialLinks) ||
      value.socialLinks === null
        ? value.socialLinks
        : null,
    gymAdminId: getNumber(value.gymAdminId),
    status: getNumber(value.status),
    gymIdentifier: getString(value.gymIdentifier),
    photoPath: getNullableString(value.photoPath),
  };
};

export const normalizeAppUser = (value: unknown): AppUser | null => {
  if (!isRecord(value)) return null;

  const uid = getString(value.uid);
  if (!uid) return null;

  return {
    userId: getNumber(value.userId),
    userName: getString(value.userName),
    userEmail: getString(value.userEmail),
    userRole: getString(value.userRole),
    uid,
    photoURL: getNullableString(value.photoURL),
    isMultiClub: value.isMultiClub === true,
    gyms: Array.isArray(value.gyms)
      ? value.gyms
          .map(normalizeGymSummary)
          .filter((entry): entry is AppGymSummary => entry !== null)
      : [],
    clubs: Array.isArray(value.clubs)
      ? value.clubs
          .map(normalizeClub)
          .filter((entry): entry is AppClub => entry !== null)
      : [],
  };
};

const normalizeGymDetails = (value: unknown): GymDetails | null => {
  if (!isRecord(value)) return null;

  return {
    id: getNumber(value.id),
    gymName: getString(value.gymName),
    location: getString(value.location),
    contactNumber1: getString(value.contactNumber1),
    contactNumber2: getNullableString(value.contactNumber2),
    email: getString(value.email),
    socialLinks:
      typeof value.socialLinks === 'string' ||
      Array.isArray(value.socialLinks) ||
      value.socialLinks === null
        ? value.socialLinks
        : null,
    gymAdminId: getNumber(value.gymAdminId),
    status: getString(value.status),
    gymIdentifier: getString(value.gymIdentifier),
    photoPath: getNullableString(value.photoPath),
  };
};

const normalizeSubscriptionLifecycle = (
  value: unknown
): SubscriptionLifecycle | null => {
  if (!isRecord(value)) return null;

  const billingCycle = value.billingCycle;
  const status = value.status;
  if (
    billingCycle !== 'monthly' &&
    billingCycle !== 'sixMonths' &&
    billingCycle !== 'yearly'
  ) {
    return null;
  }
  if (status !== 'active' && status !== 'expired' && status !== 'cancelled') {
    return null;
  }

  return {
    subscriptionId: getNumber(value.subscriptionId),
    billingCycle,
    startDate: getString(value.startDate),
    endDate: getString(value.endDate),
    status,
  };
};

const createLegacyPlanEntitlement = (
  legacySubscription: LegacyUserSubscription
): SubscriptionPlanEntitlement => ({
  id: legacySubscription.plan.id,
  name: legacySubscription.plan.name,
  subtitle: '',
  description: '',
  monthlyPrice: 0,
  sixMonthsPrice: 0,
  yearlyPrice: 0,
  badge: legacySubscription.plan.tier,
  subscriptionDate: legacySubscription.startDate,
  limits: {
    maxClubs: legacySubscription.usageLimits.maxClubs,
    maxMembers: legacySubscription.usageLimits.maxMembers,
    maxTrainers: legacySubscription.usageLimits.maxTrainers,
    maxStaffs: legacySubscription.usageLimits.maxStaffs,
    maxMembershipPlans: null,
    maxWorkoutPlans: null,
    maxLeadsPerMonth: null,
  },
  features: {
    studioDashboard: {
      enabled: legacySubscription.features.basicDashboard === true,
      paymentInsights: legacySubscription.features.reportsAnalytics === true,
      skipperStats: legacySubscription.features.reportsAnalytics === true,
      attendanceStats: legacySubscription.features.attendanceTracking === true,
    },
    memberManagement: legacySubscription.features.memberManagement === true,
    paymentManagement:
      legacySubscription.features.paymentTracking === true ||
      legacySubscription.features.paymentRecording === true,
    attendance: {
      manual: legacySubscription.features.manualAttendance === true,
      automatic: legacySubscription.features.liveAttendance === true,
      memberInsights: legacySubscription.features.attendanceTracking === true,
      deviceManagement: legacySubscription.features.attendanceTracking === true,
    },
    leadsManagement: legacySubscription.features.leadManagement === true,
    programs: {
      membershipPlans:
        legacySubscription.features.membershipManagement === true,
      workoutPlans: legacySubscription.features.membershipManagement === true,
    },
    staffManagement: {
      activityTracking: legacySubscription.features.staffManagement === true,
      staffLogin: legacySubscription.features.staffManagement === true,
    },
    payrollManagement: false,
    expenses: {
      reportsDashboard:
        legacySubscription.features.basicReports === true ||
        legacySubscription.features.reportsAnalytics === true,
      expenseManagement: legacySubscription.features.expenseTracker === true,
    },
    helpAndSupport: {
      ticketingPortal: false,
      whatsApp: legacySubscription.features.chatSupport === true,
      email: legacySubscription.features.emailSupport === true,
      call: legacySubscription.features.phoneSupport === true,
    },
    whatsAppNotifications: {
      paymentReminders:
        legacySubscription.features.whatsAppNotifications === true,
      membershipExpiry:
        legacySubscription.features.whatsAppNotifications === true,
      lowAttendance: legacySubscription.features.whatsAppNotifications === true,
      specialDays: legacySubscription.features.whatsAppNotifications === true,
    },
    invoice: {
      customTemplates: legacySubscription.features.invoiceGeneration === true,
    },
    notifications: {
      realtime: legacySubscription.features.realTimeNotifications === true,
      whatsApp: legacySubscription.features.whatsAppNotifications === true,
      email: legacySubscription.features.emailNotifications === true,
      push: false,
    },
  },
});

const normalizeLegacyLifecycle = (
  legacySubscription: unknown
): SubscriptionLifecycle | null => {
  if (!isRecord(legacySubscription)) return null;
  const billingCycle = legacySubscription.billingCycle;
  const endDate = getString(legacySubscription.endDate);
  const startDate = getString(legacySubscription.startDate);
  const subscriptionId = getNumber(legacySubscription.subscriptionId);
  const plan = isRecord(legacySubscription.plan)
    ? legacySubscription.plan
    : null;

  if (
    (billingCycle !== 'monthly' &&
      billingCycle !== 'sixMonths' &&
      billingCycle !== 'yearly') ||
    !plan
  ) {
    return null;
  }

  const status = plan.status;
  if (status !== 'active' && status !== 'expired' && status !== 'cancelled') {
    return null;
  }

  return {
    subscriptionId,
    billingCycle,
    startDate,
    endDate,
    status,
  };
};

export const createStoredAppSession = (
  session: AppSession
): StoredAppSession => ({
  version: APP_SESSION_STORAGE_VERSION,
  user: session.user,
  gymDetails: session.gymDetails,
  entitlements: session.entitlements,
  subscriptionLifecycle: session.subscriptionLifecycle,
});

export const serializeStoredAppSession = (session: AppSession) =>
  encrypt(JSON.stringify(createStoredAppSession(session)));

export const parseStoredAppSession = (
  encryptedValue: string | null | undefined
): StoredAppSession | null => {
  if (!encryptedValue) return null;

  const decryptedValue = decrypt(encryptedValue);
  if (!decryptedValue) return null;

  try {
    const parsed = JSON.parse(decryptedValue) as unknown;
    if (!isRecord(parsed)) return null;
    if (typeof parsed.version !== 'number') return null;

    return {
      version: parsed.version,
      user:
        parsed.user === null || parsed.user === undefined
          ? null
          : normalizeAppUser(parsed.user),
      gymDetails:
        parsed.gymDetails === null || parsed.gymDetails === undefined
          ? null
          : normalizeGymDetails(parsed.gymDetails),
      entitlements:
        parsed.entitlements === null || parsed.entitlements === undefined
          ? null
          : normalizeAccessMeData(parsed.entitlements),
      subscriptionLifecycle:
        parsed.subscriptionLifecycle === null ||
        parsed.subscriptionLifecycle === undefined
          ? null
          : normalizeSubscriptionLifecycle(parsed.subscriptionLifecycle),
    };
  } catch (error) {
    console.warn('Failed to parse stored app session:', error);
    return null;
  }
};

export const migrateLegacyStorageToSession = ({
  encryptedLegacyUser,
  encryptedLegacyGymDetails,
}: {
  encryptedLegacyUser?: string | null;
  encryptedLegacyGymDetails?: string | null;
}): AppSession | null => {
  if (!encryptedLegacyUser) return null;

  const decryptedUser = decrypt(encryptedLegacyUser);
  if (!decryptedUser) return null;

  try {
    const parsedUser = JSON.parse(decryptedUser) as unknown;
    const user = normalizeAppUser(parsedUser);
    if (!user) return null;

    const legacySubscription = isRecord(parsedUser)
      ? (parsedUser.subscription as LegacyUserSubscription | undefined)
      : undefined;

    let gymDetails: GymDetails | null = null;
    if (encryptedLegacyGymDetails) {
      const decryptedGymDetails = decrypt(encryptedLegacyGymDetails);
      if (decryptedGymDetails) {
        try {
          gymDetails = normalizeGymDetails(JSON.parse(decryptedGymDetails));
        } catch (error) {
          console.warn('Failed to parse legacy gym details:', error);
        }
      }
    }

    return {
      user,
      gymDetails,
      entitlements: legacySubscription
        ? {
            role: user.userRole,
            permissions: [],
            subscriptionPlan: createLegacyPlanEntitlement(legacySubscription),
          }
        : {
            role: user.userRole,
            permissions: [],
            subscriptionPlan: null,
          },
      subscriptionLifecycle: legacySubscription
        ? normalizeLegacyLifecycle(legacySubscription)
        : null,
    };
  } catch (error) {
    console.warn('Failed to parse legacy cached user:', error);
    return null;
  }
};

export const resolveStoredAppSession = ({
  encryptedSession,
  encryptedLegacyUser,
  encryptedLegacyGymDetails,
}: {
  encryptedSession?: string | null;
  encryptedLegacyUser?: string | null;
  encryptedLegacyGymDetails?: string | null;
}) => {
  const storedSession = parseStoredAppSession(encryptedSession);
  if (storedSession) {
    return {
      session: {
        user: storedSession.user,
        gymDetails: storedSession.gymDetails,
        entitlements: storedSession.entitlements,
        subscriptionLifecycle: storedSession.subscriptionLifecycle,
      },
      didMigrateLegacyState: false,
    };
  }

  const migratedSession = migrateLegacyStorageToSession({
    encryptedLegacyUser,
    encryptedLegacyGymDetails,
  });

  return {
    session: migratedSession,
    didMigrateLegacyState: Boolean(migratedSession),
  };
};
