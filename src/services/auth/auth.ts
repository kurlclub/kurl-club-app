import { api } from '@/lib/api';

interface LoginRequest {
  userName: string;
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
    userRole: string;
    isMultiClub: boolean;
    clubs: Array<{
      gymId: number;
      gymName: string;
      location: string;
      contactNumber1: string;
      contactNumber2: string | null;
      email: string;
      socialLinks: string;
      gymAdminId: number;
      status: number;
      gymIdentifier: string;
      photoPath: string | null;
    }>;
  };
}

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

export const getUserByUid = async (uid: string, currentGymId?: number) => {
  try {
    const response = await api.get<UserDetailsResponse>(
      `/User/GetUserById/${uid}`
    );

    // Find active gym: status=1, or by currentGymId, or first gym
    const activeGym =
      response.data.clubs.find((club) => club.status === 1) ||
      (currentGymId &&
        response.data.clubs.find((club) => club.gymId === currentGymId)) ||
      response.data.clubs[0];

    return {
      success: true,
      data: {
        ...response.data,
        gyms: activeGym
          ? [
              {
                gymId: activeGym.gymId,
                gymName: activeGym.gymName,
                gymLocation: activeGym.location,
              },
            ]
          : [],
      },
      activeGymDetails: activeGym,
      allClubs: response.data.clubs,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get user',
    };
  }
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
      localStorage.removeItem('appUser');
      localStorage.removeItem('gymBranch');

      // Clear cookies
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
