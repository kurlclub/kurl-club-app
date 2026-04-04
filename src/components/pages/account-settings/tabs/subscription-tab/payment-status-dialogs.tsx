'use client';

import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentSuccessDialog({
  open,
  onOpenChange,
}: PaymentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[542px] rounded-lg bg-secondary-blue-700 border-none px-5">
        <DialogHeader className="gap-4 items-center">
          <Image
            alt="success"
            width={337}
            height={337}
            src="/assets/svg/payment_success.svg"
            className="w-auto h-auto max-w-[300px] max-h-[300px]"
          />
          <div className="flex flex-col gap-3 items-center">
            <DialogTitle className="text-primary-blue-50 text-[24px] font-bold leading-normal">
              Purchase successful!
            </DialogTitle>
            <DialogDescription className="text-white text-[15px] leading-normal">
              Enjoy KurlClub and all it’s features hassle free!
            </DialogDescription>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export function PaymentFailureDialog({
  open,
  onOpenChange,
}: PaymentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[542px] rounded-lg bg-secondary-blue-700 border-none gap-[18px] px-5">
        <DialogHeader className="gap-4 items-center">
          <Image
            alt="success"
            width={337}
            height={337}
            src="/assets/svg/payment_failure.svg"
            className="w-auto h-auto max-w-[300px] max-h-[300px]"
          />
          <div className="flex flex-col gap-3 items-center">
            <DialogTitle className="text-primary-blue-50 text-[24px] font-bold leading-normal">
              Purchase failed !
            </DialogTitle>
            <DialogDescription className="text-white text-[15px] leading-normal">
              It looks like we encountered some error in your transaction!
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button
            className="w-full h-[42px]"
            onClick={() => onOpenChange(false)}
          >
            Try again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
