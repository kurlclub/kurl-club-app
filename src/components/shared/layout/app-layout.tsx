'use client';

import { usePathname } from 'next/navigation';
import React, { ReactNode } from 'react';

import Loading from '@/app/loading';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/providers/auth-provider';

import { AppHeader } from './app-header';
import { AppSidebar } from './sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const { isAuthLoading, appUser } = useAuth();

  const hideNavbarRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/reset',
    '/auth/activate',
  ];

  const isAuthRoute = hideNavbarRoutes.includes(pathname);

  // Show loading only if we have no cached data and Firebase is still loading
  if (isAuthLoading && !appUser && !isAuthRoute) {
    return <Loading />;
  }

  if (isAuthRoute) {
    return <main>{children}</main>;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-h-screen">
        <div className="sticky top-0 z-50 shrink-0">
          <AppHeader />
        </div>
        <div className="h-full">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppLayout;
