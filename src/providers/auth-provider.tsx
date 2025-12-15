'use client';

import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { decrypt, encrypt } from '@/lib/crypto';
import {
  getUserByUid,
  login,
  logout as logoutApi,
  switchClub as switchClubApi,
} from '@/services/auth/auth';
import { GymDetails } from '@/types/gym';

interface AppUser {
  userId: number;
  userName: string;
  userEmail: string;
  userRole: string;
  uid: string;
  photoURL?: string;
  isMultiClub: boolean;
  gyms: Array<{
    gymId: number;
    gymName: string;
    gymLocation: string;
  }>;
  clubs: Array<{
    gymId: number;
    gymName: string;
    location: string;
    status: number;
    gymIdentifier: string;
    photoPath: string | null;
  }>;
}

interface AuthContextType {
  user: AppUser | null;
  appUser: AppUser | null;
  gymDetails: GymDetails | null;
  isLoading: boolean;
  isAuthLoading: boolean;
  isAppUserLoading: boolean;
  login: (
    userName: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshGymDetails: () => Promise<void>;
  switchClub: (gymId: number) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [gymDetails, setGymDetails] = useState<GymDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load cached user on mount
  useEffect(() => {
    const loadCachedUser = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const encryptedUser = localStorage.getItem('appUser');
        const encryptedGymDetails = localStorage.getItem('gymDetails');

        if (token && encryptedUser) {
          const decryptedData = decrypt(encryptedUser);
          if (decryptedData) {
            const userData = JSON.parse(decryptedData) as AppUser;
            setUser(userData);

            if (encryptedGymDetails) {
              const decryptedGymDetails = decrypt(encryptedGymDetails);
              if (decryptedGymDetails) {
                setGymDetails(JSON.parse(decryptedGymDetails));
              }
            }

            if (userData.gyms?.length > 0) {
              localStorage.setItem(
                'gymBranch',
                JSON.stringify(userData.gyms[0])
              );
            }
          }
        }
      } catch (error) {
        console.warn('Failed to load cached user:', error);
        try {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('appUser');
          localStorage.removeItem('gymBranch');
        } catch (e) {
          console.error('Failed to clear storage:', e);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadCachedUser();
  }, []);

  const fetchGymDetailsInternal = async () => {
    if (!user?.uid) return;

    try {
      const currentGymId = user.gyms?.[0]?.gymId;
      const userResult = await getUserByUid(user.uid, currentGymId);
      if (userResult.success && userResult.activeGymDetails) {
        const gymDetails: GymDetails = {
          id: userResult.activeGymDetails.gymId,
          gymName: userResult.activeGymDetails.gymName,
          location: userResult.activeGymDetails.location,
          contactNumber1: userResult.activeGymDetails.contactNumber1,
          contactNumber2: userResult.activeGymDetails.contactNumber2,
          email: userResult.activeGymDetails.email,
          socialLinks: userResult.activeGymDetails.socialLinks,
          gymIdentifier: userResult.activeGymDetails.gymIdentifier,
          gymAdminId: userResult.activeGymDetails.gymAdminId,
          status: String(userResult.activeGymDetails.status),
          photoPath: userResult.activeGymDetails.photoPath,
        };
        setGymDetails(gymDetails);
        localStorage.setItem('gymDetails', encrypt(JSON.stringify(gymDetails)));
      }
    } catch (error) {
      console.error('Failed to fetch gym details:', error);
    }
  };

  const handleLogin = async (userName: string, password: string) => {
    try {
      const result = await login({ userName, password });

      if (!result.success || !result.data) {
        return { success: false, error: result.error || 'Login failed' };
      }

      const { accessToken, refreshToken, user: loginUser } = result.data;

      if (!accessToken || !refreshToken || !loginUser?.uid) {
        return { success: false, error: 'Invalid login response' };
      }

      // Store tokens in both localStorage and cookies
      try {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // Set cookies for middleware
        document.cookie = `accessToken=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
        document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Strict`;
      } catch (storageError) {
        console.error('Failed to store tokens:', storageError);
        return { success: false, error: 'Failed to save session' };
      }

      // Fetch full user details
      const userResult = await getUserByUid(loginUser.uid);

      if (!userResult.success || !userResult.data) {
        return { success: false, error: 'Failed to fetch user details' };
      }

      const fullUser: AppUser = {
        ...userResult.data,
        uid: loginUser.uid,
        photoURL: loginUser.photoURL,
        clubs: userResult.allClubs || [],
      };

      setUser(fullUser);

      try {
        localStorage.setItem('appUser', encrypt(JSON.stringify(fullUser)));

        if (fullUser.gyms?.length > 0) {
          localStorage.setItem('gymBranch', JSON.stringify(fullUser.gyms[0]));
        }

        if (userResult.activeGymDetails) {
          const gymDetails: GymDetails = {
            id: userResult.activeGymDetails.gymId,
            gymName: userResult.activeGymDetails.gymName,
            location: userResult.activeGymDetails.location,
            contactNumber1: userResult.activeGymDetails.contactNumber1,
            contactNumber2: userResult.activeGymDetails.contactNumber2,
            email: userResult.activeGymDetails.email,
            socialLinks: userResult.activeGymDetails.socialLinks,
            gymIdentifier: userResult.activeGymDetails.gymIdentifier,
            gymAdminId: userResult.activeGymDetails.gymAdminId,
            status: String(userResult.activeGymDetails.status),
            photoPath: userResult.activeGymDetails.photoPath,
          };
          setGymDetails(gymDetails);
          localStorage.setItem(
            'gymDetails',
            encrypt(JSON.stringify(gymDetails))
          );
        }
      } catch (storageError) {
        console.error('Failed to store user data:', storageError);
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const handleLogout = () => {
    logoutApi();

    // Clear cookies
    document.cookie = 'accessToken=; path=/; max-age=0';
    document.cookie = 'refreshToken=; path=/; max-age=0';

    localStorage.removeItem('gymDetails');

    setUser(null);
    setGymDetails(null);
    router.push('/auth/login');
  };

  const handleSwitchClub = async (gymId: number) => {
    if (!user?.uid) {
      return { success: false, error: 'User not logged in' };
    }

    try {
      const result = await switchClubApi(user.uid, gymId);
      if (result.success) {
        await refreshUser();
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Switch club error:', error);
      return { success: false, error: 'Failed to switch club' };
    }
  };

  const refreshUser = async () => {
    if (user?.uid) {
      const currentGymId = user.gyms?.[0]?.gymId;
      const result = await getUserByUid(user.uid, currentGymId);
      if (result.success && result.data) {
        const updatedUser: AppUser = {
          ...result.data,
          uid: user.uid,
          photoURL: user.photoURL,
          clubs: result.allClubs || [],
        };
        setUser(updatedUser);
        localStorage.setItem('appUser', encrypt(JSON.stringify(updatedUser)));

        if (result.activeGymDetails) {
          const gymDetails: GymDetails = {
            id: result.activeGymDetails.gymId,
            gymName: result.activeGymDetails.gymName,
            location: result.activeGymDetails.location,
            contactNumber1: result.activeGymDetails.contactNumber1,
            contactNumber2: result.activeGymDetails.contactNumber2,
            email: result.activeGymDetails.email,
            socialLinks: result.activeGymDetails.socialLinks,
            gymIdentifier: result.activeGymDetails.gymIdentifier,
            gymAdminId: result.activeGymDetails.gymAdminId,
            status: String(result.activeGymDetails.status),
            photoPath: result.activeGymDetails.photoPath,
          };
          setGymDetails(gymDetails);
          localStorage.setItem(
            'gymDetails',
            encrypt(JSON.stringify(gymDetails))
          );
        }
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        appUser: user,
        gymDetails,
        isLoading,
        isAuthLoading: isLoading,
        isAppUserLoading: isLoading,
        login: handleLogin,
        logout: handleLogout,
        refreshUser,
        refreshGymDetails: fetchGymDetailsInternal,
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
