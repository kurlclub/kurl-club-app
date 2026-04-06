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
  title?: string;
  message?: string;
}

export function PaymentSuccessDialog({
  open,
  onOpenChange,
  title = 'Subscription updated successfully',
  message = 'Your payment was completed successfully.',
}: PaymentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[542px] rounded-lg bg-secondary-blue-700 border-none px-5">
        <DialogHeader className="gap-4 items-center">
          <Image
            alt="Payment successful"
            width={337}
            height={337}
            src="/assets/svg/payment_success.svg"
            className="w-auto h-auto max-w-[300px] max-h-[300px]"
          />
          <div className="flex flex-col gap-3 items-center">
            <DialogTitle className="text-primary-blue-50 text-[24px] font-bold leading-normal">
              {title}
            </DialogTitle>
            <DialogDescription className="text-center text-white text-[15px] leading-normal">
              {message}
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button
            className="h-[42px] w-full"
            onClick={() => onOpenChange(false)}
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PaymentFailureDialog({
  open,
  onOpenChange,
  title = 'Payment failed',
  message = 'We could not complete your transaction. Please try again.',
}: PaymentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[542px] rounded-lg bg-secondary-blue-700 border-none gap-[18px] px-5">
        <DialogHeader className="gap-4 items-center">
          <Image
            alt="Payment failed"
            width={337}
            height={337}
            src="/assets/svg/payment_failure.svg"
            className="w-auto h-auto max-w-[300px] max-h-[300px]"
          />
          <div className="flex flex-col gap-3 items-center">
            <DialogTitle className="text-primary-blue-50 text-[24px] font-bold leading-normal">
              {title}
            </DialogTitle>
            <DialogDescription className="text-center text-white text-[15px] leading-normal">
              {message}
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
