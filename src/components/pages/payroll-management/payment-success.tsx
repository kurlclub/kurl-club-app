import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { PayrollRow } from '@/types/payroll-management';

interface PaymentSuccessProps {
  details: PayrollRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PaymentSuccess = ({
  details,
  open,
  onOpenChange,
}: PaymentSuccessProps) => {
  if (!details) return null;

  const paidAmount = `₹${(80000).toLocaleString('en-IN')}`;
  const currentDate = new Intl.DateTimeFormat('en-GB').format(new Date());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full border-primary-blue-400 bg-secondary-blue-700 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-white">
            Payment Completed
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Image
              src="/assets/svg/payment-success.svg"
              alt="Payment Success"
              width={80}
              height={80}
            />
          </div>

          <div className="text-center">
            <p className="text-lg font-medium text-white">{details.name}</p>
            <p className="text-sm text-secondary-blue-100">{details.staffId}</p>
          </div>

          <div className="w-full space-y-2 rounded-xl border border-white/20 bg-primary-blue-400/25 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-secondary-blue-200">Amount paid</span>
              <span className="font-semibold text-primary-green-500">
                {paidAmount}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-secondary-blue-200">Paid on</span>
              <span className="font-medium text-white">{currentDate}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-secondary-blue-200">Method</span>
              <span className="font-medium text-white">Cash</span>
            </div>
          </div>

          <Button className="w-full" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentSuccess;
