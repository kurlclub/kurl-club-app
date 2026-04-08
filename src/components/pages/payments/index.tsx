'use client';

import { TabItem } from '@/components/shared/form/k-tabs';
import { StudioLayout } from '@/components/shared/layout';
import { FeatureAccessGuard } from '@/components/shared/subscription';
import { useTabState } from '@/hooks/use-tab-state';

import {
  CompletedTab,
  HistoryTab,
  OverdueTab,
  UpcomingDueTab,
} from './recurring';

const TABS: TabItem[] = [
  { id: 'upcoming-due', label: 'Upcoming Due' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'completed', label: 'Completed' },
  { id: 'history', label: 'History' },
];

export default function Payments() {
  const { activeTab, handleTabChange } = useTabState(TABS, 'upcoming-due');

  return (
    <FeatureAccessGuard
      feature="paymentTracking"
      title="Payments require a higher plan"
      message="Upgrade your subscription to access payments."
      mode="block"
    >
      <StudioLayout
        title="Payments"
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      >
        {activeTab === 'upcoming-due' && <UpcomingDueTab />}
        {activeTab === 'overdue' && <OverdueTab />}
        {activeTab === 'completed' && <CompletedTab />}
        {activeTab === 'history' && <HistoryTab />}
      </StudioLayout>
    </FeatureAccessGuard>
  );
}
