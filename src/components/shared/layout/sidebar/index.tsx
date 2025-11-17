'use client';

import { usePathname } from 'next/navigation';
import * as React from 'react';

import {
  BarChart3,
  Calendar,
  CreditCard,
  Dumbbell,
  Settings,
  UserCheck,
  Users,
} from 'lucide-react';

import { NavMain } from '@/components/shared/layout/sidebar/nav-main';
import { NavUser } from '@/components/shared/layout/sidebar/nav-user';
import { TeamSwitcher } from '@/components/shared/layout/sidebar/team-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
} from '@/components/ui/sidebar';

// This is sample data.
const data = {
  user: {
    name: 'Admin User',
    email: 'admin@kurlclub.com',
    avatar: '/avatars/admin.jpg',
  },

  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: BarChart3,
    },
    {
      title: 'Members',
      url: '/members',
      icon: Users,
    },
    {
      title: 'Payments',
      url: '/payments',
      icon: CreditCard,
    },
    {
      title: 'Attendance',
      url: '/attendance',
      icon: Calendar,
    },
    {
      title: 'Staff Management',
      url: '/staff-management',
      icon: UserCheck,
    },
    {
      title: 'Plans & Workouts',
      url: '/plans-and-workouts',
      icon: Dumbbell,
    },
    {
      title: 'General Settings',
      url: '/general-settings',
      icon: Settings,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  const navItems = data.navMain.map((item) => ({
    ...item,
    isActive:
      pathname === item.url ||
      (item.url !== '/' && pathname.startsWith(item.url)),
  }));

  return (
    <Sidebar
      collapsible="icon"
      className="[&_[data-slot='sidebar-inner']]:!border-r-0"
      {...props}
    >
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
