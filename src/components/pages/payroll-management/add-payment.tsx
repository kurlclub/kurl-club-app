import { useEffect, useMemo, useState } from 'react';

import { toast } from 'sonner';

import { KSheet } from '@/components/shared/form/k-sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { usePaySalary } from '@/hooks/use-payroll';
import { getAvatarColor } from '@/lib/avatar-utils';
import { calculateTotalAmount, getPaymentMonth } from '@/lib/payroll-utils';
import { getInitials } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { useGymBranch } from '@/providers/gym-branch-provider';
import type { PayrollRow } from '@/types/payroll-management';
import { formatCurrency } from '@/utils/format-currency';

import PaymentDetails from './payment-details';
import PaymentSuccess from './payment-success';

interface AddPaymentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: PayrollRow[];
}

const AddPayment = ({ open, onOpenChange, members }: AddPaymentProps) => {
  const { gymBranch } = useGymBranch();
  const { user } = useAuth();
  const paySalaryMutation = usePaySalary();
  const [isPaymentDetailsOpen, setIsPaymentDetailsOpen] = useState(false);
  const [isPaymentSuccessOpen, setIsPaymentSuccessOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const paymentMonth = useMemo(() => getPaymentMonth(), []);

  const unpaidMembers = useMemo(
    () =>
      members.filter(
        (member) =>
          !member.isPaid && member.isSalaryConfigured && member.salary > 0
      ),
    [members]
  );

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    if (open) {
      setSelectedIds(unpaidMembers.map((member) => member.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const allSelected =
    unpaidMembers.length > 0 && selectedIds.length === unpaidMembers.length;
  const selectedMembers = unpaidMembers.filter((member) =>
    selectedIds.includes(member.id)
  );
  const selectedCount = selectedMembers.length;
  const totalAmountToPay = calculateTotalAmount(selectedMembers);

  const selectAllState: boolean | 'indeterminate' = allSelected
    ? true
    : selectedCount > 0
      ? 'indeterminate'
      : false;

  const handleToggleMember = (staffId: number) => {
    setSelectedIds((prev) =>
      prev.includes(staffId)
        ? prev.filter((id) => id !== staffId)
        : [...prev, staffId]
    );
  };

  const handleToggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(unpaidMembers.map((member) => member.id));
  };

  const handleCloseSheet = () => {
    setSelectedIds([]);
    onOpenChange(false);
  };

  const handleOpenPaymentDetails = () => {
    if (selectedCount === 0) return;
    onOpenChange(false);
    setIsPaymentDetailsOpen(true);
  };

  const handlePayNow = async () => {
    if (!gymBranch?.gymId) {
      toast.error('Gym branch not found.');
      return;
    }

    const paidBy = user?.userId;
    if (!paidBy) {
      toast.error('User not authenticated.');
      return;
    }

    if (selectedMembers.length === 0) {
      toast.error('No staff selected.');
      return;
    }

    setIsProcessing(true);
    const failures: { id: number; name: string; error: string }[] = [];
    const paymentDate = new Date();

    for (const member of selectedMembers) {
      try {
        await paySalaryMutation.mutateAsync({
          gymId: gymBranch.gymId,
          employeeType: member.roleKey,
          employeeId: member.id,
          amount: member.salary,
          paymentDate,
          paymentMonth,
          paidBy,
        });
      } catch (error) {
        failures.push({
          id: member.id,
          name: member.name,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    setIsProcessing(false);

    if (failures.length > 0) {
      toast.error(
        `Paid ${selectedMembers.length - failures.length}/${selectedMembers.length}. Failed: ${failures[0].name} - ${failures[0].error}`
      );
      return;
    }

    setIsPaymentDetailsOpen(false);
    setIsPaymentSuccessOpen(true);
  };

  const handleCloseSuccess = (openState: boolean) => {
    setIsPaymentSuccessOpen(openState);

    if (!openState) {
      setSelectedIds([]);
    }
  };

  const formattedTotal = formatCurrency(totalAmountToPay);

  return (
    <>
      <KSheet
        isOpen={open}
        onClose={handleCloseSheet}
        title="Bulk salary payment"
        className="w-140"
      >
        <div className="flex flex-col gap-4 h-full">
          <div className="rounded-xl border border-primary-blue-400 bg-secondary-blue-500 p-4">
            <p className="text-sm text-secondary-blue-200">Total selected</p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {selectedCount} staff{selectedCount === 1 ? '' : 's'}
            </p>
            <div className="mt-3 flex items-center justify-between rounded-lg bg-primary-blue-400/35 p-3">
              <span className="text-sm text-secondary-blue-200">
                Total payment to pay
              </span>
              <span className="text-lg font-semibold text-primary-green-500">
                {formattedTotal}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-primary-blue-400 bg-secondary-blue-500">
            <div className="flex items-center justify-between border-b border-primary-blue-400 px-4 py-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectAllState}
                  onCheckedChange={handleToggleSelectAll}
                />
                <div>
                  <p className="text-sm font-medium text-white">Select all</p>
                  <p className="text-xs text-secondary-blue-200">
                    {unpaidMembers.length} unpaid staffs
                  </p>
                </div>
              </div>
              <span className="text-xs text-secondary-blue-100">
                {selectedCount}/{unpaidMembers.length} selected
              </span>
            </div>

            <div className="max-h-90 space-y-1 overflow-y-auto p-2">
              {unpaidMembers.length === 0 ? (
                <div className="rounded-lg bg-primary-blue-400/25 px-3 py-4 text-center text-sm text-secondary-blue-100">
                  No unpaid staffs available.
                </div>
              ) : (
                unpaidMembers.map((member) => {
                  const isSelected = selectedIds.includes(member.id);
                  const avatarStyle = getAvatarColor(member.name);

                  return (
                    <label
                      key={member.id}
                      className="flex cursor-pointer items-center justify-between rounded-lg border border-transparent px-3 py-2.5 transition-colors hover:border-primary-blue-400 hover:bg-primary-blue-400/20"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleMember(member.id)}
                        />
                        <Avatar className="h-9 w-9">
                          <AvatarFallback style={avatarStyle}>
                            {getInitials(member.name)}
                          </AvatarFallback>
                          {member.imageUrl ? (
                            <AvatarImage
                              src={member.imageUrl}
                              alt={member.name}
                            />
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

                      <span className="text-sm font-medium text-white">
                        {formatCurrency(member.salary)}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          <Button
            className="mt-auto w-full"
            disabled={selectedCount === 0}
            onClick={handleOpenPaymentDetails}
          >
            Pay {formattedTotal}
          </Button>
        </div>
      </KSheet>

      <PaymentDetails
        details={null}
        selectedMembers={selectedMembers}
        totalAmount={totalAmountToPay}
        open={isPaymentDetailsOpen}
        onOpenChange={setIsPaymentDetailsOpen}
        onPayNow={handlePayNow}
        paymentMonth={paymentMonth}
        isProcessing={isProcessing}
      />

      <PaymentSuccess
        details={null}
        selectedMembers={selectedMembers}
        totalAmount={totalAmountToPay}
        open={isPaymentSuccessOpen}
        onOpenChange={handleCloseSuccess}
      />
    </>
  );
};

export default AddPayment;
