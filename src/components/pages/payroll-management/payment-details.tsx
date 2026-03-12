import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getAvatarColor } from '@/lib/avatar-utils';
import { getInitials } from '@/lib/utils';
import type { PayrollRow } from '@/types/payroll-management';

interface PaymentDetailsProps {
  details: PayrollRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPayNow: () => void;
}

const PaymentDetails = ({
  details,
  open,
  onOpenChange,
  onPayNow,
}: PaymentDetailsProps) => {
  if (!details) return null;

  const salaryAmount = 80000;
  const totalAmount = salaryAmount;
  const currentDate = new Intl.DateTimeFormat('en-GB').format(new Date());
  const formattedSalary = `₹${salaryAmount.toLocaleString('en-IN')}`;
  const formattedTotal = `₹${totalAmount.toLocaleString('en-IN')}`;
  const avatarStyle = getAvatarColor(details.name);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full border-primary-blue-400 bg-secondary-blue-700 sm:max-w-135.5">
        <DialogHeader>
          <DialogTitle className="text-white">Payment Confirmation</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-primary-blue-400/30 p-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback style={avatarStyle}>
                {getInitials(details.name)}
              </AvatarFallback>
              {details.imageUrl ? (
                <AvatarImage src={details.imageUrl} alt={details.name} />
              ) : null}
            </Avatar>

            <div>
              <p className="font-medium text-white">{details.name}</p>
              <p className="text-sm text-secondary-blue-100">
                {details.role} • {details.staffId}
              </p>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-white/20 bg-primary-blue-400/25 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-secondary-blue-200">Payroll month</span>
              <span className="font-medium text-white">March 2026</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-secondary-blue-200">Payment date</span>
              <span className="font-medium text-white">{currentDate}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-secondary-blue-200">Payment method</span>
              <span className="font-medium text-white">Cash</span>
            </div>
            <div className="flex items-center justify-between border-t border-primary-blue-400 pt-3 text-sm">
              <span className="text-secondary-blue-200">Base salary</span>
              <span className="font-medium text-white">{formattedSalary}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">Total amount to pay</span>
              <span className="text-xl font-semibold text-primary-green-500">
                {formattedTotal}
              </span>
            </div>
          </div>

          <Button className="w-full" onClick={onPayNow}>
            Pay now {formattedTotal}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDetails;
