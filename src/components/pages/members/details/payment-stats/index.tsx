'use client';

import React from 'react';

import { useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Edit,
  FileText,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';

import { FeeStatusBadge } from '@/components/shared/badges/fee-status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { FormOptionsResponse } from '@/hooks/use-gymform-options';
import { useSheet } from '@/hooks/use-sheet';
import {
  calculateDaysRemaining,
  formatDateTime,
  getPaymentBadgeStatus,
  safeParseDate,
} from '@/lib/utils';
import { useMemberPaymentDetails } from '@/services/member';
import {
  PaymentCycle,
  RecurringPaymentMember,
  SessionPayment,
  SessionPaymentMember,
} from '@/types/payment';

import { ManageSessionPaymentSheet } from '../../../payments/per-session/manage-session-payment';
import { ManagePaymentSheet } from '../../../payments/recurring';
import { InvoiceGenerator } from '../../../payments/shared';

interface PaymentStatsProps {
  memberId: string | number;
  formOptions?: FormOptionsResponse | null;
}

// ─── Shared helpers ──────────────────────────────────────────────────────────

function DaysCountdown({
  dueDate,
  bufferEndDate,
  bufferEligible,
  cyclePaymentStatus,
}: {
  dueDate: string;
  bufferEndDate?: string | null;
  bufferEligible?: boolean;
  cyclePaymentStatus?: string;
}) {
  const isPaid = cyclePaymentStatus === 'paid';
  const effectiveDate =
    bufferEligible && bufferEndDate ? bufferEndDate : dueDate;
  const days = calculateDaysRemaining(effectiveDate);
  const isOverdue = days < 0;
  const isUrgent = !isOverdue && days <= 5;

  if (isPaid) {
    return (
      <div className="flex flex-col items-center justify-center gap-1">
        <CheckCircle2 className="w-7 h-7 text-primary-green-500" />
        <span className="text-primary-green-500 font-semibold text-sm">
          Paid
        </span>
        <span className="text-primary-blue-200 text-[10px]">This cycle</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-0.5">
      <span
        className={`text-3xl font-bold tabular-nums leading-none ${isOverdue ? 'text-red-400' : isUrgent ? 'text-orange-400' : 'text-white'}`}
      >
        {Math.abs(days)}
      </span>
      <span
        className={`text-xs font-medium ${isOverdue ? 'text-red-400' : isUrgent ? 'text-orange-400' : 'text-primary-blue-200'}`}
      >
        {isOverdue ? 'days overdue' : 'days left'}
      </span>
      <span className="text-[10px] text-primary-blue-200 mt-0.5">
        Due {formatDateTime(dueDate, 'date')}
      </span>
    </div>
  );
}

// ─── Recurring variant ────────────────────────────────────────────────────────

function CycleHistoryRow({
  cycle,
  isFirst,
}: {
  cycle: PaymentCycle;
  isFirst?: boolean;
}) {
  const status = getPaymentBadgeStatus(
    cycle.cyclePaymentStatus,
    cycle.pendingAmount
  );
  return (
    <div
      className={`flex items-center justify-between gap-3 py-3 ${!isFirst ? 'border-t border-primary-blue-400/30' : ''}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-2 h-2 rounded-full flex-shrink-0 ${cycle.cyclePaymentStatus === 'paid' ? 'bg-primary-green-500' : cycle.cyclePaymentStatus === 'partially_paid' ? 'bg-orange-400' : 'bg-red-400'}`}
        />
        <div className="min-w-0">
          <p className="text-xs text-white truncate">
            {formatDateTime(cycle.startDate, 'date')} –{' '}
            {formatDateTime(cycle.endDate, 'date')}
          </p>
          {cycle.lastAmountPaidDate && cycle.lastAmountPaid > 0 && (
            <p className="text-[10px] text-primary-blue-200">
              Last paid ₹{cycle.lastAmountPaid.toLocaleString()} on{' '}
              {formatDateTime(cycle.lastAmountPaidDate, 'date')}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="text-right">
          <p className="text-xs text-white font-medium">
            ₹{cycle.planFee.toLocaleString()}
          </p>
          {cycle.pendingAmount > 0 && (
            <p className="text-[10px] text-red-400">
              ₹{cycle.pendingAmount.toLocaleString()} due
            </p>
          )}
        </div>
        <FeeStatusBadge status={status} />
      </div>
    </div>
  );
}

function RecurringStats({
  member,
  onRecordPayment,
  onGenerateInvoice,
  formOptions,
}: {
  member: RecurringPaymentMember;
  onRecordPayment: () => void;
  onGenerateInvoice: () => void;
  formOptions?: FormOptionsResponse | null;
}) {
  const {
    currentCycle,
    previousCycles,
    totalDebtCycles,
    totalDebtAmount,
    membershipPlanId,
  } = member;

  const membershipPlan = formOptions?.membershipPlans.find(
    (p) => p.membershipPlanId === membershipPlanId
  );

  const progressValue = (() => {
    if (!currentCycle) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = safeParseDate(currentCycle.startDate);
    const end = safeParseDate(currentCycle.endDate);
    if (!start || !end) return 0;
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const total = Math.ceil((end.getTime() - start.getTime()) / 86400000);
    const passed = Math.ceil((today.getTime() - start.getTime()) / 86400000);
    return Math.max(0, Math.min(100, (passed / total) * 100));
  })();

  const bufferDaysRemaining = currentCycle?.bufferEndDate
    ? calculateDaysRemaining(currentCycle.bufferEndDate)
    : 0;
  const hasBuffer = !!(
    currentCycle?.bufferEligible &&
    currentCycle?.bufferEndDate &&
    bufferDaysRemaining >= 0
  );
  const isPartialPayment =
    currentCycle?.cyclePaymentStatus === 'partially_paid';

  const sortedPreviousCycles = [...(previousCycles ?? [])].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  return (
    <div className="space-y-4">
      {/* Buffer alert */}
      {isPartialPayment && hasBuffer && bufferDaysRemaining > 0 && (
        <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-400/30 rounded-lg px-4 py-2.5">
          <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <p className="text-xs text-yellow-300">
            Buffer period active — {bufferDaysRemaining} day
            {bufferDaysRemaining !== 1 ? 's' : ''} remaining to complete payment
          </p>
        </div>
      )}

      {/* Debt alert */}
      {totalDebtCycles > 0 && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-400/30 rounded-lg px-4 py-2.5">
          <TrendingDown className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-xs text-red-300">
            {totalDebtCycles} overdue cycle{totalDebtCycles !== 1 ? 's' : ''} —
            ₹{totalDebtAmount.toLocaleString()} total outstanding
          </p>
        </div>
      )}

      {/* Hero card */}
      <div className="bg-secondary-blue-500 rounded-xl overflow-hidden">
        {/* Top bar: plan + actions */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-primary-blue-400/30">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary-blue-200" />
              <span className="text-white font-medium text-sm">
                {membershipPlan?.planName ?? 'Recurring Plan'}
              </span>
              <Badge className="bg-primary-blue-400/40 text-primary-blue-100 text-[10px] px-1.5 py-0">
                Monthly
              </Badge>
            </div>
            {currentCycle && (
              <p className="text-[10px] text-primary-blue-200 mt-1">
                Cycle: {formatDateTime(currentCycle.startDate, 'date')} –{' '}
                {formatDateTime(currentCycle.endDate, 'date')}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={onGenerateInvoice}
              size="sm"
              className="bg-primary-blue-400 text-white hover:bg-primary-blue-500/80 h-8"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Invoice</span>
            </Button>
            <Button
              onClick={onRecordPayment}
              size="sm"
              className="bg-primary-blue-400 text-white hover:bg-primary-blue-500 h-8"
            >
              <Edit className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Record Payment</span>
            </Button>
          </div>
        </div>

        {currentCycle ? (
          <>
            {/* 3-stat row */}
            <div className="grid grid-cols-3 divide-x divide-primary-blue-400/30 px-0">
              {/* Outstanding */}
              <div className="flex flex-col items-center justify-center py-5 gap-1">
                <span
                  className={`text-2xl font-bold ${currentCycle.pendingAmount > 0 ? 'text-red-400' : 'text-primary-green-500'}`}
                >
                  ₹{currentCycle.pendingAmount.toLocaleString()}
                </span>
                <span className="text-[10px] uppercase tracking-wide text-primary-blue-200">
                  Outstanding
                </span>
                {currentCycle.pendingAmount === 0 && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary-green-500" />
                )}
              </div>

              {/* Countdown */}
              <div className="flex items-center justify-center py-5">
                <DaysCountdown
                  dueDate={currentCycle.dueDate}
                  bufferEndDate={currentCycle.bufferEndDate}
                  bufferEligible={currentCycle.bufferEligible}
                  cyclePaymentStatus={currentCycle.cyclePaymentStatus}
                />
              </div>

              {/* Amount paid this cycle */}
              <div className="flex flex-col items-center justify-center py-5 gap-1">
                <span className="text-2xl font-bold text-white">
                  ₹{currentCycle.amountPaid.toLocaleString()}
                </span>
                <span className="text-[10px] uppercase tracking-wide text-primary-blue-200">
                  Paid this cycle
                </span>
                <span className="text-[10px] text-primary-blue-200">
                  of ₹{currentCycle.planFee.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Cycle progress */}
            <div className="px-5 pb-5">
              <div className="flex justify-between text-[10px] text-primary-blue-200 mb-1.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Cycle progress
                </span>
                <span>{Math.round(progressValue)}% through cycle</span>
              </div>
              <Progress value={progressValue} className="h-1.5" />
              <div className="flex justify-between text-[10px] text-primary-blue-200/60 mt-1">
                <span>{formatDateTime(currentCycle.startDate, 'date')}</span>
                <span>{formatDateTime(currentCycle.endDate, 'date')}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="px-5 py-8 text-center text-primary-blue-200 text-sm">
            No active cycle data
          </div>
        )}
      </div>

      {/* Payment history */}
      {sortedPreviousCycles.length > 0 && (
        <div className="bg-secondary-blue-500 rounded-xl px-5 py-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-3.5 h-3.5 text-primary-blue-200" />
            <h3 className="text-sm font-normal text-white">Payment History</h3>
            <span className="text-[10px] text-primary-blue-200 ml-auto">
              {sortedPreviousCycles.length} previous cycle
              {sortedPreviousCycles.length !== 1 ? 's' : ''}
            </span>
          </div>
          {sortedPreviousCycles.map((cycle, idx) => (
            <CycleHistoryRow
              key={cycle.cycleId}
              cycle={cycle}
              isFirst={idx === 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Session variant ──────────────────────────────────────────────────────────

function SessionPaymentRow({
  payment,
  isFirst,
}: {
  payment: SessionPayment;
  isFirst?: boolean;
}) {
  const status = getPaymentBadgeStatus(payment.status, payment.pendingAmount);
  return (
    <div
      className={`flex items-center justify-between gap-3 py-3 ${!isFirst ? 'border-t border-primary-blue-400/30' : ''}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-2 h-2 rounded-full flex-shrink-0 ${payment.status === 'paid' ? 'bg-primary-green-500' : payment.status === 'partially_paid' ? 'bg-orange-400' : 'bg-red-400'}`}
        />
        <div className="min-w-0">
          <p className="text-xs text-white">
            Session — {formatDateTime(payment.sessionDate, 'date')}
          </p>
          {payment.pendingAmount > 0 && (
            <p className="text-[10px] text-red-400">
              ₹{payment.pendingAmount.toLocaleString()} pending
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="text-right">
          <p className="text-xs text-white font-medium">
            ₹{payment.amountPaid.toLocaleString()}
          </p>
          <p className="text-[10px] text-primary-blue-200">
            of ₹{payment.sessionRate.toLocaleString()}
          </p>
        </div>
        <FeeStatusBadge status={status} />
      </div>
    </div>
  );
}

function SessionStats({
  member,
  onRecordPayment,
  onGenerateInvoice,
}: {
  member: SessionPaymentMember;
  onRecordPayment: () => void;
  onGenerateInvoice: () => void;
}) {
  const {
    sessions,
    paymentSummary,
    sessionFee,
    unpaidSessions,
    totalSessionDebt,
    sessionPayments,
    membershipPlanName,
  } = member;

  const totalSessions = sessions?.total || 0;
  const usedSessions = sessions?.used || 0;
  const totalPaid = paymentSummary?.paid || 0;
  const totalPending = paymentSummary?.pending || 0;
  const hasUnpaid = unpaidSessions > 0;
  const usagePercent =
    totalSessions > 0 ? Math.round((usedSessions / totalSessions) * 100) : 0;

  const sortedPayments = [...(sessionPayments ?? [])].sort(
    (a, b) =>
      new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
  );

  return (
    <div className="space-y-4">
      {/* Debt alert */}
      {hasUnpaid && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-400/30 rounded-lg px-4 py-2.5">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-xs text-red-300">
            {unpaidSessions} unpaid session{unpaidSessions !== 1 ? 's' : ''} — ₹
            {totalSessionDebt.toLocaleString()} outstanding
          </p>
        </div>
      )}

      {/* Hero card */}
      <div className="bg-secondary-blue-500 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-primary-blue-400/30">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary-blue-200" />
              <span className="text-white font-medium text-sm">
                {membershipPlanName || 'Per-Session Plan'}
              </span>
              <Badge className="bg-primary-blue-400/40 text-primary-blue-100 text-[10px] px-1.5 py-0">
                ₹{sessionFee}/session
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={onGenerateInvoice}
              size="sm"
              className="bg-primary-blue-400 text-white hover:bg-primary-blue-500/80 h-8"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Invoice</span>
            </Button>
            <Button
              onClick={onRecordPayment}
              size="sm"
              className="bg-primary-blue-400 text-white hover:bg-primary-blue-500 h-8"
            >
              <Edit className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Record Payment</span>
            </Button>
          </div>
        </div>

        {/* 3-stat row */}
        <div className="grid grid-cols-3 divide-x divide-primary-blue-400/30">
          <div className="flex flex-col items-center justify-center py-5 gap-1">
            <span className="text-2xl font-bold text-white">
              {usedSessions}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-primary-blue-200">
              Sessions Used
            </span>
            <span className="text-[10px] text-primary-blue-200">
              of {totalSessions}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center py-5 gap-1">
            <span className="text-2xl font-bold text-primary-green-500">
              ₹{totalPaid.toLocaleString()}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-primary-blue-200">
              Total Paid
            </span>
          </div>

          <div className="flex flex-col items-center justify-center py-5 gap-1">
            <span
              className={`text-2xl font-bold ${hasUnpaid ? 'text-red-400' : 'text-primary-green-500'}`}
            >
              ₹{totalPending.toLocaleString()}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-primary-blue-200">
              Outstanding
            </span>
            {!hasUnpaid && (
              <CheckCircle2 className="w-3.5 h-3.5 text-primary-green-500" />
            )}
          </div>
        </div>

        {/* Session usage bar */}
        <div className="px-5 pb-5">
          <div className="flex justify-between text-[10px] text-primary-blue-200 mb-1.5">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Session usage
            </span>
            <span>{usagePercent}% used</span>
          </div>
          <Progress value={usagePercent} className="h-1.5" />
          <div className="flex justify-between text-[10px] text-primary-blue-200/60 mt-1">
            <span>{usedSessions} used</span>
            <span>{totalSessions - usedSessions} remaining</span>
          </div>
        </div>
      </div>

      {/* Session history */}
      {sortedPayments.length > 0 && (
        <div className="bg-secondary-blue-500 rounded-xl px-5 py-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-3.5 h-3.5 text-primary-blue-200" />
            <h3 className="text-sm font-normal text-white">Session History</h3>
            <span className="text-[10px] text-primary-blue-200 ml-auto">
              {sortedPayments.length} session
              {sortedPayments.length !== 1 ? 's' : ''}
            </span>
          </div>
          {sortedPayments.map((payment, idx) => (
            <SessionPaymentRow
              key={payment.sessionId}
              payment={payment}
              isFirst={idx === 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function PaymentStats({ memberId, formOptions }: PaymentStatsProps) {
  const { data: paymentData, isLoading } = useMemberPaymentDetails(memberId);
  const { isOpen, openSheet, closeSheet } = useSheet();
  const {
    isOpen: isInvoiceOpen,
    openSheet: openInvoice,
    closeSheet: closeInvoice,
  } = useSheet();
  const queryClient = useQueryClient();

  const handleCloseSheet = (open: boolean) => {
    if (!open) {
      closeSheet();
      queryClient.invalidateQueries({
        queryKey: ['memberPaymentDetails', memberId],
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!paymentData?.data) {
    return (
      <div className="bg-secondary-blue-500 rounded-xl p-8 text-center">
        <p className="text-primary-blue-200 text-sm">
          No payment data available
        </p>
      </div>
    );
  }

  const member = paymentData.data;

  return (
    <>
      {member.billingType === 'Recurring' ? (
        <RecurringStats
          member={member as RecurringPaymentMember}
          formOptions={formOptions}
          onRecordPayment={openSheet}
          onGenerateInvoice={openInvoice}
        />
      ) : (
        <SessionStats
          member={member as SessionPaymentMember}
          onRecordPayment={openSheet}
          onGenerateInvoice={openInvoice}
        />
      )}

      {member.billingType === 'Recurring' ? (
        <>
          <ManagePaymentSheet
            open={isOpen}
            onOpenChange={handleCloseSheet}
            member={member as RecurringPaymentMember}
          />
          <InvoiceGenerator
            open={isInvoiceOpen}
            onOpenChange={closeInvoice}
            member={member}
          />
        </>
      ) : (
        <>
          <ManageSessionPaymentSheet
            open={isOpen}
            onOpenChange={handleCloseSheet}
            member={member as SessionPaymentMember}
          />
          <InvoiceGenerator
            open={isInvoiceOpen}
            onOpenChange={closeInvoice}
            member={member}
          />
        </>
      )}
    </>
  );
}
