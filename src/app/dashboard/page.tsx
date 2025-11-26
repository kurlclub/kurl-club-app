import type { Metadata } from 'next';
import { Suspense } from 'react';

import Dashboard from '@/components/pages/dashboard';
import { AppLoader } from '@/components/shared/loaders';

export const metadata: Metadata = {
  title: 'Dashboard',
  description:
    'Gym management dashboard with insights, member statistics, and payment tracking',
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<AppLoader />}>
      <Dashboard />
    </Suspense>
  );
}
