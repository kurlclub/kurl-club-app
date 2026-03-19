'use client';

import type { TabItem } from '@/components/shared/form/k-tabs';
import { StudioLayout } from '@/components/shared/layout';
import { useTabState } from '@/hooks/use-tab-state';

import { HelpCenterTab, SupportTab } from './tab';

const tabs: TabItem[] = [
  { id: 'help_center', label: 'Help Center' },
  { id: 'support', label: 'Support' },
];

function HelpAndSupport() {
  const { activeTab, handleTabChange } = useTabState(tabs, 'help_center');

  return (
    <StudioLayout
      title="Help and Support"
      description="Get help with your account, resolve issues, and connect with our support team."
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      maxContentWidth="narrow"
    >
      {activeTab === 'help_center' && <HelpCenterTab />}
      {activeTab === 'support' && <SupportTab />}
    </StudioLayout>
  );
}

export default HelpAndSupport;
