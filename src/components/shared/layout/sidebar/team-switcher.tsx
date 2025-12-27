'use client';

import Image from 'next/image';

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

export function TeamSwitcher() {
  const { state } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className={`cursor-default hover:bg-transparent h-auto ${
            state === 'collapsed' ? 'inline-flex justify-center' : ''
          }`}
        >
          {state === 'collapsed' ? (
            <Image
              src="/assets/svg/christmas-logo-shrink.svg"
              alt="KurlClub Logo"
              width={36}
              height={36}
            />
          ) : (
            <Image
              width={120}
              height={18}
              className="w-auto object-contain h-6"
              src="/assets/svg/christmas-logo.svg"
              alt="KurlClub Logo"
            />
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
