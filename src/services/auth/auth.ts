import { api } from '@/lib/api';
import { normalizeAccessMeData } from '@/services/auth/access-me-normalizer';
import type { AppSession, AppUser, AuthEntitlements } from '@/types/access';
import type { GymDetails } from '@/types/gym';
import type { SubscriptionLifecycle } from '@/types/subscription';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  status: string;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: {
      id: number;
      uid: string;
      userName: string;
      email: string;
      role: string;
      phoneNumber: string;
      photoURL: string;
      emailVerified: boolean;
      phoneVerified: boolean;
    };
  };
}

interface UserDetailsResponse {
  status: string;
  message: string;
  data: {
    userId: number;
    userName: string;
    userEmail: string;
    photoPath?: string | null;
    userRole: string;
    isMultiClub: boolean;
    clubs: Array<{
      gymId: number;
      gymName: string;
      location: string;
      contactNumber1: string;
      contactNumber2: string | null;
      email: string;
      socialLinks: string | Array<string | { url?: string | null }> | null;
      gymAdminId: number;
      status: number;
      gymIdentifier: string;
      photoPath: string | null;
    }>;
    subscription?: {
      plan: {
        id: number;
        name: string;
        tier: string;
        status: 'active' | 'expired' | 'cancelled';
      };
      subscriptionId: number;
      billingCycle: 'monthly' | 'sixMonths' | 'yearly';
      startDate: string;
      endDate: string;
      usageLimits: {
        maxClubs: number;
        maxMembers: number;
        maxTrainers: number;
        maxStaffs: number;
      };
      features: Record<string, boolean | number>;
    };
  };
}

type AccessMeResponse = {
  status?: string;
  message?: string;
  data?: {
    role?: string | null;
    subscriptionPlan?: Record<string, unknown> | null;
    permissions?: Array<Record<string, unknown>> | null;
  } | null;
};

interface SelfOnboardingRequest {
  contactName: string;
  email: string;
  phoneNumber: string;
  gymName: string;
  gymLocation: string;
  region: string;
}

interface SelfOnboardingResponse {
  status: string;
  message: string;
  data: {
    email: string;
    contactName: string;
    phoneNumber: string;
  };
}

const normalizeLifecycle = (
  subscription: UserDetailsResponse['data']['subscription']
): SubscriptionLifecycle | null => {
  if (!subscription) return null;

  return {
    subscriptionId: subscription.subscriptionId,
    billingCycle: subscription.billingCycle,
    startDate: subscription.startDate,
    endDate: subscription.endDate,
    status: subscription.plan.status,
  };
};

const buildUserDetails = ({
  uid,
  payload,
  activeGym,
}: {
  uid: string;
  payload: UserDetailsResponse['data'];
  activeGym?: UserDetailsResponse['data']['clubs'][number];
}): AppUser => ({
  userId: payload.userId,
  userName: payload.userName,
  userEmail: payload.userEmail,
  userRole: payload.userRole,
  uid,
  photoURL: payload.photoPath ?? null,
  isMultiClub: payload.isMultiClub,
  gyms: activeGym
    ? [
        {
          gymId: activeGym.gymId,
          gymName: activeGym.gymName,
          gymLocation: activeGym.location,
        },
      ]
    : [],
  clubs: payload.clubs.map((club) => ({
    gymId: club.gymId,
    gymName: club.gymName,
    location: club.location,
    contactNumber1: club.contactNumber1,
    contactNumber2: club.contactNumber2,
    email: club.email,
    socialLinks: club.socialLinks,
    gymAdminId: club.gymAdminId,
    status: club.status,
    gymIdentifier: club.gymIdentifier,
    photoPath: club.photoPath,
  })),
});

