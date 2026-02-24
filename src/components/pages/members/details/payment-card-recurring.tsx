'use client';

import { Calendar, Clock, Edit, FileText, Info } from 'lucide-react';

import { FeeStatusBadge } from '@/components/shared/badges/fee-status-badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { FormOptionsResponse } from '@/hooks/use-gymform-options';
import {
  calculateDaysRemaining,
  formatDateTime,
  getPaymentBadgeStatus,
  safeParseDate,
} from '@/lib/utils';
import { RecurringPaymentMember } from '@/types/payment';

interface RecurringPaymentCardProps {
  member: RecurringPaymentMember;
  formOptions?: FormOptionsResponse | null;
  onRecordPayment: () => void;
  onGenerateInvoice: () => void;
}

export function RecurringPaymentCard({
  member,
  formOptions,
  onRecordPayment,
  onGenerateInvoice,
}: RecurringPaymentCardProps) {
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

  const progressValue = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = safeParseDate(currentCycle.startDate);
    const endDate = safeParseDate(currentCycle.endDate);
    if (!startDate || !endDate) return 0;

    startDate.setHours(0, 0, 0, 0);
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

  const membershipPlan = formOptions?.membershipPlans.find(
    (plan) => plan.membershipPlanId === membershipPlanId
  );

  return (
    <div className="shadow-sm bg-secondary-blue-500 rounded-lg h-full flex flex-col">
      <div className="flex items-center justify-between px-5 pt-5 pb-2 flex-wrap gap-y-3 gap-x-2">
        <div className="tracking-tight text-white text-base font-normal leading-normal">
          Recurring Payment
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onGenerateInvoice}
            className="bg-primary-blue-400 text-white hover:bg-primary-blue-500/80"
            size="sm"
          >
            <FileText className="h-4 w-4" />
            <span>Invoice</span>
          </Button>
          <Button
            onClick={onRecordPayment}
            className="bg-primary-blue-400 text-white hover:bg-primary-blue-500"
            size="sm"
          >
            <Edit className="h-4 w-4" />
            <span>Record Payment</span>
          </Button>
        </div>
      </div>

      {isPartialPayment && hasBuffer && bufferDaysRemaining > 0 && (
        <div className="bg-secondary-yellow-500/30 text-neutral-ochre-200 inline-flex items-center gap-2 px-4 py-1 border-l-4 border-yellow-400">
          <Info size={12} />
          <p className="text-xs">
            On Buffer Period: {bufferDaysRemaining} days remaining
          </p>
        </div>
      )}

      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-secondary-blue-50 text-sm font-medium flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Payment Timeline
          </span>
          <span className="text-secondary-blue-50 text-sm capitalize">
            {membershipPlan?.planName}
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
                ₹
                {currentCycle.lastAmountPaid
                  ? currentCycle.lastAmountPaid.toLocaleString()
                  : 0}
              </div>
              <div className="text-primary-blue-50 text-xs">Last Paid</div>
              <div className="text-white/70 text-xs">
                {currentCycle.lastAmountPaidDate
                  ? formatDateTime(currentCycle.lastAmountPaidDate, 'date')
                  : 'N/A'}
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

      <div className="px-5 py-2 border-t border-white/10 mt-auto">
        <div className="flex items-center justify-center gap-2 text-primary-blue-50 text-xs">
          <Clock className="h-3 w-3" />
          <span>Click Record Payment to manage recurring payments</span>
        </div>
      </div>
    </div>
  );
}
