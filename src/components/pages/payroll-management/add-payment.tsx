import { useMemo, useState } from 'react';

import { KSheet } from '@/components/shared/form/k-sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { getAvatarColor } from '@/lib/avatar-utils';
import { getInitials } from '@/lib/utils';
import type { PayrollRow } from '@/types/payroll-management';

import PaymentDetails from './payment-details';
import PaymentSuccess from './payment-success';

interface AddPaymentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: PayrollRow[];
}

const SALARY_PER_MEMBER = 80000;

const AddPayment = ({ open, onOpenChange, members }: AddPaymentProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPaymentDetailsOpen, setIsPaymentDetailsOpen] = useState(false);
  const [isPaymentSuccessOpen, setIsPaymentSuccessOpen] = useState(false);

  const unpaidMembers = useMemo(
    () => members.filter((member) => member.feeStatus === 'Unpaid'),
    [members]
  );

  const allSelected =
    unpaidMembers.length > 0 && selectedIds.length === unpaidMembers.length;
  const selectedCount = selectedIds.length;
  const totalAmountToPay = selectedCount * SALARY_PER_MEMBER;
  const selectedMembers = unpaidMembers.filter((member) =>
    selectedIds.includes(member.staffId)
  );

  const selectAllState: boolean | 'indeterminate' = allSelected
    ? true
    : selectedCount > 0
      ? 'indeterminate'
      : false;

  const handleToggleMember = (staffId: string) => {
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

    setSelectedIds(unpaidMembers.map((member) => member.staffId));
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

  const handlePayNow = () => {
    setIsPaymentDetailsOpen(false);
    setIsPaymentSuccessOpen(true);
  };

  const handleCloseSuccess = (openState: boolean) => {
    setIsPaymentSuccessOpen(openState);

    if (!openState) {
      setSelectedIds([]);
    }
  };

  const formattedMemberSalary = `₹${SALARY_PER_MEMBER.toLocaleString('en-IN')}`;
  const formattedTotal = `₹${totalAmountToPay.toLocaleString('en-IN')}`;

  return (
    <>
      <KSheet
        isOpen={open}
        onClose={handleCloseSheet}
        title="Bulk salary payment"
        className="w-140"
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-primary-blue-400 bg-secondary-blue-500 p-4">
            <p className="text-sm text-secondary-blue-200">Total selected</p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {selectedCount} member{selectedCount === 1 ? '' : 's'}
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
                    {unpaidMembers.length} unpaid members
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
                  No unpaid members available.
                </div>
              ) : (
                unpaidMembers.map((member) => {
                  const isSelected = selectedIds.includes(member.staffId);
                  const avatarStyle = getAvatarColor(member.name);

                  return (
                    <label
                      key={member.staffId}
                      className="flex cursor-pointer items-center justify-between rounded-lg border border-transparent px-3 py-2.5 transition-colors hover:border-primary-blue-400 hover:bg-primary-blue-400/20"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() =>
                            handleToggleMember(member.staffId)
                          }
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
                        {formattedMemberSalary}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          <Button
            className="w-full"
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
        salaryAmount={SALARY_PER_MEMBER}
        open={isPaymentDetailsOpen}
        onOpenChange={setIsPaymentDetailsOpen}
        onPayNow={handlePayNow}
      />

      <PaymentSuccess
        details={null}
        selectedMembers={selectedMembers}
        totalAmount={totalAmountToPay}
        salaryAmount={SALARY_PER_MEMBER}
        open={isPaymentSuccessOpen}
        onOpenChange={handleCloseSuccess}
      />
    </>
  );
};

export default AddPayment;
