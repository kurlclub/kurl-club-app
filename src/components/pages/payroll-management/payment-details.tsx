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
  selectedMembers?: PayrollRow[];
  totalAmount?: number;
  salaryAmount?: number;
  paymentMethod?: string;
}

const PaymentDetails = ({
  details,
  open,
  onOpenChange,
  onPayNow,
  selectedMembers,
  totalAmount,
  salaryAmount = 80000,
  paymentMethod = 'Cash',
}: PaymentDetailsProps) => {
  const members = selectedMembers?.length
    ? selectedMembers
    : details
      ? [details]
      : [];

  if (members.length === 0) return null;

  const isBulkPayment = members.length > 1;
  const amount = totalAmount ?? members.length * salaryAmount;
  const currentDate = new Intl.DateTimeFormat('en-GB').format(new Date());
  const formattedSalary = `₹${salaryAmount.toLocaleString('en-IN')}`;
  const formattedTotal = `₹${amount.toLocaleString('en-IN')}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full border-primary-blue-400 bg-secondary-blue-700 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Payment details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-primary-blue-400 bg-secondary-blue-500 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-secondary-blue-200">Selected users</p>
              <p className="text-sm text-white">{members.length}</p>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-sm text-secondary-blue-200">Total payment</p>
              <p className="text-xl font-semibold text-primary-green-500">
                {formattedTotal}
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
              <span className="font-medium text-white">{paymentMethod}</span>
            </div>
            <div className="flex items-center justify-between border-t border-primary-blue-400 pt-3">
              <span className="text-white">Total amount to pay</span>
              <span className="text-xl font-semibold text-primary-green-500">
                {formattedTotal}
              </span>
            </div>
          </div>

          <div className="max-h-50 space-y-2 overflow-y-auto rounded-xl border border-primary-blue-400 bg-secondary-blue-500 p-3">
            {members.map((member) => {
              const avatarStyle = getAvatarColor(member.name);

              return (
                <div
                  key={member.staffId}
                  className="flex items-center justify-between rounded-lg bg-primary-blue-400/20 px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback style={avatarStyle}>
                        {getInitials(member.name)}
                      </AvatarFallback>
                      {member.imageUrl ? (
                        <AvatarImage src={member.imageUrl} alt={member.name} />
                      ) : null}
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {member.name}
                      </p>
                      <p className="text-xs text-secondary-blue-200">
                        {member.role} • {member.staffId}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm font-medium text-white">
                    {formattedSalary}
                  </p>
                </div>
              );
            })}
          </div>

          <Button className="w-full" onClick={onPayNow}>
            {isBulkPayment ? 'Pay now' : 'Pay now'} {formattedTotal}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDetails;
