import type { Metadata } from 'next';

import PlansAndWorkoutsContent from '@/components/pages/plans-and-workouts';

export const metadata: Metadata = {
  title: 'Plans & Workouts',
  description: 'Manage membership plans and workout programs',
};

export default function PlansAndWorkoutsPage() {
  return <PlansAndWorkoutsContent />;
}
