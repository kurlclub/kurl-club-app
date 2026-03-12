'use client';

import Link from 'next/link';

import { Clock, Crown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type SubscriptionExpiringModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planName?: string;
  endDateLabel?: string;
  daysRemaining?: number | null;
};

export function SubscriptionExpiringModal({
  open,
  onOpenChange,
  planName,
  endDateLabel,
  daysRemaining,
}: SubscriptionExpiringModalProps) {
  const daysText =
    typeof daysRemaining === 'number' ? `${daysRemaining} days` : 'soon';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-secondary-blue-400 bg-secondary-blue-500 text-white">
        <DialogHeader className="text-left">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-primary-green-500/15 border border-primary-green-500/30 flex items-center justify-center">
              <Clock className="h-5 w-5 text-primary-green-500" />
            </div>
            <div>
              <DialogTitle>Subscription expiring soon</DialogTitle>
              <DialogDescription className="text-primary-blue-100 mt-1">
                Your {planName || 'current'} plan ends in {daysText}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="rounded-2xl border border-secondary-blue-400 bg-primary-blue-400/40 p-4">
          <div className="flex items-center gap-2 text-sm text-primary-blue-100">
            <Crown className="h-4 w-4 text-primary-green-500" />
            <span>Valid till {endDateLabel || 'your billing date'}.</span>
          </div>
        </div>

        <DialogFooter className="sm:justify-start">
          <Button asChild className="h-11">
            <Link href="/account-settings?tab=subscription">See plans</Link>
          </Button>
          <Button
            variant="outline"
            className="h-11 border-white/15 bg-transparent hover:bg-white/5"
            onClick={() => onOpenChange(false)}
          >
            Remind me later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
