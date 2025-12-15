'use client';

import { TabItem } from '@/components/shared/form/k-tabs';
import { StudioLayout } from '@/components/shared/layout';
import { useTabState } from '@/hooks/use-tab-state';

import {
  CompletedTab,
  CurrentDueTab,
  HistoryTab,
  OverdueTab,
} from './recurring';

const TABS: TabItem[] = [
  { id: 'current-due', label: 'Current Due' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'completed', label: 'Completed' },
  { id: 'history', label: 'History' },
];

export default function Payments() {
  const { activeTab, handleTabChange } = useTabState(TABS, 'current-due');

  return (
    <StudioLayout
      title="Payments"
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      {activeTab === 'current-due' && <CurrentDueTab />}
      {activeTab === 'overdue' && <OverdueTab />}
      {activeTab === 'completed' && <CompletedTab />}
      {activeTab === 'history' && <HistoryTab />}
    </StudioLayout>
  );
}
