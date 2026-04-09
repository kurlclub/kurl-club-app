'use client';

import { type ReactNode, createContext, useContext } from 'react';

import { useAuth } from '@/providers/auth-provider';
import { useGymBranch } from '@/providers/gym-branch-provider';

import { resolveSettingsGymId } from './selection-utils';

interface SettingsGymContextValue {
  settingsGymId: number | null;
}

const SettingsGymContext = createContext<SettingsGymContextValue>({
  settingsGymId: null,
});

interface SettingsGymScopeProviderProps {
  children: ReactNode;
  settingsGymId: number | null;
}

export const SettingsGymScopeProvider = ({
  children,
  settingsGymId,
}: SettingsGymScopeProviderProps) => {
  return (
    <SettingsGymContext.Provider value={{ settingsGymId }}>
      {children}
    </SettingsGymContext.Provider>
  );
};

const useLocalSettingsGymId = () => {
  const context = useContext(SettingsGymContext);
  return context.settingsGymId;
};

export const useSettingsGymId = () => {
  const localSettingsGymId = useLocalSettingsGymId();
  const { gymBranch } = useGymBranch();
  const { user } = useAuth();

  return resolveSettingsGymId({
    localSettingsGymId,
    globalGymId: gymBranch?.gymId,
    clubGymIds: user?.clubs?.map((club) => club.gymId),
  });
};
