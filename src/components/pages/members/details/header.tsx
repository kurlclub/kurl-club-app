'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Fingerprint,
  Loader2,
  RotateCcw,
  Snowflake,
  Trash2,
  Unlock,
} from 'lucide-react';
import { toast } from 'sonner';

import MemberStatusBadge from '@/components/shared/badges/member-status-badge';
import { KEdit } from '@/components/shared/icons';
import { Button } from '@/components/ui/button';
import { useAppDialog } from '@/hooks/use-app-dialog';
import { FormOptionsResponse } from '@/hooks/use-gymform-options';
import { formatDateTime } from '@/lib/utils';
import {
  deleteMember,
  syncMemberBiometric,
  unfreezeMember,
  useMemberFreezeHistory,
} from '@/services/member';
import type { MemberDetails, MembershipState } from '@/types/member.types';

import { FreezeMemberDialog } from './freeze-member-dialog';
import { RejoinMemberDialog } from './rejoin-member-dialog';

interface HeaderProps {
  isEditing: boolean;
  isSaving?: boolean;
  handleSave: () => void;
  toggleEdit: () => void;
  memberId: string;
  isFrozen?: boolean;
  membershipState?: MembershipState;
  member?: MemberDetails | null;
  plans?: FormOptionsResponse['membershipPlans'];
}

function Header({
  isEditing,
  isSaving = false,
  handleSave,
  toggleEdit,
  memberId,
  isFrozen = false,
  membershipState,
  member,
  plans = [],
}: HeaderProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isFreezeDialogOpen, setIsFreezeDialogOpen] = useState(false);
  const [freezeDialogInitialTab, setFreezeDialogInitialTab] = useState<
    'now' | 'history'
  >('now');
  const [freezeDialogKey, setFreezeDialogKey] = useState(0);
  const [isRejoinOpen, setIsRejoinOpen] = useState(false);
  const isInactive = membershipState === 'inactive';

  const { showConfirm } = useAppDialog();
  const { data: freezeHistory = [] } = useMemberFreezeHistory(
    memberId,
    !!memberId && isFrozen
  );
  const activeFreeze = freezeHistory.find((item) => item.isActive);

  const syncBiometricMutation = useMutation({
    mutationFn: syncMemberBiometric,
    onSuccess: (response) => {
      toast.success(
        response?.message || 'Member synced to biometric device successfully.'
      );
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to sync member to biometric device.'
      );
    },
  });

  const unfreezeMutation = useMutation({
    mutationFn: unfreezeMember,
    onSuccess: async (response) => {
      toast.success(response?.message || 'Member unfrozen successfully.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['member', memberId] }),
        queryClient.invalidateQueries({ queryKey: ['gymMembers'] }),
        queryClient.invalidateQueries({ queryKey: ['allGymMembers'] }),
        queryClient.invalidateQueries({
          queryKey: ['memberFreezeHistory', memberId],
        }),
      ]);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to unfreeze member.'
      );
    },
  });

  const handleDeleteCustomer = (id: string) => {
    showConfirm({
      title: `Delete Member`,
      description: `Are you sure you want to delete this member from your Database? This action cannot be undone.`,
      variant: 'destructive',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        try {
          const response = await deleteMember(id, queryClient);

          if (response.success) {
            toast.success(response.success);
            router.push('/members');
          } else {
            toast.error(response.error || 'Failed to delete member.');
          }
        } catch {
          toast.error('Failed to delete member.');
        }
      },
    });
  };

  const handleUnfreezeMember = () => {
    if (!memberId) return;

    showConfirm({
      title: 'Unfreeze Member',
      description: 'Are you sure you want to unfreeze this member?',
      confirmLabel: 'Unfreeze',
      onConfirm: async () => {
        unfreezeMutation.mutate(memberId);
      },
    });
  };

  return (
    <div className="flex sticky pt-4 md:pt-6.5 pb-4 z-20 drop-shadow-xl -top-px w-full items-center bg-primary-blue-500 justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-2">
        <MemberStatusBadge status={membershipState ?? 'active'} />
        {isInactive && (
          <Button
            className="h-7.5 rounded-full px-3 text-sm"
            disabled={!memberId}
            onClick={() => setIsRejoinOpen(true)}
          >
            <RotateCcw className="h-4 w-4" />
            Rejoin
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <Button
              variant="secondary"
              onClick={toggleEdit}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        ) : (
          <>
            {/* TODO: Re-enable message button when the feature is ready */}
            {/* <Button className="h-10 w-10" variant="outline">
              <MessageSquareText className="text-primary-green-500 h-5! w-5!" />
            </Button> */}
            <Button className="h-10" variant="outline" onClick={toggleEdit}>
              <KEdit className="h-5! w-5!" />
              Edit
            </Button>
            <Button
              className="h-10"
              variant="outline"
              disabled={!memberId || syncBiometricMutation.isPending}
              onClick={() => syncBiometricMutation.mutate(memberId)}
            >
              {syncBiometricMutation.isPending ? (
                <Loader2 className="h-5! w-5! animate-spin" />
              ) : (
                <Fingerprint className="h-5! w-5!" />
              )}
              Sync Biometric
            </Button>
            {isFrozen ? (
              <Button
                className="h-10"
                variant="outline"
                disabled={!memberId}
                onClick={() => {
                  setFreezeDialogInitialTab('history');
                  setFreezeDialogKey((key) => key + 1);
                  setIsFreezeDialogOpen(true);
                }}
              >
                <Snowflake className="h-5! w-5!" />
                Freeze History
              </Button>
            ) : (
              <Button
                className="h-10"
                variant="outline"
                disabled={!memberId}
                onClick={() => {
                  setFreezeDialogInitialTab('now');
                  setFreezeDialogKey((key) => key + 1);
                  setIsFreezeDialogOpen(true);
                }}
              >
                <Snowflake className="h-5! w-5!" />
                Freeze
              </Button>
            )}
            <Button
              className="h-10"
              variant="destructive"
              onClick={() => handleDeleteCustomer(memberId)}
            >
              <Trash2 className="h-5! w-5!" />
              Delete
            </Button>
          </>
        )}
      </div>
      {isFrozen && (
        <div className="flex basis-full flex-col gap-3 rounded-md border border-secondary-yellow-500/60 bg-secondary-yellow-500/10 p-3 text-white md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-secondary-yellow-500" />
            <div>
              <div className="text-sm font-semibold">
                This member is currently frozen
              </div>
              <div className="text-xs text-primary-blue-100">
                Frozen from{' '}
                {formatDateTime(activeFreeze?.freezeStartDate, 'date')}
                {activeFreeze?.reason ? `: ${activeFreeze.reason}` : ''}
              </div>
            </div>
          </div>
          <Button
            className="h-9 shrink-0"
            disabled={!memberId || unfreezeMutation.isPending}
            onClick={handleUnfreezeMember}
          >
            {unfreezeMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Unlock className="h-4 w-4" />
            )}
            Unfreeze
          </Button>
        </div>
      )}
      <FreezeMemberDialog
        key={freezeDialogKey}
        memberId={memberId}
        open={isFreezeDialogOpen}
        onOpenChange={setIsFreezeDialogOpen}
        initialTab={freezeDialogInitialTab}
        isFrozen={isFrozen}
        activeFreeze={activeFreeze}
        onUnfreeze={handleUnfreezeMember}
        isUnfreezing={unfreezeMutation.isPending}
      />
      <RejoinMemberDialog
        memberId={memberId}
        open={isRejoinOpen}
        onOpenChange={setIsRejoinOpen}
        member={member}
        plans={plans}
      />
    </div>
  );
}

export default Header;
