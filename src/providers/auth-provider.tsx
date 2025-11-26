'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

import {
  User as FirebaseUser,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getIdToken,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';

import { api } from '@/lib/api';
import { decrypt, encrypt } from '@/lib/crypto';
import { auth } from '@/lib/firebase';
import { createSession, deleteSession } from '@/services/auth/session';
import { fetchGymById } from '@/services/gym';
import { GymDetails } from '@/types/gym';

const AuthContext = createContext<
  | {
      firebaseUser: FirebaseUser | null;
      appUser: AppUser | null;
      gymDetails: GymDetails | null;
      isAuthLoading: boolean;
      isAppUserLoading: boolean;
      signIn: (options: SignInOptions) => Promise<void>;
      logout: () => Promise<void>;
      fetchGymDetails: (gymId: number) => Promise<void>;
      refreshAppUser: () => Promise<void>;
    }
  | undefined
>(undefined);

type SignInOptions =
  | { method: 'register'; email: string; password: string }
  | { method: 'login'; email: string; password: string }
  | { method: 'oauth'; provider: 'google' };

interface AppUser {
  userId: number;
  userName: string;
  userEmail: string;
  userRole: string;
  gyms: {
    gymId: number;
    gymName: string;
    gymLocation: string;
    gymIdentifier: string;
  }[];
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [gymDetails, setGymDetails] = useState<GymDetails | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAppUserLoading, setIsAppUserLoading] = useState(false);

  // Load cached data immediately
  useEffect(() => {
    const encryptedUser = localStorage.getItem('appUser');
    if (encryptedUser) {
      try {
        const decryptedData = decrypt(encryptedUser);
        if (decryptedData) {
          const userData = JSON.parse(decryptedData) as AppUser;
          setAppUser(userData);
          if (userData.gyms.length > 0) {
            localStorage.setItem('gymBranch', JSON.stringify(userData.gyms[0]));
            fetchGymDetailsInternal(userData.gyms[0].gymId);
          }
        }
      } catch (error) {
        console.warn('Failed to load cached user:', error);
      }
    }
  }, []);

  // Fetch the appUser from the backend
  const fetchAppUser = async (uid: string, forceRefresh = false) => {
    setIsAppUserLoading(true);
    try {
      // Try to get cached user data first
      if (!forceRefresh) {
        const encryptedUser = localStorage.getItem('appUser');
        if (encryptedUser) {
          const decryptedData = decrypt(encryptedUser);
          if (decryptedData) {
            const userData = JSON.parse(decryptedData) as AppUser;
            setAppUser(userData);
            if (userData.gyms.length > 0) {
              localStorage.setItem(
                'gymBranch',
                JSON.stringify(userData.gyms[0])
              );
              // Fetch gym details in parallel, don't await
              fetchGymDetailsInternal(userData.gyms[0].gymId);
            }
            setIsAppUserLoading(false);
            return;
          }
        }
      }

      // Fetch from API if not cached or force refresh
      const response = await api.get<{
        status: string;
        message: string;
        data: AppUser;
      }>(`/User/GetUserById/${uid}`);

      setAppUser(response.data);
      localStorage.setItem('appUser', encrypt(JSON.stringify(response.data)));

      if (response.data.gyms.length > 0) {
        localStorage.setItem(
          'gymBranch',
          JSON.stringify(response.data.gyms[0])
        );
        // Fetch gym details in parallel, don't await
        fetchGymDetailsInternal(response.data.gyms[0].gymId);
      }
    } catch (error) {
      console.error('Failed to fetch app user:', error);
      setAppUser(null);
    } finally {
      setIsAppUserLoading(false);
    }
  };

  const fetchGymDetailsInternal = async (gymId: number) => {
    try {
      const details = await fetchGymById(gymId);
      setGymDetails(details);
    } catch (error) {
      console.error('Failed to fetch gym details:', error);
      setGymDetails(null);
    }
  };

  // Watch Firebase user changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      setIsAuthLoading(false);

      if (firebaseUser) {
        try {
          const idToken = await getIdToken(firebaseUser);
          await createSession(idToken);
          await fetchAppUser(firebaseUser.uid);
        } catch (error) {
          console.error('Failed to handle Firebase user change:', error);
          setIsAppUserLoading(false);
        }
      } else {
        setAppUser(null);
        setGymDetails(null);
        setIsAppUserLoading(false);
      }
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async (options: SignInOptions) => {
    try {
      switch (options.method) {
        case 'register': {
          const { email, password } = options;
          const { user } = await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );
          const idToken = await getIdToken(user);
          await createSession(idToken);
          await fetchAppUser(user.uid, true);
          break;
        }
        case 'login': {
          const { email, password } = options;
          const { user } = await signInWithEmailAndPassword(
            auth,
            email,
            password
          );
          const idToken = await getIdToken(user);
          await createSession(idToken);
          await fetchAppUser(user.uid, true);
          break;
        }
        case 'oauth': {
          if (options.provider === 'google') {
            const provider = new GoogleAuthProvider();
            const { user } = await signInWithPopup(auth, provider);
            const idToken = await getIdToken(user);
            await createSession(idToken);
            await fetchAppUser(user.uid, true);
          }
          break;
        }
        default:
          throw new Error('Unsupported sign-in method');
      }
    } catch (error) {
      console.error('Failed to sign in:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear states first to prevent re-renders
      setAppUser(null);
      setGymDetails(null);

      // Clear localStorage
      localStorage.removeItem('gymBranch');
      localStorage.removeItem('appUser');

      // Sign out from Firebase (this will trigger onAuthStateChanged)
      await signOut(auth);

      // Clear session
      await deleteSession();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const refreshAppUser = async () => {
    if (firebaseUser) {
      await fetchAppUser(firebaseUser.uid, true);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        appUser,
        gymDetails,
        isAuthLoading,
        isAppUserLoading,
        signIn,
        logout,
        fetchGymDetails: fetchGymDetailsInternal,
        refreshAppUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
