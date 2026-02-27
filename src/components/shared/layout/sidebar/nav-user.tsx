'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Check, ChevronDown, LogOut, User } from 'lucide-react';
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

  const [isPending, startTransition] = useTransition();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { showConfirm } = useAppDialog();
  const { state, isMobile, setOpenMobile } = useSidebar();

  const closeMobileSidebar = () => {
    if (isMobile) setOpenMobile(false);
  };

  const handleLogout = () => {
    showConfirm({
      title: 'Confirm Logout',
      description: 'Are you sure you want to log out of your account?',
      variant: 'destructive',
      confirmLabel: 'Logout',
      cancelLabel: 'Cancel',
      onConfirm: () => {
        startTransition(() => {
          closeMobileSidebar();
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
                className="relative justify-center overflow-visible transition-all duration-300 border rounded-md cursor-pointer hover:bg-primary-green-500/10 border-white/5 hover:border-primary-green-500/30"
              >
                <div className="relative">
                  <Avatar className="rounded-sm shadow-lg h-9 w-9">
                    <AvatarImage
                      src={profilePictureUrl || undefined}
                      alt={currentGym?.gymName || 'User'}
                    />
                    <AvatarFallback
                      className="text-sm font-bold rounded-md bg-linear-to-br from-primary-green-500/20 to-primary-green-600/10 text-primary-green-100"
                      style={avatarStyle}
                    >
                      {currentGym ? getInitials(currentGym.gymName) : 'KC'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="absolute w-4 h-4 border-2 rounded-full shadow-md -bottom-1 -right-1 bg-neutral-green-400 border-secondary-blue-500" />
                </div>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="p-2 border rounded-md shadow-2xl w-72 bg-secondary-blue-500/95 backdrop-blur-xl border-primary-green-500/20"
              align="end"
              side="right"
              sideOffset={12}
            >
              <DropdownMenuLabel className="p-4 pb-2 text-white">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12 border-2 shadow-lg rounded-xl border-primary-green-500/30">
                    <AvatarImage
                      src={profilePictureUrl || undefined}
                      alt={currentGym?.gymName || 'User'}
                    />
                    <AvatarFallback
                      className="text-sm font-bold rounded-xl bg-linear-to-br from-primary-green-500/20 to-primary-green-600/10 text-primary-green-100"
                      style={avatarStyle}
                    >
                      {currentGym ? getInitials(currentGym.gymName) : 'KC'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-1 space-y-1">
                    <p className="text-sm font-bold text-white truncate">
                      {currentGym?.gymName || 'No Gym Selected'}
                    </p>
                    <p className="text-xs font-medium text-primary-green-200">
                      {currentGym
                        ? `ID: ${currentGym.gymIdentifier}`
                        : 'Select a gym'}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="mx-2 my-2 bg-white/10" />
              {user?.isMultiClub && user.clubs && user.clubs.length > 1 && (
                <>
                  <div className="px-3 py-2">
                    <p className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-primary-green-400">
                      <span className="w-1 h-4 rounded-full bg-primary-green-500"></span>
                      Switch Club
                    </p>
                  </div>
                  <div className="px-2 space-y-1 overflow-y-auto max-h-80">
                    {user.clubs.map((club) => {
                      const isActive = club.status === 1;
                      const clubInitials = getInitials(club.gymName);
                      const clubColor = getAvatarColor(club.gymName);

                      return (
                        <DropdownMenuItem
                          key={club.gymId}
                          onClick={() => {
                            if (!isActive) {
                              switchClub(club.gymId);
                              closeMobileSidebar();
                            }
                          }}
                          disabled={isActive}
                          className={`cursor-pointer rounded-lg px-2 py-2 transition-all duration-200 relative overflow-hidden ${
                            isActive
                              ? 'bg-primary-green-500 border-2 border-primary-green-400 shadow-lg'
                              : 'hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          <div className="relative z-10 flex items-center w-full gap-3">
                            <Avatar
                              className={`h-8 w-8 rounded-md ${isActive ? 'ring-2 ring-white' : 'ring-1 ring-white/10'}`}
                            >
                              <AvatarImage
                                src={club.photoPath || undefined}
                                alt={club.gymName}
                              />
                              <AvatarFallback
                                className="text-xs font-bold rounded-md"
                                style={clubColor}
                              >
                                {clubInitials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p
                                  className={`text-sm font-semibold truncate flex-1 ${isActive ? 'text-black' : 'text-white'}`}
                                >
                                  {club.gymName}
                                </p>
                                {isActive && (
                                  <Check className="w-4 h-4 text-black shrink-0" />
                                )}
                              </div>
                              <p
                                className={`text-xs truncate ${isActive ? 'text-black/70' : 'text-white/50'}`}
                              >
                                {club.location}
                              </p>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                  </div>
                  <DropdownMenuSeparator className="mx-2 my-2 bg-white/10" />
                </>
              )}
              <div className="p-2 space-y-1">
                <DropdownMenuItem
                  onClick={() => {
                    closeMobileSidebar();
                    router.push('/account-settings');
                  }}
                  className="cursor-pointer text-white hover:bg-white/5 hover:text-white rounded-lg px-3 py-2.5 transition-all duration-200 font-medium"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isPending}
                  className="cursor-pointer text-red-300 hover:bg-red-500/20 hover:text-red-200 rounded-lg px-3 py-2.5 transition-all duration-200 font-medium"
                >
                  <LogOut className="w-4 h-4 mr-2" />
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
        <div className="relative overflow-hidden border shadow-md rounded-xl bg-linear-to-br from-secondary-blue-200/10 via-secondary-blue-600/20 to-secondary-blue-600/5 border-secondary-blue-200/20 backdrop-blur-sm">
          <div className="flex flex-col gap-4 p-4">
            {/* User Info Section with Club Switcher */}
            {user?.isMultiClub && user.clubs && user.clubs.length > 1 ? (
              <DropdownMenu onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-4 w-full px-2 py-1 rounded-lg transition-all duration-200 group outline-none hover:bg-white/5 cursor-pointer hover:scale-[1.03] active:scale-[0.98]">
                    <div className="relative shrink-0">
                      <Avatar className="w-12 h-12 rounded-lg">
                        <AvatarImage
                          src={profilePictureUrl || undefined}
                          alt={currentGym?.gymName || 'User'}
                        />
                        <AvatarFallback
                          className="text-sm font-semibold rounded-lg"
                          style={avatarStyle}
                        >
                          {currentGym ? getInitials(currentGym.gymName) : 'KC'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-secondary-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="mb-1 text-sm font-bold text-white truncate transition-colors group-hover:text-primary-green-200">
                        {currentGym?.gymName || 'No Gym Selected'}
                      </div>
                      <div className="text-xs font-medium truncate text-primary-green-50">
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
                    <ChevronDown
                      className={`h-4 w-4 text-white/40 group-hover:text-primary-green-400 transition-all shrink-0 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`}
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-[calc(100%-28px)] bg-secondary-blue-500/98 backdrop-blur-xl border border-primary-green-500/20 shadow-2xl rounded-xl p-2"
                >
                  <div className="px-2 py-1.5 mb-1">
                    <p className="text-[10px] text-primary-green-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-0.5 h-3 bg-primary-green-500 rounded-full"></span>
                      Switch Club
                    </p>
                  </div>
                  <div className="space-y-1 overflow-y-auto max-h-80">
                    {user.clubs.map((club) => {
                      const isActive = club.status === 1;
                      const clubInitials = getInitials(club.gymName);
                      const clubColor = getAvatarColor(club.gymName);
                      return (
                        <DropdownMenuItem
                          key={club.gymId}
                          onClick={() => {
                            if (!isActive) {
                              switchClub(club.gymId);
                              closeMobileSidebar();
                            }
                          }}
                          disabled={isActive}
                          className={`cursor-pointer rounded-lg px-2 py-2 transition-all duration-200 ${
                            isActive
                              ? 'bg-linear-to-r from-primary-green-200/20 to-primary-green-700/40 border border-primary-green-500/40'
                              : 'hover:bg-white/5 border border-transparent hover:border-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 w-full">
                            <Avatar className="w-8 h-8 rounded-lg ring-1 ring-white/10">
                              <AvatarImage
                                src={club.photoPath || undefined}
                                alt={club.gymName}
                              />
                              <AvatarFallback
                                className="text-xs font-bold rounded-lg"
                                style={clubColor}
                              >
                                {clubInitials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="flex-1 text-xs font-semibold text-white truncate">
                                  {club.gymName}
                                </p>
                                {isActive && (
                                  <Check className="w-3 h-3 text-primary-green-400 shrink-0" />
                                )}
                              </div>
                              <p className="text-[10px] text-white/80 truncate">
                                {club.location}
                              </p>
                            </div>
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
                  <Avatar className="w-12 h-12 rounded-md">
                    <AvatarImage
                      src={profilePictureUrl || undefined}
                      alt={currentGym?.gymName || 'User'}
                    />
                    <AvatarFallback
                      className="text-sm font-bold rounded-md bg-linear-to-br from-primary-green-500/20 to-primary-green-600/10 text-primary-green-100"
                      style={avatarStyle}
                    >
                      {currentGym ? getInitials(currentGym.gymName) : 'KC'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute w-4 h-4 border-2 rounded-full shadow-md -bottom-1 -right-1 bg-neutral-green-400 border-secondary-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-1 text-sm font-bold text-white truncate">
                    {currentGym?.gymName || 'No Gym Selected'}
                  </div>
                  <div className="text-xs font-medium truncate text-primary-green-200">
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
                onClick={() => {
                  closeMobileSidebar();
                  router.push('/account-settings');
                }}
                className="flex-1 text-xs text-white transition-all duration-200 h-9 bg-white/5 border-white/10 hover:bg-primary-green-500 hover:border-primary-green-500 hover:text-black"
              >
                <User className="w-3 h-3 mr-1" />
                Profile
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  closeMobileSidebar();
                  handleLogout();
                }}
                disabled={isPending}
                className="flex-1 text-xs text-red-200 transition-all duration-200 h-9 bg-red-500/20 border-red-500/30 hover:bg-red-500/30 hover:text-red-100"
              >
                <LogOut className="w-3 h-3 mr-1" />
                {isPending ? 'Signing out...' : 'Sign Out'}
              </Button>
            </div>
          </div>

          {/* Animated gradient overlay */}
          <div className="absolute inset-0 opacity-50 pointer-events-none bg-linear-to-t from-primary-green-500/5 via-transparent to-primary-green-400/5" />
          <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-primary-blue-200/50 to-transparent" />
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