const buildGymDetails = (
  activeGym?: UserDetailsResponse['data']['clubs'][number]
): GymDetails | null => {
  if (!activeGym) return null;

  return {
    id: activeGym.gymId,
    gymName: activeGym.gymName,
    location: activeGym.location,
    contactNumber1: activeGym.contactNumber1,
    contactNumber2: activeGym.contactNumber2,
    email: activeGym.email,
    socialLinks: activeGym.socialLinks,
    gymIdentifier: activeGym.gymIdentifier,
    gymAdminId: activeGym.gymAdminId,
    status: String(activeGym.status),
    photoPath: activeGym.photoPath,
  };
};

export const login = async (credentials: LoginRequest) => {
  try {
    const response = await api.post<LoginResponse>('/Auth/login', credentials, {
      skipAuth: true,
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed',
    };
  }
};

export const googleLogin = async (idToken: string) => {
  try {
    const response = await api.post<LoginResponse>(
      '/Auth/google-login',
      { idToken },
      { skipAuth: true }
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Google login error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Google login failed',
    };
  }
};

export const getUserByUid = async (uid: string, currentGymId?: number) => {
  try {
    const response = await api.get<UserDetailsResponse>(
      `/User/GetUserById/${uid}`
    );

    const activeGym =
      response.data.clubs.find((club) => club.status === 1) ||
      (currentGymId &&
        response.data.clubs.find((club) => club.gymId === currentGymId)) ||
      response.data.clubs[0];

    return {
      success: true,
      data: buildUserDetails({
        uid,
        payload: response.data,
        activeGym,
      }),
      gymDetails: buildGymDetails(activeGym),
      lifecycle: normalizeLifecycle(response.data.subscription),
      allClubs: response.data.clubs,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get user',
    };
  }
};

export const getAccessMe = async () => {
  try {
    const response = await api.get<AccessMeResponse>('/Access/me');
    const entitlements: AuthEntitlements = normalizeAccessMeData(
      response.data ?? null
    );

    return {
      success: true,
      data: entitlements,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to get access data',
    };
  }
};

export const fetchAppSession = async (
  uid: string,
  currentGymId?: number
): Promise<{ session: AppSession }> => {
  const [userResult, accessResult] = await Promise.all([
    getUserByUid(uid, currentGymId),
    getAccessMe(),
  ]);

  if (!userResult.success || !userResult.data) {
    throw new Error(userResult.error || 'Failed to get user');
  }

  if (!accessResult.success || !accessResult.data) {
    throw new Error(accessResult.error || 'Failed to get access data');
  }

  return {
    session: {
      user: userResult.data,
      gymDetails: userResult.gymDetails ?? null,
      entitlements: accessResult.data,
      subscriptionLifecycle: userResult.lifecycle ?? null,
    },
  };
};

export const switchClub = async (uid: string, gymId: number) => {
  try {
    await api.post('/User/clubSwitcher', { uid, gymId });
    return { success: true };
  } catch (error) {
    console.error('Switch club error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to switch club',
    };
  }
};

export const logout = () => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('appSession');
      localStorage.removeItem('appUser');
      localStorage.removeItem('gymDetails');
      localStorage.removeItem('gymBranch');

      document.cookie = 'accessToken=; path=/; max-age=0';
      document.cookie = 'refreshToken=; path=/; max-age=0';
    } catch (error) {
      console.error('Logout storage clear failed:', error);
    }
  }
  return { success: true };
};

export const forgotPassword = async (email: string) => {
  const response = await api.post(
    '/Auth/forgot-password',
    { email },
    { skipAuth: true }
  );
  return response;
};

export const verifyResetOtp = async (email: string, otp: string) => {
  const response = await api.post(
    '/Auth/verify-reset-otp',
    { email, otp },
    { skipAuth: true }
  );
  return response;
};

export const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string
) => {
  const response = await api.post(
    '/Auth/reset-password',
    { email, otp, newPassword },
    { skipAuth: true }
  );
  return response;
};

export const submitSelfOnboarding = async (payload: SelfOnboardingRequest) => {
  const response = await api.post<SelfOnboardingResponse>(
    '/User/SelfOnboarding',
    payload,
    { skipAuth: true }
  );

  return response;
};
