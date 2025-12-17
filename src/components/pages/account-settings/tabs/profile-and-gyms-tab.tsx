'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { motion } from 'framer-motion';
import { Building2, Check, User } from 'lucide-react';
import { Shield } from 'lucide-react';

import { BusinessProfileTab } from '@/components/pages/account-settings/tabs/business-profile-tab';
import OperationsTab from '@/components/pages/account-settings/tabs/operations-tab';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/providers/auth-provider';
import { useGymBranch } from '@/providers/gym-branch-provider';

// Context to override gym ID for viewing only (not switching)
const ViewGymContext = createContext<{ viewGymId: number | null }>({
  viewGymId: null,
});

export const useViewGymId = () => {
  const context = useContext(ViewGymContext);
  return context.viewGymId;
};

export function ProfileAndGymsTab() {
  const { user } = useAuth();
  const { gymBranch } = useGymBranch();
  const isMultiClub = user?.isMultiClub ?? false;
  const [selectedGymId, setSelectedGymId] = useState<number | null>(
    () => gymBranch?.gymId || user?.clubs?.[0]?.gymId || null
  );

  const handleSelectGym = (gymId: number) => {
    setSelectedGymId(gymId);
  };
  // Only sync with global gym on initial mount
  useEffect(() => {
    if (gymBranch?.gymId) {
      setSelectedGymId(gymBranch.gymId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contextValue = useMemo(
    () => ({ viewGymId: selectedGymId }),
    [selectedGymId]
  );

  // Single gym layout
  if (!isMultiClub) {
    return (
      <ViewGymContext.Provider value={contextValue}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Tabs defaultValue="business" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="business">Business Profile</TabsTrigger>
              <TabsTrigger value="operations">Operations</TabsTrigger>
            </TabsList>
            <TabsContent value="business">
              <BusinessProfileTab />
            </TabsContent>
            <TabsContent value="operations">
              <OperationsTab />
            </TabsContent>
          </Tabs>
        </motion.div>
      </ViewGymContext.Provider>
    );
  }

  // Multi-gym layout
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Sidebar - Combined Profile & Gym Card */}
      <div className="lg:col-span-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-white dark:bg-secondary-blue-500 border-gray-200 dark:border-secondary-blue-400 overflow-hidden">
            {/* Profile Section */}
            <div className="relative px-5 pt-5 pb-4">
              {/* Role Badge - Top Right */}
              <div className="absolute top-4 right-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-green-500/10 text-primary-green-600 dark:text-primary-green-400 text-xs font-medium border border-primary-green-500/20">
                  <Shield className="h-3 w-3" />
                  {user?.userRole}
                </div>
              </div>

              {/* Avatar and Info */}
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <div className="absolute -inset-1 rounded-full bg-primary-green-500/20 blur-lg opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="absolute -inset-0.5 rounded-full bg-linear-to-br from-primary-green-500 via-primary-green-500/50 to-primary-green-600 opacity-80" />
                  <Avatar className="relative size-16 border-2 border-white dark:border-secondary-blue-500">
                    <AvatarImage src={user?.photoURL} alt={user?.userName} />
                    <AvatarFallback className="bg-primary-green-500/10">
                      <User className="w-8 h-8 text-primary-green-500" />
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                  <h2 className="text-base font-bold text-gray-900 dark:text-white tracking-tight truncate">
                    {user?.userName}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-secondary-blue-200 truncate">
                    {user?.userEmail}
                  </p>
                </div>
              </div>
            </div>

            {/* Gym List Section */}
            {user?.clubs && user.clubs.length > 0 && (
              <div className="px-5 pb-5 pt-3 border-t border-gray-200 dark:border-secondary-blue-400">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-secondary-blue-300 px-1 mb-2">
                  {user.clubs.length === 1 ? 'Home Gym' : 'Your Gyms'}
                </p>
                <div className="space-y-1.5">
                  {user.clubs.map((club, index) => {
                    const isSelected = club.gymId === selectedGymId;
                    return (
                      <motion.button
                        key={club.gymId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        onClick={() => handleSelectGym(club.gymId)}
                        className={`group/gym flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-300 ${
                          isSelected
                            ? 'bg-primary-green-500/15 ring-1 ring-primary-green-500/30'
                            : 'hover:bg-gray-100 dark:hover:bg-secondary-blue-600'
                        }`}
                      >
                        <Avatar
                          className={`size-10 shrink-0 transition-all duration-300 ${
                            isSelected ? 'ring-2 ring-primary-green-500/50' : ''
                          }`}
                        >
                          <AvatarImage
                            src={club.photoPath || undefined}
                            alt={club.gymName}
                          />
                          <AvatarFallback className="bg-gray-200 dark:bg-secondary-blue-400 text-xs font-bold text-gray-600 dark:text-secondary-blue-200">
                            {club.gymName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-medium truncate text-sm transition-colors duration-300 ${
                              isSelected
                                ? 'text-primary-green-600 dark:text-primary-green-400'
                                : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            {club.gymName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-secondary-blue-300 truncate">
                            {club.location}
                          </p>
                          <p className="text-[10px] text-gray-400 dark:text-secondary-blue-400 font-mono">
                            ID: {club.gymIdentifier}
                          </p>
                        </div>

                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                            isSelected
                              ? 'bg-primary-green-500 text-white scale-100'
                              : 'bg-gray-200 dark:bg-secondary-blue-400 scale-90 opacity-0 group-hover/gym:opacity-50'
                          }`}
                        >
                          <Check className="h-3 w-3" />
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Right Panel - Gym Details */}
      <div className="lg:col-span-8">
        {selectedGymId ? (
          <ViewGymContext.Provider value={contextValue}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Tabs defaultValue="business" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="business">Business Profile</TabsTrigger>
                  <TabsTrigger value="operations">Operations</TabsTrigger>
                </TabsList>
                <TabsContent value="business">
                  <BusinessProfileTab />
                </TabsContent>
                <TabsContent value="operations">
                  <OperationsTab />
                </TabsContent>
              </Tabs>
            </motion.div>
          </ViewGymContext.Provider>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white dark:bg-secondary-blue-500 border-gray-200 dark:border-secondary-blue-400">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="size-16 rounded-full bg-primary-green-500/10 flex items-center justify-center mb-4">
                  <Building2 className="h-8 w-8 text-primary-green-500" />
                </div>
                <p className="text-gray-600 dark:text-secondary-blue-200 text-center font-medium">
                  Select a gym to manage
                </p>
                <p className="text-xs text-gray-500 dark:text-secondary-blue-300 text-center mt-1">
                  Choose from your gyms on the left
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
