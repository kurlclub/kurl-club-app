'use client';

import { FormEvent, useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNowStrict } from 'date-fns';
import {
  AlertTriangle,
  CalendarDays,
  Clock3,
  History,
  Loader2,
  Snowflake,
  Unlock,
} from 'lucide-react';
import { toast } from 'sonner';

import { KTextarea } from '@/components/shared/form/k-textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDateTime } from '@/lib/utils';
import {
  MemberFreezeHistoryItem,
  freezeMember,
  useMemberFreezeHistory,
} from '@/services/member';

type FreezeMemberDialogProps = {
  memberId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: FreezeTab;
  isFrozen?: boolean;
  activeFreeze?: MemberFreezeHistoryItem;
  onUnfreeze?: () => void;
  isUnfreezing?: boolean;
};

type FreezeTab = 'now' | 'history';

function formatFreezeDuration(days: number) {
  if (days === 0) return 'Same day';
  if (days === 1) return '1 day';
  return `${days} days`;
}

function formatActiveFreezeDate(date: string) {
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return formatDateTime(date, 'date');
  }

  return `${formatDateTime(date, 'date')} (${formatDistanceToNowStrict(
    parsedDate,
    {
      addSuffix: true,
    }
  )})`;
}

function FreezeHistoryCard({ item }: { item: MemberFreezeHistoryItem }) {
  return (
    <div
      className={[
        'rounded-lg border p-4 transition-colors',
        item.isActive
          ? 'border-secondary-yellow-500 bg-secondary-yellow-500/10 shadow-[0_0_0_1px_rgba(250,204,21,0.18)]'
          : 'border-primary-blue-400 bg-secondary-blue-500',
      ].join(' ')}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={[
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-md',
              item.isActive
                ? 'bg-secondary-yellow-500/20 text-secondary-yellow-500'
                : 'bg-primary-blue-400 text-primary-blue-100',
            ].join(' ')}
          >
            <Snowflake className="h-4 w-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-sm font-semibold text-white">
                {item.isActive ? 'Active freeze' : 'Freeze record'}
              </div>
              <Badge
                variant={item.isActive ? 'outline' : 'secondary'}
                className="shrink-0"
              >
                {item.isActive ? 'Active' : 'Closed'}
              </Badge>
            </div>
            <div className="mt-1 text-xs text-primary-blue-100">
              {item.isActive
                ? `Started ${formatActiveFreezeDate(item.freezeStartDate)}`
                : `${formatDateTime(item.freezeStartDate, 'date')} - ${formatDateTime(
                    item.freezeEndDate,
                    'date'
                  )}`}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-md bg-primary-blue-500/35 p-3">
        <div className="mb-1 text-xs font-medium uppercase text-primary-blue-100">
          Reason
        </div>
        <p className="text-sm leading-6 text-white">
          {item.reason || 'No reason added.'}
        </p>
      </div>

      <div className="mt-4 grid gap-2 text-xs text-primary-blue-100 sm:grid-cols-3">
        <div className="flex items-center gap-2 rounded-md bg-primary-blue-500/25 px-3 py-2">
          <CalendarDays className="h-3.5 w-3.5 text-primary-green-500" />
          <span>Start: {formatDateTime(item.freezeStartDate, 'date')}</span>
        </div>
        <div className="flex items-center gap-2 rounded-md bg-primary-blue-500/25 px-3 py-2">
          <CalendarDays className="h-3.5 w-3.5 text-primary-green-500" />
          <span>End: {formatDateTime(item.freezeEndDate, 'date')}</span>
        </div>
        <div className="flex items-center gap-2 rounded-md bg-primary-blue-500/25 px-3 py-2">
          <Clock3 className="h-3.5 w-3.5 text-primary-green-500" />
          <span>{formatFreezeDuration(item.freezeDurationDays)}</span>
        </div>
      </div>
    </div>
  );
}

