import { decrypt, encrypt } from '@/lib/crypto';
import { normalizeAccessMeData } from '@/services/auth/access-me-normalizer';
import type {
  AppClub,
  AppGymSummary,
  AppSession,
  AppUser,
  StoredAppSession,
} from '@/types/access';
import type { GymDetails } from '@/types/gym';

export const APP_SESSION_STORAGE_KEY = 'appSession';
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

export const createStoredAppSession = (
  session: AppSession
): StoredAppSession => ({
  version: APP_SESSION_STORAGE_VERSION,
  user: session.user,
  gymDetails: session.gymDetails,
  entitlements: session.entitlements,
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
    if (!isRecord(parsed) || typeof parsed.version !== 'number') {
      return null;
    }

    const user =
      parsed.user === null || parsed.user === undefined
        ? null
        : normalizeAppUser(parsed.user);
    const gymDetails =
      parsed.gymDetails === null || parsed.gymDetails === undefined
        ? null
        : normalizeGymDetails(parsed.gymDetails);
    const entitlements =
      parsed.entitlements === null || parsed.entitlements === undefined
        ? null
        : normalizeAccessMeData(parsed.entitlements);
    const rawEntitlements = isRecord(parsed.entitlements)
      ? parsed.entitlements
      : null;

    if (
      rawEntitlements?.subscriptionPlan &&
      entitlements?.subscriptionPlan === null
    ) {
      return null;
    }

    return {
      version: parsed.version,
      user,
      gymDetails,
      entitlements,
    };
  } catch (error) {
    console.warn('Failed to parse stored app session:', error);
    return null;
  }
};

export const resolveStoredAppSession = ({
  encryptedSession,
}: {
  encryptedSession?: string | null;
}) => {
  const storedSession = parseStoredAppSession(encryptedSession);

  if (
    !storedSession ||
    !storedSession.user?.uid ||
    !storedSession.entitlements
  ) {
    return {
      session: null,
      didMigrateLegacyState: false,
    };
  }

  return {
    session: {
      user: storedSession.user,
      gymDetails: storedSession.gymDetails,
      entitlements: storedSession.entitlements,
    },
    didMigrateLegacyState: false,
  };
};
