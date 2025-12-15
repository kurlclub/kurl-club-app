'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { Check, LogOut, User } from 'lucide-react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAppDialog } from '@/hooks/use-app-dialog';
import { useGymDetails } from '@/hooks/use-gym-management';
import { getAvatarColor, getInitials } from '@/lib/avatar-utils';
import { useAuth } from '@/providers/auth-provider';

export function NavUser() {
  const router = useRouter();
  const { logout, user, switchClub } = useAuth();
  const { data: gymDetails } = useGymDetails();

  const profilePictureUrl = gymDetails?.photoPath || null;

  console.log('NavUser - gymDetails:', gymDetails);
  console.log('NavUser - photoPath:', gymDetails?.photoPath);
  const [isPending, startTransition] = useTransition();
  const { showConfirm } = useAppDialog();
  const { state } = useSidebar();

  const handleLogout = () => {
    showConfirm({
      title: 'Confirm Logout',
      description: 'Are you sure you want to log out of your account?',
      variant: 'destructive',
      confirmLabel: 'Logout',
      cancelLabel: 'Cancel',
      onConfirm: () => {
        startTransition(() => {
          logout();
          router.push('/auth/login');
          toast.success('Logged out successfully!');
        });
      },
    });
  };

  const currentGym = gymDetails
    ? {
        gymName: gymDetails.gymName,
        id: gymDetails.id,
        location: gymDetails.location,
        gymIdentifier: gymDetails.gymIdentifier,
      }
    : null;

  const avatarStyle = getAvatarColor(currentGym?.gymName || 'KC');

  if (state === 'collapsed') {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="cursor-pointer hover:bg-primary-green-500/10 transition-all duration-300 group relative justify-center rounded-md border border-white/5 hover:border-primary-green-500/30 overflow-visible"
              >
                <div className="relative">
                  <Avatar className="h-9 w-9 rounded-sm shadow-lg">
                    <AvatarImage
                      src={profilePictureUrl || undefined}
                      alt={currentGym?.gymName || 'User'}
                    />
                    <AvatarFallback
                      className="rounded-md font-bold text-sm bg-linear-to-br from-primary-green-500/20 to-primary-green-600/10 text-primary-green-100"
                      style={avatarStyle}
                    >
                      {currentGym ? getInitials(currentGym.gymName) : 'KC'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-neutral-green-400 rounded-full border-2 border-secondary-blue-500 shadow-md" />
                </div>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-72 bg-secondary-blue-500/95 backdrop-blur-xl border border-primary-green-500/20 shadow-2xl rounded-md p-2"
              align="end"
              side="right"
              sideOffset={12}
            >
              <DropdownMenuLabel className="text-white p-4 pb-2">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 rounded-xl border-2 border-primary-green-500/30 shadow-lg">
                    <AvatarImage
                      src={profilePictureUrl || undefined}
                      alt={currentGym?.gymName || 'User'}
                    />
                    <AvatarFallback
                      className="rounded-xl font-bold text-sm bg-linear-to-br from-primary-green-500/20 to-primary-green-600/10 text-primary-green-100"
                      style={avatarStyle}
                    >
                      {currentGym ? getInitials(currentGym.gymName) : 'KC'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1 flex-1">
                    <p className="text-sm font-bold text-white truncate">
                      {currentGym?.gymName || 'No Gym Selected'}
                    </p>
                    <p className="text-xs text-primary-green-200 font-medium">
                      {currentGym
                        ? `ID: ${currentGym.gymIdentifier}`
                        : 'Select a gym'}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10 mx-2 my-2" />
              {user?.isMultiClub && user.clubs && user.clubs.length > 1 && (
                <>
                  <div className="px-2 py-2">
                    <p className="text-xs text-primary-green-200/70 font-semibold mb-2 px-2">
                      SWITCH CLUB
                    </p>
                    <div className="space-y-1">
                      {user.clubs.map((club) => {
                        const isActive = club.status === 1;
                        const clubInitials = getInitials(club.gymName);
                        const clubColor = getAvatarColor(club.gymName);

                        return (
                          <DropdownMenuItem
                            key={club.gymId}
                            onClick={() => !isActive && switchClub(club.gymId)}
                            disabled={isActive}
                            className={`cursor-pointer rounded-lg px-2 py-2.5 transition-all duration-200 ${
                              isActive
                                ? 'bg-primary-green-500/20 border border-primary-green-500/30'
                                : 'hover:bg-white/5 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-3 w-full">
                              <Avatar className="h-8 w-8 rounded-md">
                                <AvatarImage
                                  src={club.photoPath || undefined}
                                  alt={club.gymName}
                                />
                                <AvatarFallback
                                  className="rounded-md font-bold text-xs"
                                  style={clubColor}
                                >
                                  {clubInitials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                  {club.gymName}
                                </p>
                                <p className="text-xs text-white/50 truncate">
                                  {club.location}
                                </p>
                              </div>
                              {isActive && (
                                <Check className="h-4 w-4 text-primary-green-500 shrink-0" />
                              )}
                            </div>
                          </DropdownMenuItem>
                        );
                      })}
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-white/10 mx-2 my-2" />
                </>
              )}
              <div className="p-2 space-y-1">
                <DropdownMenuItem
                  onClick={() =>
                    router.push('/general-settings?tab=business_profile')
                  }
                  className="cursor-pointer text-white hover:bg-primary-green-500/20 hover:text-primary-green-100 rounded-xl px-4 py-3 transition-all duration-200 font-medium"
                >
                  <User className="mr-3 h-4 w-4" />
                  Gym Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isPending}
                  className="cursor-pointer text-red-300 hover:bg-red-500/20 hover:text-red-200 rounded-xl px-4 py-3 transition-all duration-200 font-medium"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  {isPending ? 'Signing out...' : 'Sign Out'}
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="relative overflow-hidden rounded-xl bg-linear-to-br from-secondary-blue-200/10 via-secondary-blue-600/20 to-secondary-blue-600/5 border border-secondary-blue-200/20 backdrop-blur-sm shadow-md">
          <div className="flex flex-col gap-4 p-4">
            {/* User Info Section with Club Switcher */}
            {user?.isMultiClub && user.clubs && user.clubs.length > 1 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-4 w-full hover:bg-white/5 rounded-lg transition-all duration-200 group">
                    <div className="relative shrink-0">
                      <Avatar className="h-12 w-12 rounded-lg">
                        <AvatarImage
                          src={profilePictureUrl || undefined}
                          alt={currentGym?.gymName || 'User'}
                        />
                        <AvatarFallback
                          className="rounded-lg font-semibold text-sm"
                          style={avatarStyle}
                        >
                          {currentGym ? getInitials(currentGym.gymName) : 'KC'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-secondary-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="truncate font-bold text-sm text-white mb-1 group-hover:text-primary-green-200 transition-colors">
                        {currentGym?.gymName || 'No Gym Selected'}
                      </div>
                      <div className="truncate text-xs text-primary-green-50 font-medium">
                        {currentGym
                          ? `ID: ${currentGym.gymIdentifier}`
                          : 'Select a gym'}
                      </div>
                      {currentGym?.location && (
                        <div className="truncate text-xs text-white/60 mt-0.5">
                          {currentGym.location}
                        </div>
                      )}
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-[calc(100%-2rem)] bg-secondary-blue-500/95 backdrop-blur-xl border border-primary-green-500/20 shadow-2xl rounded-md p-2"
                >
                  <div className="px-2 py-1 mb-2">
                    <p className="text-xs text-primary-green-200/70 font-semibold">
                      SWITCH CLUB
                    </p>
                  </div>
                  <div className="space-y-1">
                    {user.clubs.map((club) => {
                      const isActive = club.status === 1;
                      const clubInitials = getInitials(club.gymName);
                      const clubColor = getAvatarColor(club.gymName);

                      return (
                        <DropdownMenuItem
                          key={club.gymId}
                          onClick={() => !isActive && switchClub(club.gymId)}
                          disabled={isActive}
                          className={`cursor-pointer rounded-lg px-2 py-2.5 transition-all duration-200 ${
                            isActive
                              ? 'bg-primary-green-500/20 border border-primary-green-500/30'
                              : 'hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <Avatar className="h-8 w-8 rounded-md">
                              <AvatarImage
                                src={club.photoPath || undefined}
                                alt={club.gymName}
                              />
                              <AvatarFallback
                                className="rounded-md font-bold text-xs"
                                style={clubColor}
                              >
                                {clubInitials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">
                                {club.gymName}
                              </p>
                              <p className="text-xs text-white/50 truncate">
                                {club.location}
                              </p>
                            </div>
                            {isActive ? (
                              <Check className="h-4 w-4 text-primary-green-500 shrink-0" />
                            ) : null}
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-12 w-12 rounded-md">
                    <AvatarImage
                      src={profilePictureUrl || undefined}
                      alt={currentGym?.gymName || 'User'}
                    />
                    <AvatarFallback
                      className="rounded-md font-bold text-sm bg-linear-to-br from-primary-green-500/20 to-primary-green-600/10 text-primary-green-100"
                      style={avatarStyle}
                    >
                      {currentGym ? getInitials(currentGym.gymName) : 'KC'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-neutral-green-400 rounded-full border-2 border-secondary-blue-500 shadow-md" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate font-bold text-sm text-white mb-1">
                    {currentGym?.gymName || 'No Gym Selected'}
                  </div>
                  <div className="truncate text-xs text-primary-green-200 font-medium">
                    {currentGym
                      ? `ID: ${currentGym.gymIdentifier}`
                      : 'Select a gym'}
                  </div>
                  {currentGym?.location && (
                    <div className="truncate text-xs text-white/60 mt-0.5">
                      {currentGym.location}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push('/general-settings?tab=business_profile')
                }
                className="flex-1 h-9 text-xs bg-white/5 border-white/10 text-white hover:bg-primary-green-500 hover:border-primary-green-500 hover:text-black transition-all duration-200"
              >
                <User className="h-3 w-3 mr-1" />
                Profile
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                disabled={isPending}
                className="flex-1 h-9 text-xs bg-red-500/20 border-red-500/30 text-red-200 hover:bg-red-500/30 hover:text-red-100 transition-all duration-200"
              >
                <LogOut className="h-3 w-3 mr-1" />
                {isPending ? 'Signing out...' : 'Sign Out'}
              </Button>
            </div>
          </div>

          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-primary-green-500/5 via-transparent to-primary-green-400/5 pointer-events-none opacity-50" />
          <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-primary-blue-200/50 to-transparent" />
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
