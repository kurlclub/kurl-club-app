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
    };
  } catch (error) {
    console.error('Get user error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get user',
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

// TODO: Implement when backend API is ready
export const forgotPassword = async (email: string) => {
  try {
    // const response = await api.post('/Auth/forgot-password', { email }, { skipAuth: true });
    // return { success: true, message: response.message };
    return { success: true, message: 'Password reset email sent' };
  } catch (error) {
    console.error('Forgot password error:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to send reset email',
    };
  }
};

// TODO: Implement when backend API is ready
export const resetPassword = async (token: string, newPassword: string) => {
  try {
    // const response = await api.post('/Auth/reset-password', { token, newPassword }, { skipAuth: true });
    // return { success: true, message: response.message };
    return { success: true, message: 'Password reset successful' };
  } catch (error) {
    console.error('Reset password error:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to reset password',
    };
  }
};
