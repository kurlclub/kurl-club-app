'use client';

import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useEffect, useState } from 'react';

import {
  APP_SESSION_STORAGE_KEY,
  LEGACY_GYM_DETAILS_STORAGE_KEY,
  LEGACY_USER_STORAGE_KEY,
  resolveStoredAppSession,
  serializeStoredAppSession,
} from '@/lib/auth-session';
import {
  fetchAppSession,
  googleLogin,
  login,
  logout as logoutApi,
  switchClub as switchClubApi,
} from '@/services/auth/auth';
import type { AppSession, AppUser, AuthEntitlements } from '@/types/access';
import type { GymDetails } from '@/types/gym';
import type { SubscriptionLifecycle } from '@/types/subscription';

interface AuthContextType {
  user: AppUser | null;
  gymDetails: GymDetails | null;
  entitlements: AuthEntitlements | null;
  subscriptionLifecycle: SubscriptionLifecycle | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (
    idToken: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshGymDetails: () => Promise<void>;
  switchClub: (gymId: number) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const clearSessionStorage = () => {
  try {
    localStorage.removeItem(APP_SESSION_STORAGE_KEY);
    localStorage.removeItem(LEGACY_USER_STORAGE_KEY);
    localStorage.removeItem(LEGACY_GYM_DETAILS_STORAGE_KEY);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  } catch (error) {
    console.error('Failed to clear session storage:', error);
  }
};

const persistCurrentGymBranch = (session: AppSession | null) => {
  if (typeof window === 'undefined') return;
  if (session?.user?.gyms?.length) {
    localStorage.setItem('gymBranch', JSON.stringify(session.user.gyms[0]));
    return;
  }
  if (!session?.user) {
    localStorage.removeItem('gymBranch');
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [gymDetails, setGymDetails] = useState<GymDetails | null>(null);
  const [entitlements, setEntitlements] = useState<AuthEntitlements | null>(
    null
  );
  const [subscriptionLifecycle, setSubscriptionLifecycle] =
    useState<SubscriptionLifecycle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const persistSession = React.useCallback((session: AppSession | null) => {
    if (typeof window === 'undefined') return;

    try {
      if (session) {
        localStorage.setItem(
          APP_SESSION_STORAGE_KEY,
          serializeStoredAppSession(session)
        );
        localStorage.removeItem(LEGACY_USER_STORAGE_KEY);
        localStorage.removeItem(LEGACY_GYM_DETAILS_STORAGE_KEY);
      } else {
        localStorage.removeItem(APP_SESSION_STORAGE_KEY);
        localStorage.removeItem(LEGACY_USER_STORAGE_KEY);
        localStorage.removeItem(LEGACY_GYM_DETAILS_STORAGE_KEY);
      }
      persistCurrentGymBranch(session);
    } catch (storageError) {
      console.error('Failed to store app session:', storageError);
    }
  }, []);

  const applySession = React.useCallback((session: AppSession | null) => {
    setUser(session?.user ?? null);
    setGymDetails(session?.gymDetails ?? null);
    setEntitlements(session?.entitlements ?? null);
    setSubscriptionLifecycle(session?.subscriptionLifecycle ?? null);
  }, []);

  const refreshSession = React.useCallback(
    async (uid: string, currentGymId?: number) => {
      const result = await fetchAppSession(uid, currentGymId);
      applySession(result.session);
      persistSession(result.session);
      return result.session;
    },
    [applySession, persistSession]
  );

  useEffect(() => {
    const hydrateSession = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const resolvedSession = resolveStoredAppSession({
          encryptedSession: localStorage.getItem(APP_SESSION_STORAGE_KEY),
          encryptedLegacyUser: localStorage.getItem(LEGACY_USER_STORAGE_KEY),
          encryptedLegacyGymDetails: localStorage.getItem(
            LEGACY_GYM_DETAILS_STORAGE_KEY
          ),
        });

        if (resolvedSession.session) {
          applySession(resolvedSession.session);
          if (resolvedSession.didMigrateLegacyState) {
            persistSession(resolvedSession.session);
          }
        }

        if (!accessToken) {
          setIsLoading(false);
          return;
        }

        const uid = resolvedSession.session?.user?.uid;
        if (!uid) {
          clearSessionStorage();
          applySession(null);
          setIsLoading(false);
          return;
        }

        const currentGymId = resolvedSession.session?.user?.gyms?.[0]?.gymId;
        await refreshSession(uid, currentGymId);
      } catch (error) {
        console.warn('Failed to hydrate session:', error);
        clearSessionStorage();
        applySession(null);
      } finally {
        setIsLoading(false);
      }
    };

    void hydrateSession();
  }, [applySession, persistSession, refreshSession]);

  const handleLogin = async (email: string, password: string) => {
    try {
      const result = await login({ email, password });

      if (!result.success || !result.data) {
        return { success: false, error: result.error || 'Login failed' };
      }

      const { accessToken, refreshToken, user: loginUser } = result.data;

      if (!accessToken || !refreshToken || !loginUser?.uid) {
        return { success: false, error: 'Invalid login response' };
      }

      try {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        document.cookie = `accessToken=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
        document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Strict`;
      } catch (storageError) {
        console.error('Failed to store tokens:', storageError);
        return { success: false, error: 'Failed to save session' };
      }

      const session = await refreshSession(loginUser.uid);
      if (!session.user) {
        return { success: false, error: 'Failed to fetch user details' };
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const handleGoogleLogin = async (idToken: string) => {
    try {
      const result = await googleLogin(idToken);

      if (!result.success || !result.data) {
        return { success: false, error: result.error || 'Google login failed' };
      }

      const { accessToken, refreshToken, user: loginUser } = result.data;

      if (!accessToken || !refreshToken || !loginUser?.uid) {
        return { success: false, error: 'Invalid login response' };
      }

      try {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        document.cookie = `accessToken=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
        document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Strict`;
      } catch (storageError) {
        console.error('Failed to store tokens:', storageError);
        return { success: false, error: 'Failed to save session' };
      }

      const session = await refreshSession(loginUser.uid);
      if (!session.user) {
        return { success: false, error: 'Failed to fetch user details' };
      }

      return { success: true };
    } catch (error) {
      console.error('Google login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const handleLogout = () => {
    logoutApi();
    document.cookie = 'accessToken=; path=/; max-age=0';
    document.cookie = 'refreshToken=; path=/; max-age=0';
    applySession(null);
    localStorage.removeItem('gymBranch');
    router.push('/auth/login');
  };

  const handleSwitchClub = async (gymId: number) => {
    if (!user?.uid) {
      return { success: false, error: 'User not logged in' };
    }

    try {
      const result = await switchClubApi(user.uid, gymId);
      if (result.success) {
        await refreshSession(user.uid, gymId);
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Switch club error:', error);
      return { success: false, error: 'Failed to switch club' };
    }
  };

  const refreshUser = React.useCallback(async () => {
    if (!user?.uid) return;
    const currentGymId = user.gyms?.[0]?.gymId;
    await refreshSession(user.uid, currentGymId);
  }, [refreshSession, user]);

  const refreshGymDetails = React.useCallback(async () => {
    if (!user?.uid) return;
    const currentGymId = user.gyms?.[0]?.gymId;
    await refreshSession(user.uid, currentGymId);
  }, [refreshSession, user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        gymDetails,
        entitlements,
        subscriptionLifecycle,
        isLoading,
        login: handleLogin,
        loginWithGoogle: handleGoogleLogin,
        logout: handleLogout,
        refreshUser,
        refreshGymDetails,
        switchClub: handleSwitchClub,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
