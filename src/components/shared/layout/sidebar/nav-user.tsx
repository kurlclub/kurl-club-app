'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { LogOut, User } from 'lucide-react';
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
import { getAvatarColor, getInitials } from '@/lib/avatar-utils';
import { useAuth } from '@/providers/auth-provider';

export function NavUser() {
  const router = useRouter();
  const { logout, appUser, gymDetails } = useAuth();
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
          logout()
            .then(() => {
              router.push('/auth/login');
              toast.success('Logged out successfully!');
            })
            .catch((error) => {
              toast.error('Failed to log out. Please try again.');
              console.error('Logout error:', error);
            });
        });
      },
    });
  };

  const gymList = appUser?.gyms || [];
  const currentGym =
    gymDetails ||
    (gymList.length > 0
      ? {
          gymName: gymList[0].gymName,
          id: gymList[0].gymId,
          location: gymList[0].gymLocation,
          gymIdentifier: gymList[0].gymIdentifier,
        }
      : null);

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
                    <AvatarImage src="" alt={currentGym?.gymName || 'User'} />
                    <AvatarFallback
                      className="rounded-md font-bold text-sm bg-gradient-to-br from-primary-green-500/20 to-primary-green-600/10 text-primary-green-100"
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
                    <AvatarImage src="" alt={currentGym?.gymName || 'User'} />
                    <AvatarFallback
                      className="rounded-xl font-bold text-sm bg-gradient-to-br from-primary-green-500/20 to-primary-green-600/10 text-primary-green-100"
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
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-secondary-blue-200/10 via-secondary-blue-600/20 to-secondary-blue-600/5 border border-secondary-blue-200/20 backdrop-blur-sm shadow-md">
          <div className="flex flex-col gap-4 p-4">
            {/* User Info Section */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-12 w-12 rounded-md">
                  <AvatarImage src="" alt={currentGym?.gymName || 'User'} />
                  <AvatarFallback
                    className="rounded-md font-bold text-sm bg-gradient-to-br from-primary-green-500/20 to-primary-green-600/10 text-primary-green-100"
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
          <div className="absolute inset-0 bg-gradient-to-t from-primary-green-500/5 via-transparent to-primary-green-400/5 pointer-events-none opacity-50" />
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-blue-200/50 to-transparent" />
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
