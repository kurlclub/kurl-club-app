'use client';

import { TabItem } from '@/components/shared/form/k-tabs';
import { StudioLayout } from '@/components/shared/layout';
import { useTabState } from '@/hooks/use-tab-state';

import { ProfileAndGymsTab } from './tabs/profile-and-gyms-tab';
import { SecurityTab } from './tabs/security-tab';
import { SubscriptionTab } from './tabs/subscription-tab';

const tabs: TabItem[] = [
  { id: 'profile_gyms', label: 'Profile & Gyms' },
  { id: 'subscription', label: 'Subscription & Billing' },
  { id: 'security', label: 'Security' },
];

export default function AccountSettings() {
  const { activeTab, handleTabChange } = useTabState(tabs, 'profile_gyms');

  return (
    <StudioLayout
      title="Account Settings"
      description="Manage your account profile and gym locations"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      maxContentWidth={activeTab === 'profile_gyms' ? 'wide' : 'narrow'}
    >
      {activeTab === 'profile_gyms' && <ProfileAndGymsTab />}
      {activeTab === 'subscription' && <SubscriptionTab />}
      {activeTab === 'security' && <SecurityTab />}
    </StudioLayout>
  );
}
