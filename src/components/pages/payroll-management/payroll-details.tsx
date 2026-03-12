import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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

interface PayRollDetailsProps {
  details: PayrollRow | null;
  isDetailsOpen: boolean;
  setIsDetailsOpen: (open: boolean) => void;
  onMakePayment: () => void;
}

const PayRollDetails = ({
  details,
  isDetailsOpen,
  setIsDetailsOpen,
  onMakePayment,
}: PayRollDetailsProps) => {
  if (!details) return null;

  const avatarStyle = getAvatarColor(details.name);
  const currentDate = new Intl.DateTimeFormat('en-GB').format(new Date());
  const paymentAmount = '₹80,000';

  return (
    <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
      <DialogContent className="w-full border-primary-blue-400 bg-secondary-blue-700 sm:max-w-135.5">
        <DialogHeader>
          <DialogTitle className="text-white">Payroll Details</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-3">
          <Avatar className="h-17.5 w-17.5">
            <AvatarFallback style={avatarStyle}>
              {getInitials(details.name)}
            </AvatarFallback>
            {details.imageUrl ? (
              <AvatarImage src={details.imageUrl} alt={details.name} />
            ) : null}
          </Avatar>

          <div className="text-center">
            <p className="text-[28px] font-medium leading-normal text-white">
              {details.name}
            </p>
            <div className="mt-1.5 flex items-center justify-center gap-1.5">
              <span className="text-[13px] leading-normal text-secondary-blue-100">
                {details.role}
              </span>
              <span className="mt-1.5 block h-1 w-1 rounded-[3px] bg-secondary-blue-100" />
              <span className="text-[13px] leading-normal text-secondary-blue-100">
                {details.staffId}
              </span>
            </div>
          </div>

          <Badge
            variant="outline"
            className="border-primary-blue-300 bg-primary-blue-400/40 text-white"
          >
            {details.feeStatus}
          </Badge>

          <div className="mt-2 flex w-full flex-col gap-3">
            <div className="rounded-xl border border-white/40 bg-primary-blue-400/39 p-4">
              <div className="flex items-center justify-between gap-3 border-b border-primary-blue-400 py-3">
                <span className="text-sm leading-normal text-secondary-blue-200">
                  Base salary
                </span>
                <span className="text-base font-semibold leading-normal text-white">
                  {paymentAmount}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 pt-3">
                <span className="text-sm leading-normal text-white">
                  Total paid up
                </span>
                <span className="text-[20px] font-medium leading-normal text-primary-green-500">
                  {paymentAmount}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-white/40 bg-primary-blue-400/39 p-4">
              <div className="flex items-center justify-between gap-3 border-b border-primary-blue-400 py-3">
                <span className="text-sm leading-normal text-secondary-blue-200">
                  Payment date
                </span>
                <span className="text-base font-semibold leading-normal text-white">
                  {currentDate}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 pt-3">
                <span className="text-sm leading-normal text-secondary-blue-200">
                  Payment Method
                </span>
                <span className="text-base font-semibold leading-normal text-white">
                  Cash
                </span>
              </div>
            </div>
          </div>

          <Button
            disabled={details.feeStatus === 'Paid'}
            className="mt-5 w-full"
            onClick={onMakePayment}
          >
            {details.feeStatus === 'Paid'
              ? 'Payment Completed'
              : 'Make Payment'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PayRollDetails;
