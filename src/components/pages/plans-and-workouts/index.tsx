'use client';

import { TabItem } from '@/components/shared/form/k-tabs';
import { StudioLayout } from '@/components/shared/layout';
import { FeatureAccessGuard } from '@/components/shared/subscription';
import { useTabState } from '@/hooks/use-tab-state';

import { PackageManager } from './tabs/membership-planner';
import { WorkoutPlanner } from './tabs/workout-planner';

const tabs: TabItem[] = [
  {
    id: 'membership-plans',
    label: 'Membership Plans',
  },
  {
    id: 'workout-plans',
    label: 'Workout Plans',
  },
];

export default function PlansAndWorkoutsContent() {
  const { activeTab, handleTabChange } = useTabState(tabs, 'membership-plans');

  return (
    <FeatureAccessGuard
      feature="membershipManagement"
      title="Plans & workouts require a higher plan"
      message="Upgrade your subscription to manage plans and workouts."
      mode="block"
    >
      <StudioLayout
        title="Plans & Workouts"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      >
        {activeTab === 'membership-plans' && <PackageManager />}
        {activeTab === 'workout-plans' && <WorkoutPlanner />}
      </StudioLayout>
    </FeatureAccessGuard>
  );
}
