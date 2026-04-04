'use client';

import { CheckCircle2, XCircle } from 'lucide-react';

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
  message: string;
}

export function PaymentSuccessDialog({
  open,
  onOpenChange,
  title = 'Subscription Updated',
  message,
}: PaymentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-primary-green-500/40 bg-secondary-blue-500 text-white">
        <DialogHeader>
          <div className="mb-2 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary-green-300" />
            <DialogTitle className="text-primary-green-300">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-secondary-blue-200">
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-primary-green-400 text-primary-blue-800 hover:bg-primary-green-300"
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PaymentFailureDialog({
  open,
  onOpenChange,
  title = 'Payment Verification Failed',
  message,
}: PaymentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-red-500/40 bg-secondary-blue-500 text-white">
        <DialogHeader>
          <div className="mb-2 flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-400" />
            <DialogTitle className="text-red-400">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-secondary-blue-200">
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-red-500 text-white hover:bg-red-400"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
