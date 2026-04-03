'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { Badge } from '@kurlclub/ui-components';
import { motion } from 'framer-motion';
import { Building2, Check, Plus, User } from 'lucide-react';

import { BusinessProfileTab } from '@/components/pages/account-settings/tabs/business-profile-tab';
import OperationsTab from '@/components/pages/account-settings/tabs/operations-tab';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSubscriptionAccess } from '@/hooks/use-subscription-access';
import { useAuth } from '@/providers/auth-provider';
import { useGymBranch } from '@/providers/gym-branch-provider';

import AddGym from './add-gym';

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
  const { requireLimitAccess, usageLimits } = useSubscriptionAccess();
  const { gymBranch } = useGymBranch();
  const [isAddGymSheetOpen, setIsAddGymSheetOpen] = useState(false);
  const [selectedGymId, setSelectedGymId] = useState<number | null>(
    () => gymBranch?.gymId || user?.clubs?.[0]?.gymId || null
  );
  const clubCount = user?.clubs?.length ?? 0;
  const maxClubs = usageLimits.maxClubs;
  const finiteMaxClubs =
    typeof maxClubs === 'number' && Number.isFinite(maxClubs) && maxClubs > 0
      ? maxClubs
      : null;
  const hasFiniteClubLimit = finiteMaxClubs !== null;
  const isClubLimitReached =
    finiteMaxClubs !== null && clubCount >= finiteMaxClubs;

  const handleSelectGym = (gymId: number) => {
    setSelectedGymId(gymId);
  };

  const handleOpenAddGym = () => {
    const allowed = requireLimitAccess('maxClubs', clubCount, {
      title: 'Club limit reached',
      message: 'Upgrade your plan to add more clubs.',
    });

    if (!allowed) return;
    setIsAddGymSheetOpen(true);
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Sidebar - Combined Profile & Gym Card */}
      <motion.div
        className="lg:col-span-4 lg:sticky lg:top-22 self-start"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-secondary-blue-500 border-secondary-blue-400 overflow-hidden">
          {/* Profile Section */}
          <div className="relative py-2 px-4">
            {/* Avatar and Info */}
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <Avatar className="relative size-10 border-2 border-white/50 rounded-lg">
                  <AvatarImage
                    src={user?.photoURL || undefined}
                    alt={user?.userName}
                  />
                  <AvatarFallback className="">
                    <User className="w-5 h-5 text-white/50" />
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex justify-between w-full items-start flex-wrap gap-2">
                <div className="flex flex-col gap-.5">
                  <h2 className="text-[14px] font-semibold text-white tracking-tight truncate">
                    {user?.userName}
                  </h2>
                  <p className="text-sm text-secondary-blue-200 truncate">
                    {user?.userEmail}
                  </p>
                </div>
                {/* Role Badge - Top Right */}
                <Badge variant="secondary" className="w-fit mt-0">
                  {user?.userRole}
                </Badge>
              </div>
            </div>
          </div>

          {/* Gym List Section */}
          {user?.clubs && user.clubs.length > 0 && (
            <div className="px-4 py-2 pb-3 border-t border-secondary-blue-400">
              <p className="text-xs font-medium uppercase tracking-wider text-secondary-blue-300 px-1 mb-1">
                {user.clubs.length === 1 ? 'Your Club' : 'Your Clubs'}
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
                      className={`group/gym flex w-full items-center gap-3 rounded-lg p-2 text-left transition-all duration-300 ${
                        isSelected
                          ? 'bg-primary-green-500/10 ring-1 ring-primary-green-500/30'
                          : 'hover:bg-secondary-blue-600'
                      }`}
                    >
                      <Avatar
                        className={`size-10 shrink-0 transition-all duration-300 rounded-lg ${
                          isSelected ? 'ring-2 ring-primary-green-500/50' : ''
                        }`}
                      >
                        <AvatarImage
                          src={club.photoPath || undefined}
                          alt={club.gymName}
                        />
                        <AvatarFallback className="bg-secondary-blue-400 text-xs font-bold text-secondary-blue-200">
                          {club.gymName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-medium truncate text-sm transition-colors duration-300 ${
                            isSelected ? 'text-primary-green-400' : 'text-white'
                          }`}
                        >
                          {club.gymName}
                        </p>
                        <p className="text-xs text-secondary-blue-100 truncate">
                          {club.location}
                        </p>
                        <p className="text-[10px] text-secondary-blue-100 font-mono">
                          ID: {club.gymIdentifier}
                        </p>
                      </div>

                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                          isSelected
                            ? 'bg-primary-green-500/40 text-white scale-100'
                            : 'bg-secondary-blue-400 scale-90 opacity-0 group-hover/gym:opacity-50'
                        }`}
                      >
                        <Check className={`h-3 w-3`} />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Right Panel - Gym Details */}
      <div className="lg:col-span-8">
        <Card className="mb-4 bg-secondary-blue-500 border-secondary-blue-400">
          <CardContent className="py-4 px-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-white text-sm font-semibold">
                Need another location?
              </p>
              <p className="text-xs text-secondary-blue-200 mt-0.5">
                {hasFiniteClubLimit
                  ? `You are using ${clubCount} out of ${finiteMaxClubs} clubs in your current plan.`
                  : `You currently manage ${clubCount} clubs.`}
              </p>
            </div>
            <Button type="button" onClick={handleOpenAddGym}>
              <Plus className="size-4" />
              {isClubLimitReached ? 'Upgrade Plan' : 'Add Club'}
            </Button>
          </CardContent>
        </Card>

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
            <Card className="bg-secondary-blue-500 border-secondary-blue-400">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="size-16 rounded-full bg-primary-green-500/10 flex items-center justify-center mb-4">
                  <Building2 className="h-8 w-8 text-primary-green-500" />
                </div>
                <p className="text-secondary-blue-200 text-center font-medium">
                  Select a gym to manage
                </p>
                <p className="text-xs text-secondary-blue-300 text-center mt-1">
                  Choose from your gyms on the left
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      <AddGym
        isOpen={isAddGymSheetOpen}
        closeSheet={() => setIsAddGymSheetOpen(false)}
        onGymAdded={(gymId) => {
          if (gymId) {
            setSelectedGymId(gymId);
          }
        }}
      />
    </div>
  );
}
