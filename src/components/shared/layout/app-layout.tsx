'use client';

import { usePathname, useRouter } from 'next/navigation';
import React, { ReactNode, useEffect } from 'react';

import Loading from '@/app/loading';
import { SubscriptionRouteGuard } from '@/components/shared/subscription';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/providers/auth-provider';

import { AppHeader } from './app-header';
import { AppSidebar } from './sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoading, user } = useAuth();

  const hideNavbarRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/reset',
    '/auth/activate',
    '/welcome',
  ];

  const isAuthRoute = hideNavbarRoutes.includes(pathname);
  const hasGym = (user?.clubs?.length ?? 0) > 0;
  // Only gym admins create gyms; staff/trainers can have no clubs legitimately
  const isGymAdmin = /admin/i.test(user?.userRole ?? '');
  // A logged-in admin with no gym yet must onboard before using the app
  const needsGymOnboarding = !isLoading && !!user && isGymAdmin && !hasGym;

  useEffect(() => {
    if (needsGymOnboarding && pathname !== '/welcome') {
      router.replace('/welcome');
    }
  }, [needsGymOnboarding, pathname, router]);

  // Show loading only if we have no cached data and still loading
  if (isLoading && !user && !isAuthRoute) {
    return <Loading />;
  }

  // Hold protected UI back while redirecting a gym-less user to onboarding
  if (needsGymOnboarding && pathname !== '/welcome') {
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
        <div className="h-full">
          <SubscriptionRouteGuard>{children}</SubscriptionRouteGuard>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppLayout;
