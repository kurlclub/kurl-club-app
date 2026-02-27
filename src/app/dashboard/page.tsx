import type { Metadata } from 'next';

import Dashboard from '@/components/pages/dashboard';

export const metadata: Metadata = {
  title: 'Dashboard',
  description:
    'Gym management dashboard with insights, member statistics, and payment tracking',
};

export default function DashboardPage() {
  return <Dashboard />;
}
