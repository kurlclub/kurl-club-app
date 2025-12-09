'use client';

import { TabItem } from '@/components/shared/form/k-tabs';
import { StudioLayout } from '@/components/shared/layout';
import { useGymFormOptions } from '@/hooks/use-gymform-options';
import { useTabState } from '@/hooks/use-tab-state';
import { useGymBranch } from '@/providers/gym-branch-provider';

import { HistoryTab, PaymentsTab } from './recurring';

const TABS: TabItem[] = [
  { id: 'current-due', label: 'Current Due' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'completed', label: 'Completed' },
  { id: 'history', label: 'History' },
];

export default function Payments() {
  const { gymBranch } = useGymBranch();
  const { formOptions } = useGymFormOptions(gymBranch?.gymId);
  const { activeTab, handleTabChange } = useTabState(TABS, 'current-due');

  return (
    <StudioLayout
      title="Payments"
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      {activeTab === 'current-due' && (
        <PaymentsTab type="current-due" formOptions={formOptions} />
      )}
      {activeTab === 'overdue' && (
        <PaymentsTab type="overdue" formOptions={formOptions} />
      )}
      {activeTab === 'completed' && (
        <PaymentsTab type="completed" formOptions={formOptions} />
      )}
      {activeTab === 'history' && <HistoryTab />}
    </StudioLayout>
  );
}
