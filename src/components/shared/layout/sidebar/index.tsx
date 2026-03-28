'use client';

import { usePathname } from 'next/navigation';
import * as React from 'react';

import {
  BarChart3,
  Calendar,
  ChartColumnIncreasing,
  CreditCard,
  Dumbbell,
  Goal,
  HelpCircle,
  type LucideIcon,
  Settings,
  UserCheck,
  Users,
  Wallet,
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
import { SubscriptionFeatureKey } from '@/types/subscription';

type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  requiredFeature?: SubscriptionFeatureKey;
  items?: { title: string; url: string }[];
};

type NavGroup = {
  label: string;
  items: NavItem[];
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
  const getPaymentsNavItem = (): NavItem => {
    if (hasPerSessionPlans) {
      // Show tree structure when PerSession plans exist
      return {
        title: 'Payments',
        url: '#',
        icon: CreditCard,
        requiredFeature: 'paymentTracking',
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
        requiredFeature: 'paymentTracking',
      };
    }
  };

  const navGroups: NavGroup[] = [
    {
      label: 'GENERAL',
      items: [
        {
          title: 'Dashboard',
          url: '/dashboard',
          icon: BarChart3,
        },
        {
          title: 'Members',
          url: '/members',
          icon: Users,
          requiredFeature: 'memberManagement',
        },
        getPaymentsNavItem(),
        {
          title: 'Attendance',
          url: '/attendance',
          icon: Calendar,
          requiredFeature: 'attendanceTracking',
        },
      ],
    },
    {
      label: 'BUSINESS',
      items: [
        {
          title: 'Lead Management',
          url: '/lead-management',
          icon: Goal,
          requiredFeature: 'leadManagement',
        },
        {
          title: 'Plans & Workouts',
          url: '/plans-and-workouts',
          icon: Dumbbell,
          requiredFeature: 'membershipManagement',
        },
        {
          title: 'Staff Management',
          url: '/staff-management',
          icon: UserCheck,
          requiredFeature: 'staffManagement',
        },
        {
          title: 'Payroll Management',
          url: '/payroll-management',
          icon: Wallet,
        },
      ],
    },
    {
      label: 'FINANCE',
      items: [
        {
          title: 'Reports & Expenses',
          url: '/reports-and-expenses',
          icon: ChartColumnIncreasing,
          requiredFeature: 'basicReports',
        },
      ],
    },
    {
      label: 'SYSTEM',
      items: [
        {
          title: 'Settings',
          url: '/account-settings',
          icon: Settings,
        },
        {
          title: 'Help & Support',
          url: '/help-and-support',
          icon: HelpCircle,
        },
      ],
    },
  ];

  const groupedNavItems = navGroups.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      isActive:
        pathname === item.url ||
        (item.url !== '/' &&
          item.url !== '#' &&
          pathname.startsWith(item.url)) ||
        ('items' in item &&
          item.items &&
          item.items.some(
            (subItem: { title: string; url: string }) =>
              pathname === subItem.url ||
              (subItem.url !== '/' && pathname.startsWith(subItem.url))
          )),
    })),
  }));

  return (
    <Sidebar
      collapsible="icon"
      className="**:data-[slot='sidebar-inner']:border-r-0!"
      {...props}
    >
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        {groupedNavItems.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
