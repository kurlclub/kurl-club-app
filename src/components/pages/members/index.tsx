'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { TabItem } from '@/components/shared/form/k-tabs';
import { StudioLayout } from '@/components/shared/layout';
import { useSheet } from '@/hooks/use-sheet';
import { useTabState } from '@/hooks/use-tab-state';
import { useGymBranch } from '@/providers/gym-branch-provider';
import { usePendingOnboardingMembers } from '@/services/member';

import { MembersHeader } from './members-header';
import { AllMembersTab, PendingOnboardingTab } from './tabs';

export default function Members() {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const { isOpen, openSheet, closeSheet } = useSheet();
  const { gymBranch } = useGymBranch();
  const gymId = gymBranch?.gymId;

  const { data: pendingMembers = [] } = usePendingOnboardingMembers(gymId!);

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
  );
}
