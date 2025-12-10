'use client';

import React from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { Clock, Edit, FileText, Info } from 'lucide-react';

import { FeeStatusBadge } from '@/components/shared/badges/fee-status-badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { FormOptionsResponse } from '@/hooks/use-gymform-options';
import { useSheet } from '@/hooks/use-sheet';
import {
  calculateDaysRemaining,
  formatDateTime,
  getPaymentBadgeStatus,
} from '@/lib/utils';
import { useMemberPaymentDetails } from '@/services/member';

import { ManagePaymentSheet } from '../../payments/recurring';
import { InvoiceGenerator } from '../../payments/shared';

interface PaymentCardProps {
  memberId: string | number;
  formOptions?: FormOptionsResponse | null;
}

function PaymentCard({ memberId, formOptions }: PaymentCardProps) {
  const { data: paymentData, isLoading } = useMemberPaymentDetails(memberId);
  const { isOpen, openSheet, closeSheet } = useSheet();
  const {
    isOpen: isInvoiceOpen,
    openSheet: openInvoice,
    closeSheet: closeInvoice,
  } = useSheet();
  const queryClient = useQueryClient();

  const handleCloseSheet = () => {
    closeSheet();
    // Revalidate payment data after sheet closes
    queryClient.invalidateQueries({
      queryKey: ['memberPaymentDetails', memberId],
    });
  };

  if (isLoading) {
    return <Skeleton />;
  }

  if (!paymentData?.data) {
    return (
      <div className="rounded-lg h-full bg-secondary-blue-500 p-5 pb-7 w-full">
        <p className="text-white">No payment data available</p>
      </div>
    );
  }

  const member = paymentData.data;

  // Type guard to check if it's a recurring payment member
  if (member.billingType !== 'Recurring') {
    return (
      <div className="rounded-lg h-full bg-secondary-blue-500 p-5 pb-7 w-full">
        <p className="text-white">This member is on per-session billing</p>
      </div>
    );
  }

  const { currentCycle, membershipPlanId } = member;

  if (!currentCycle) {
    return (
      <div className="rounded-lg h-full bg-secondary-blue-500 p-5 pb-7 w-full">
        <p className="text-white">No current cycle data available</p>
      </div>
    );
  }

  const status = getPaymentBadgeStatus(
    currentCycle.cyclePaymentStatus,
    currentCycle.pendingAmount
  );
  const bufferDaysRemaining = currentCycle.bufferEndDate
    ? calculateDaysRemaining(currentCycle.bufferEndDate)
    : 0;
  const hasBuffer =
    currentCycle.bufferEligible &&
    currentCycle.bufferEndDate &&
    bufferDaysRemaining >= 0;
  const daysRemaining = hasBuffer
    ? calculateDaysRemaining(currentCycle.bufferEndDate!)
    : calculateDaysRemaining(currentCycle.dueDate);
  const isPartialPayment = currentCycle.cyclePaymentStatus === 'partially_paid';

  // Progress calculation based on payment cycle
  const progressValue = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(currentCycle.startDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(currentCycle.endDate);
    endDate.setHours(0, 0, 0, 0);

    const cycleDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysPassed = Math.ceil(
      (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (cycleDays <= 0) return 0;
    return Math.max(0, Math.min(100, (daysPassed / cycleDays) * 100));
  })();

  // Get membership plan name from form options
  const membershipPlan = formOptions?.membershipPlans.find(
    (plan) => plan.membershipPlanId === membershipPlanId
  );

  return (
    <>
      <div className="shadow-sm bg-secondary-blue-500 rounded-lg h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <div className="tracking-tight text-white text-base font-normal leading-normal">
            Dues & Payments
          </div>
          <div className="flex gap-2">
            <Button
              onClick={openInvoice}
              className="bg-primary-blue-400 text-white hover:bg-primary-blue-500/80"
              size="sm"
            >
              <FileText className="h-4 w-4" />
              <span>Invoice</span>
            </Button>
            <Button
              onClick={openSheet}
              className="bg-primary-blue-400 text-white hover:bg-primary-blue-500"
              size="sm"
            >
              <Edit className="h-4 w-4" />
              <span>Record Payment</span>
            </Button>
          </div>
        </div>

        {/* Buffer Period Banner */}
        {isPartialPayment && hasBuffer && bufferDaysRemaining > 0 && (
          <div className="bg-secondary-yellow-500/30 text-neutral-ochre-200 inline-flex items-center gap-2 px-4 py-1 border-l-4 border-yellow-400">
            <Info size={12} />{' '}
            <p className="text-xs">
              On Buffer Period: {bufferDaysRemaining} days remaining
            </p>
          </div>
        )}

        {/* Payment Timeline with Progress Component */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-secondary-blue-50 text-sm font-medium">
              Payment Timeline
            </span>
            <span className="text-secondary-blue-50 text-sm capitalize">
              Current Plan - {membershipPlan?.planName}
            </span>
          </div>

          <div className="relative">
            <Progress value={progressValue} className="w-full h-2 mb-2" />
            <div className="flex justify-between text-xs text-secondary-blue-50">
              <span>{formatDateTime(currentCycle.startDate, 'date')}</span>
              <span>{formatDateTime(currentCycle.endDate, 'date')}</span>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="px-5 pb-4">
          <div className="bg-primary-blue-400 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white font-medium">Fee Overview</span>
              <FeeStatusBadge status={status} />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-2">
              <div className="text-center flex-1">
                <div
                  className={`text-lg font-bold ${currentCycle.pendingAmount > 0 ? 'text-red-400' : 'text-green-400'}`}
                >
                  ₹{currentCycle.pendingAmount.toLocaleString()}
                </div>
                <div className="text-primary-blue-50 text-xs">Outstanding</div>
              </div>

              <Separator
                orientation="vertical"
                className="hidden sm:block h-8 bg-white/20"
              />

              <div className="text-center flex-1">
                <div className="text-lg font-bold text-blue-400">
                  ₹{currentCycle.lastAmountPaid.toLocaleString()}
                </div>
                <div className="text-primary-blue-50 text-xs">Last Paid</div>
                <div className="text-white/70 text-xs">
                  {formatDateTime(currentCycle.lastAmountPaidDate, 'date')}
                </div>
              </div>

              <Separator
                orientation="vertical"
                className="hidden sm:block h-8 bg-white/20"
              />

              <div className="text-center flex-1">
                <div
                  className={`text-lg font-bold ${daysRemaining < 0 ? 'text-red-400' : daysRemaining <= 3 ? 'text-orange-400' : 'text-white'}`}
                >
                  {Math.abs(daysRemaining)}
                </div>
                <div className="text-primary-blue-50 text-xs">
                  {daysRemaining < 0 ? 'Days Overdue' : 'Days Left'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-2 border-t border-white/10 mt-auto">
          <div className="flex items-center justify-center gap-2 text-primary-blue-50 text-xs">
            <Clock className="h-3 w-3" />
            <span>Cycle {currentCycle.cycleId}</span>
          </div>
        </div>
      </div>

      <ManagePaymentSheet
        open={isOpen}
        onOpenChange={handleCloseSheet}
        member={member}
      />
      <InvoiceGenerator
        open={isInvoiceOpen}
        onOpenChange={closeInvoice}
        member={member}
      />
    </>
  );
}

export default PaymentCard;
