'use client';

import Link from 'next/link';

import { Crown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type UpgradePromptModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  ctaLabel?: string;
  secondaryLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

export function UpgradePromptModal({
  open,
  onOpenChange,
  title,
  message,
  ctaLabel = 'See plans',
  secondaryLabel = 'Maybe later',
  onConfirm,
  onCancel,
}: UpgradePromptModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-secondary-blue-400 bg-secondary-blue-500 text-white">
        <DialogHeader className="text-left">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-primary-green-500/15 border border-primary-green-500/30 flex items-center justify-center">
              <Crown className="h-5 w-5 text-primary-green-500" />
            </div>
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className="text-primary-blue-100 mt-1">
                {message}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter className="sm:justify-start">
          {onConfirm ? (
            <Button className="h-11" onClick={onConfirm}>
              {ctaLabel}
            </Button>
          ) : (
            <Button asChild className="h-11" onClick={onCancel}>
              <Link href="/account-settings?tab=subscription">{ctaLabel}</Link>
            </Button>
          )}
          <Button
            variant="outline"
            className="h-11 border-white/15 bg-transparent hover:bg-white/5"
            onClick={onCancel}
          >
            {secondaryLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
