'use client';

import { usePathname } from 'next/navigation';
import * as React from 'react';

import {
  BarChart3,
  Calendar,
  CreditCard,
  Dumbbell,
  type LucideIcon,
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
import { useGymFormOptions } from '@/hooks/use-gymform-options';
import { useGymBranch } from '@/providers/gym-branch-provider';

type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  items?: { title: string; url: string }[];
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { gymBranch } = useGymBranch();
  const { formOptions } = useGymFormOptions(gymBranch?.gymId);

  // Check if any membership plan has PerSession billing type
  const hasPerSessionPlans = formOptions?.membershipPlans?.some(
    (plan) => plan.billingType === 'PerSession'
  );

  // Create navigation items based on billing types
  const getPaymentsNavItem = () => {
    if (hasPerSessionPlans) {
      // Show tree structure when PerSession plans exist
      return {
        title: 'Payments',
        url: '#',
        icon: CreditCard,
        items: [
          {
            title: 'Recurring Payments',
            url: '/payments',
          },
          {
            title: 'Per Session Payments',
            url: '/payments/session-payments',
          },
        ],
      };
    } else {
      // Show single payments tab for recurring only
      return {
        title: 'Payments',
        url: '/payments',
        icon: CreditCard,
      };
    }
  };

  const navMain: NavItem[] = [
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
    getPaymentsNavItem(),
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
  ];

  const navItems = navMain.map((item) => ({
    ...item,
    isActive:
      pathname === item.url ||
      (item.url !== '/' && item.url !== '#' && pathname.startsWith(item.url)) ||
      ('items' in item &&
        item.items &&
        item.items.some(
          (subItem: { title: string; url: string }) =>
            pathname === subItem.url ||
            (subItem.url !== '/' && pathname.startsWith(subItem.url))
        )),
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
