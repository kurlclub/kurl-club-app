import { Separator } from '@/components/ui/separator';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { getGreeting } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';

import { CommandPalette, QuickActionsButton } from './command-palette';

export function AppHeader() {
  const { user } = useAuth();
  const { isMobile } = useSidebar();

  const userName = user?.userName || user?.userEmail || 'User';

  // TODO: Mock notification count - replace with actual data
  // const notificationCount = 3;

  return (
    <header
      className={`flex h-16 shrink-0 items-center  gap-3 sticky top-3 z-50 border-b border-b-secondary-blue-500 px-4 bg-background-dark ${!isMobile ? 'rounded-tl-3xl' : ''}`}
    >
      <CommandPalette />
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4 bg-[#747578]"
        />
        <div className="flex flex-col text-left leading-tight">
          <span className="text-sm font-medium leading-normal text-[#747578]">
            Hey, {userName}
          </span>
          <span className="text-base font-semibold">{getGreeting()}</span>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2">
        {/* <NotificationBell count={notificationCount} onClick={() => {}} /> */}
        {/* <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4 bg-[#747578] md:flex"
        /> */}
        <QuickActionsButton />
      </div>
    </header>
  );
}
