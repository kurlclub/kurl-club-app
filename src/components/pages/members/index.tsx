'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { TabItem } from '@/components/shared/form/k-tabs';
import { StudioLayout } from '@/components/shared/layout';
import { FeatureAccessGuard } from '@/components/shared/subscription';
import { useSheet } from '@/hooks/use-sheet';
import { useTabState } from '@/hooks/use-tab-state';
import { useGymBranch } from '@/providers/gym-branch-provider';
import { useGymMembers, usePendingOnboardingMembers } from '@/services/member';

import { MembersHeader } from './members-header';
import { AllMembersTab, PendingOnboardingTab } from './tabs';

export default function Members() {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const { isOpen, openSheet, closeSheet } = useSheet();
  const { gymBranch } = useGymBranch();
  const gymId = gymBranch?.gymId;

  const { data: memberCountData } = useGymMembers(gymId!, {
    page: 1,
    pageSize: 1,
  });
  const { data: pendingMembers = [] } = usePendingOnboardingMembers(gymId!);
  const totalMemberCount = memberCountData?.pagination?.totalCount || 0;

  const tabs: TabItem[] = [
    { id: 'all-members', label: 'All Members' },
    {
      id: 'pending-onboarding',
      label: `Pending Onboarding (${pendingMembers.length})`,
    },
  ];

  const { activeTab, handleTabChange } = useTabState(tabs, 'all-members');

  useEffect(() => {
    if (searchParams.get('setup') === 'true') {
      openSheet();
      window.history.replaceState({}, '', '/members');
    }
  }, [searchParams, openSheet]);

  return (
    <FeatureAccessGuard
      feature="memberManagement"
      title="Members require a higher plan"
      message="Upgrade your subscription to manage members."
      mode="block"
    >
      <StudioLayout
        title="Members"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        headerActions={
          <MembersHeader
            onImportClick={() => setIsImportModalOpen(true)}
            onAddNewClick={openSheet}
            isOpen={isOpen}
            closeSheet={closeSheet}
            gymId={gymId}
            currentMemberCount={totalMemberCount}
          />
        }
      >
        {activeTab === 'all-members' && (
          <AllMembersTab
            gymId={gymId}
            isImportModalOpen={isImportModalOpen}
            onCloseImportModal={() => setIsImportModalOpen(false)}
          />
        )}
        {activeTab === 'pending-onboarding' && <PendingOnboardingTab />}
      </StudioLayout>
    </FeatureAccessGuard>
  );
}