export function FreezeMemberDialog({
  memberId,
  open,
  onOpenChange,
  initialTab = 'now',
  isFrozen = false,
  activeFreeze,
  onUnfreeze,
  isUnfreezing = false,
}: FreezeMemberDialogProps) {
  const [activeTab, setActiveTab] = useState<FreezeTab>(initialTab);
  const [reason, setReason] = useState('');
  const queryClient = useQueryClient();

  const {
    data: freezeHistory = [],
    isFetching: isFreezeHistoryFetching,
    isError: isFreezeHistoryError,
    refetch: refetchFreezeHistory,
  } = useMemberFreezeHistory(memberId, open && activeTab === 'history');
  const orderedFreezeHistory = [...freezeHistory].sort((current, next) => {
    const dateOrder =
      new Date(next.freezeStartDate).getTime() -
      new Date(current.freezeStartDate).getTime();

    return dateOrder || next.id - current.id;
  });

  const freezeMutation = useMutation({
    mutationFn: () => freezeMember(memberId, { reason: reason.trim() }),
    onSuccess: async (response) => {
      toast.success(response?.message || 'Member frozen successfully.');
      setReason('');
      setActiveTab('history');
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
        error instanceof Error ? error.message : 'Failed to freeze member.'
      );
    },
  });

  const handleTabChange = (value: string) => {
    const nextTab = value as FreezeTab;
    setActiveTab(nextTab);

    if (nextTab === 'history' && open) {
      void refetchFreezeHistory();
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!reason.trim()) {
      toast.error('Please enter a reason before freezing this member.');
      return;
    }

    freezeMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-primary-blue-400 bg-primary-blue-500 text-white sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Freeze the member</DialogTitle>
          <DialogDescription className="text-primary-blue-200">
            {isFrozen
              ? 'This member is already frozen. Review the active freeze or unfreeze the member.'
              : 'Freezing a member temporarily pauses their active membership access.'}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="now">
              {isFrozen ? (
                <Unlock className="h-4 w-4 mr-1" />
              ) : (
                <Snowflake className="h-4 w-4 mr-1" />
              )}
              {isFrozen ? 'Frozen Details' : 'Freeze Now'}
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-1" />
              Freeze History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="now" className="mt-0">
            {isFrozen ? (
              <div className="space-y-4">
                <div className="rounded-md border border-secondary-yellow-500/60 bg-secondary-yellow-500/10 p-4">
                  <div className="mb-3 flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-secondary-yellow-500" />
                    <div>
                      <div className="text-sm font-semibold text-white">
                        Member access is frozen
                      </div>
                      <div className="text-xs text-primary-blue-100">
                        Frozen from{' '}
                        {formatDateTime(activeFreeze?.freezeStartDate, 'date')}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-md bg-primary-blue-500/40 p-3">
                    <div className="mb-1 text-xs font-medium uppercase text-primary-blue-100">
                      Reason
                    </div>
                    <p className="text-sm text-white">
                      {activeFreeze?.reason || 'No reason added.'}
                    </p>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="secondary"
                    onClick={() => onOpenChange(false)}
                  >
                    Close
                  </Button>
                  <Button onClick={onUnfreeze} disabled={isUnfreezing}>
                    {isUnfreezing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Unlock className="h-4 w-4" />
                    )}
                    Unfreeze
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <KTextarea
                  id="freeze-reason"
                  label="Reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  className="min-h-28 placeholder:text-primary-blue-200"
                  disabled={freezeMutation.isPending}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => onOpenChange(false)}
                    disabled={freezeMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={freezeMutation.isPending}>
                    {freezeMutation.isPending && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Submit
                  </Button>
                </DialogFooter>
              </form>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
              {isFreezeHistoryFetching ? (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-primary-blue-200">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading freeze history
                </div>
              ) : isFreezeHistoryError ? (
                <div className="rounded-md border border-alert-red-600/40 bg-alert-red-600/10 p-4 text-sm text-white">
                  Failed to load freeze history.
                </div>
              ) : orderedFreezeHistory.length === 0 ? (
                <div className="rounded-md border border-primary-blue-400 bg-secondary-blue-500 p-4 text-center text-sm text-primary-blue-200">
                  No freeze history found.
                </div>
              ) : (
                orderedFreezeHistory.map((item) => (
                  <FreezeHistoryCard key={item.id} item={item} />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
