'use client';

import {
  BusinessProfileTab,
  OperationsTab,
  SecurityAndPrivacyTab,
} from '@/components/pages/general-settings/tabs';
import { TabItem } from '@/components/shared/form/k-tabs';
import { StudioLayout } from '@/components/shared/layout';
import { useTabState } from '@/hooks/use-tab-state';

const tabs: TabItem[] = [
  { id: 'business_profile', label: 'Business Profile' },
  { id: 'operations', label: 'Operations' },
  { id: 'security_and_privacy', label: 'Security & Privacy' },
];

export default function GeneralSettings() {
  const { activeTab, handleTabChange } = useTabState(tabs, 'business_profile');

  return (
    <StudioLayout
      title="General Settings"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      maxContentWidth="wide"
    >
      {activeTab === 'business_profile' && <BusinessProfileTab />}
      {activeTab === 'operations' && <OperationsTab />}
      {activeTab === 'security_and_privacy' && <SecurityAndPrivacyTab />}
    </StudioLayout>
  );
}
