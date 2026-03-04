'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

import { useAuth } from './auth-provider';

// Global ref to access clearGymBranch from auth provider
let globalClearGymBranch: (() => void) | null = null;

type GymBranch = {
  gymId: number;
  gymName: string;
  gymLocation: string;
};

const getStoredGymBranch = (): GymBranch | null => {
  if (typeof window === 'undefined') return null;

  const storedGymBranch = localStorage.getItem('gymBranch');
  if (!storedGymBranch) return null;

  try {
    return JSON.parse(storedGymBranch) as GymBranch;
  } catch {
    localStorage.removeItem('gymBranch');
    return null;
  }
};

const GymBranchContext = createContext<
  | {
      gymBranch: GymBranch | null;
      setGymBranch: (gymBranch: GymBranch) => void;
      clearGymBranch: () => void;
    }
  | undefined
>(undefined);

// Gym Branch Provider
export const GymBranchProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [storedGymBranch, setStoredGymBranch] = useState<GymBranch | null>(
    getStoredGymBranch
  );
  const { user } = useAuth();

  const gymBranch = React.useMemo(() => {
    if (user?.gyms && user.gyms.length > 0) {
      return {
        gymId: user.gyms[0].gymId,
        gymName: user.gyms[0].gymName,
        gymLocation: user.gyms[0].gymLocation,
      };
    }

    if (user === null) {
      return null;
    }

    return storedGymBranch;
  }, [storedGymBranch, user]);

  const handleSetGymBranch = React.useCallback((gymBranch: GymBranch) => {
    setStoredGymBranch(gymBranch);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gymBranch', JSON.stringify(gymBranch));
    }
  }, []);

  const clearGymBranch = React.useCallback(() => {
    setStoredGymBranch(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gymBranch');
    }
  }, []);

  // Expose clearGymBranch globally
  useEffect(() => {
    globalClearGymBranch = clearGymBranch;
    return () => {
      globalClearGymBranch = null;
    };
  }, [clearGymBranch]);

  // Keep localStorage synchronized with auth-derived gym branch.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (user?.gyms && user.gyms.length > 0) {
      localStorage.setItem('gymBranch', JSON.stringify(gymBranch));
      return;
    }

    if (user === null) {
      localStorage.removeItem('gymBranch');
    }
  }, [gymBranch, user]);

  return (
    <GymBranchContext.Provider
      value={{ gymBranch, setGymBranch: handleSetGymBranch, clearGymBranch }}
    >
      {children}
    </GymBranchContext.Provider>
  );
};

// Custom hook to use the GymBranchContext
export const useGymBranch = () => {
  const context = useContext(GymBranchContext);
  if (!context) {
    throw new Error('useGymBranch must be used within a GymBranchProvider');
  }
  return context;
};

// Export function to clear gym branch from outside the context
export const clearGymBranchGlobally = () => {
  if (globalClearGymBranch) {
    globalClearGymBranch();
  }
};
