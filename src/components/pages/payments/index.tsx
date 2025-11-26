'use client';

import { TabItem } from '@/components/shared/form/k-tabs';
import { StudioLayout } from '@/components/shared/layout';
import { useGymFormOptions } from '@/hooks/use-gymform-options';
import { useTabState } from '@/hooks/use-tab-state';
import { useGymBranch } from '@/providers/gym-branch-provider';

import { PaymentsTab } from './payments-tab';

const TABS: TabItem[] = [
  { id: 'outstanding-payments', label: 'Outstanding Payments' },
  { id: 'expired-payments', label: 'Expired Payments' },
  { id: 'completed-payments', label: 'Completed' },
  { id: 'history', label: 'History' },
];

export default function Payments() {
  const { gymBranch } = useGymBranch();
  const { formOptions } = useGymFormOptions(gymBranch?.gymId);
  const { activeTab, handleTabChange } = useTabState(
    TABS,
    'outstanding-payments'
  );

  return (
    <StudioLayout
      title="Payments"
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      {activeTab === 'outstanding-payments' && (
        <PaymentsTab type="outstanding" formOptions={formOptions} />
      )}
      {activeTab === 'expired-payments' && (
        <PaymentsTab type="expired" formOptions={formOptions} />
      )}
      {activeTab === 'completed-payments' && (
        <PaymentsTab type="completed" formOptions={formOptions} />
      )}
      {activeTab === 'history' && (
        <PaymentsTab type="history" formOptions={formOptions} />
      )}
    </StudioLayout>
  );
}
