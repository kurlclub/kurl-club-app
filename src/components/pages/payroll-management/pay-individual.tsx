import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getAvatarColor } from '@/lib/avatar-utils';
import { formatPaymentMonthLabel } from '@/lib/payroll-utils';
import { getInitials } from '@/lib/utils';
import type { PayrollRow } from '@/types/payroll-management';
import { formatCurrency } from '@/utils/format-currency';

interface PayIndividualProps {
  details: PayrollRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProceedToPay: () => void;
  paymentMonth?: string;
}

const PayIndividual = ({
  details,
  open,
  onOpenChange,
  onProceedToPay,
  paymentMonth,
}: PayIndividualProps) => {
  if (!details) return null;

  const avatarStyle = getAvatarColor(details.name);
  const paymentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const payrollMonthLabel = formatPaymentMonthLabel(paymentMonth);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full border-primary-blue-400 bg-secondary-blue-700 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">Pay salary</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col items-center rounded-xl border border-primary-blue-400 bg-secondary-blue-500 p-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback style={avatarStyle} className="text-2xl">
                {getInitials(details.name)}
              </AvatarFallback>
              {details.imageUrl ? (
                <AvatarImage src={details.imageUrl} alt={details.name} />
              ) : null}
            </Avatar>

            <h3 className="mt-3 text-2xl font-bold text-white">
              {details.name}
            </h3>
            <p className="mt-1 text-sm text-secondary-blue-200">
              {details.staffId}
            </p>
            <div className="mt-3 rounded-lg bg-primary-blue-400/35 px-3 py-1.5">
              <span className="text-xs font-medium text-white">
                {details.role}
              </span>
            </div>

            <div className="mt-5 w-full border-t border-primary-blue-400 pt-5">
              <p className="text-center text-xs text-secondary-blue-200">
                Salary Amount
              </p>
              <p className="mt-2 text-center text-4xl font-bold text-white">
                {formatCurrency(details.salary)}
              </p>
              {details.isPaid && (
                <p className="mt-2 text-center text-xs text-green-400">
                  Already paid for this month
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-white/20 bg-primary-blue-400/25 p-4">
            <h4 className="font-semibold text-white">Payment Details</h4>

            <div className="space-y-2 rounded-lg bg-secondary-blue-500/50 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary-blue-200">Base Salary</span>
                <span className="font-medium text-white">
                  {formatCurrency(details.salary)}
                </span>
              </div>

              <div className="border-t border-primary-blue-400 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-white">Total Amount</span>
                  <span className="text-xl font-semibold text-primary-green-500">
                    {formatCurrency(details.salary)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 rounded-lg bg-secondary-blue-500/50 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary-blue-200">Payroll month</span>
                <span className="font-medium text-white">
                  {payrollMonthLabel}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary-blue-200">Payment Date</span>
                <span className="font-medium text-white">{paymentDate}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary-blue-200">Payment Method</span>
                <span className="font-medium text-white">Cash</span>
              </div>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={onProceedToPay}
            disabled={details.isPaid}
          >
            {details.isPaid
              ? 'Already Paid'
              : `Proceed to Pay ${formatCurrency(details.salary)}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PayIndividual;
