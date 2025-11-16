'use client';

import { useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { DataTable, DataTableToolbar } from '@/components/shared/table';
import { useAppDialog } from '@/hooks/use-app-dialog';
import { useFilterableList } from '@/hooks/use-filterable-list';
import { useSheet } from '@/hooks/use-sheet';
import { searchItems } from '@/lib/utils';
import { useGymBranch } from '@/providers/gym-branch-provider';
import {
  rejectOnboardingMember,
  usePendingOnboardingMembers,
} from '@/services/member';

import AddMember from '../add-member';
import {
  PendingMember,
  createPendingOnboardingColumns,
} from '../table/pending-onboarding-columns';

export function PendingOnboardingTab() {
  const { isOpen, openSheet, closeSheet } = useSheet();
  const { showConfirm } = useAppDialog();
  const { gymBranch } = useGymBranch();
  const gymId = gymBranch?.gymId;
  const queryClient = useQueryClient();
  const [selectedMemberId, setSelectedMemberId] = useState<
    number | undefined
  >();

  const { data: pendingMembers = [], isLoading } = usePendingOnboardingMembers(
    gymId!
  );

  const mappedMembers: PendingMember[] = pendingMembers.map((member) => ({
    id: Number(member.id),
    name: member.name,
    phone: member.phone,
    gender: member.gender || 'N/A',
    height: (member as { height?: number }).height || 0,
    weight: (member as { weight?: number }).weight || 0,
    dob: member.dob || 'N/A',
    bloodGroup: member.bloodGroup || 'N/A',
    profilePicture: member.profilePicture,
    photoPath: member.photoPath,
  }));

  const { items: filteredMembers, search } = useFilterableList<PendingMember>(
    mappedMembers,
    searchItems
  );

  const handleAccept = (member: PendingMember) => {
    setSelectedMemberId(member.id);
    openSheet();
  };

  const handleReject = (member: PendingMember) => {
    showConfirm({
      title: 'Reject Onboarding Request',
      description: `Are you sure you want to reject ${member.name}'s onboarding request? This action cannot be undone and the applicant will be notified of the rejection.`,
      variant: 'destructive',
      confirmLabel: 'Reject Request',
      cancelLabel: 'Cancel',
      onConfirm: async () => {
        const result = await rejectOnboardingMember(member.id, queryClient);
        if (result.success) {
          toast.success(result.success);
        } else if (result.error) {
          toast.error(result.error);
        }
      },
    });
  };

  const columns = createPendingOnboardingColumns(handleAccept, handleReject);

  if (isLoading) {
    return (
      <div className="text-center py-8 text-primary-blue-200">Loading...</div>
    );
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={filteredMembers}
        toolbar={(table) => (
          <DataTableToolbar table={table} onSearch={search} filters={[]} />
        )}
      />
      <AddMember
        isOpen={isOpen}
        closeSheet={() => {
          closeSheet();
          setSelectedMemberId(undefined);
        }}
        gymId={gymId}
        onboardingId={selectedMemberId}
      />
    </>
  );
}
