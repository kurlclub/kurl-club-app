'use client';

import { useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Calendar,
  CreditCard,
  Handshake,
  Hourglass,
  Plus,
  Wallet,
} from 'lucide-react';
import { z } from 'zod/v4';

import {
  KFormField,
  KFormFieldType,
} from '@/components/shared/form/k-formfield';
import { KSheet } from '@/components/shared/form/k-sheet';
import { KTabs } from '@/components/shared/form/k-tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useAppDialog } from '@/hooks/use-app-dialog';
import {
  usePaymentHistory,
  usePaymentManagement,
} from '@/hooks/use-payment-management';
import { paymentMethodOptions } from '@/lib/constants';
import {
  getRecurringDisplayDueDate,
  getRecurringFullSettlementAmount,
} from '@/lib/payments/recurring';
import { formatDateTime } from '@/lib/utils';
import { useGymBranch } from '@/providers/gym-branch-provider';
import { paymentFormSchema } from '@/schemas';
import type { RecurringPaymentMember } from '@/types/payment';

import { PaymentHistory } from '../shared/payment-history';

type PaymentFormData = z.infer<typeof paymentFormSchema>;
type PaymentAction = 'partial' | 'full';
type PaymentFlowMode = 'outstanding' | 'advance';

type ManagePaymentSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: RecurringPaymentMember | null;
};

export function ManagePaymentSheet({
  open,
  onOpenChange,
  member,
}: ManagePaymentSheetProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [paymentType, setPaymentType] = useState<PaymentAction>('partial');
  const [isDiscounted, setIsDiscounted] = useState(false);
  const currentCyclePending = member?.currentCycle?.pendingAmount || 0;
  const settlementAmount = getRecurringFullSettlementAmount(member);
  const hasOutstanding = settlementAmount > 0;
  const paymentMode: PaymentFlowMode = hasOutstanding
    ? 'outstanding'
    : 'advance';
  const fullPaymentAmount = hasOutstanding
    ? settlementAmount
    : member?.currentCycle?.planFee || 0;
  const displayDueDate = getRecurringDisplayDueDate(member);
  const unsettledCycles = member?.totalDebtCycles || (hasOutstanding ? 1 : 0);
  const isOverdue = member?.overallPaymentStatus === 'Overdue';
  const dueDateLabel = isOverdue ? 'Oldest Due Date' : 'Due Date';
  const amountLabel = hasOutstanding
    ? isOverdue
      ? 'Total Outstanding'
      : 'Current Pending'
    : 'Advance Full Amount';
  const planLabel =
    member?.membershipPlanName || `Plan ${member?.membershipPlanId ?? ''}`;
  const { gymBranch } = useGymBranch();
  const { recordPartialPayment, recordFullPayment, isProcessing } =
    usePaymentManagement();
  const { data: paymentHistory = [], isLoading: isHistoryLoading } =
    usePaymentHistory(member?.memberId || 0);
  const { showConfirm } = useAppDialog();

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: '',
      method: '',
    },
  });

  const amountValue = useWatch({ control: form.control, name: 'amount' });
  const paymentMethod = useWatch({ control: form.control, name: 'method' });

  const amountNum = Number(amountValue) || 0;
  const discountAmount =
    paymentType === 'full' && isDiscounted
      ? Math.max(0, fullPaymentAmount - amountNum)
      : 0;
  const isOutstandingFlow = paymentMode === 'outstanding';

  const isPartialPaymentValid =
    amountNum >= 1 &&
    (!isOutstandingFlow || amountNum <= currentCyclePending) &&
    Boolean(paymentMethod);
  const isFullPaymentValid =
    fullPaymentAmount > 0 &&
    Boolean(paymentMethod) &&
    (!isDiscounted || (amountNum > 0 && amountNum < fullPaymentAmount));

  const resetPaymentForm = () => {
    form.reset();
    setIsDiscounted(false);
  };

  const getPartialPaymentCopy = () => ({
    title: isOutstandingFlow
      ? 'Confirm Partial Payment'
      : 'Confirm Advance Payment',
    description: `Record ₹${amountNum.toLocaleString()} ${isOutstandingFlow ? 'payment' : 'advance payment'} for ${member?.memberName}?`,
    confirmLabel: isOutstandingFlow ? 'Record Payment' : 'Collect Advance',
  });

  const getFullPaymentAmount = () =>
    isDiscounted ? amountNum : fullPaymentAmount;

  const getFullPaymentCopy = (paymentAmount: number) => {
    if (!isOutstandingFlow) {
      return {
        title: 'Confirm Advance Full Payment',
        description: isDiscounted
          ? `Record ₹${paymentAmount.toLocaleString()} advance full payment for ${member?.memberName} with ₹${discountAmount.toLocaleString()} discount?`
          : `Record ₹${paymentAmount.toLocaleString()} advance full payment for ${member?.memberName}?`,
        confirmLabel: 'Collect Advance',
      };
    }

    if (isDiscounted) {
      return {
        title: 'Confirm Full Payment',
        description: `Record ₹${paymentAmount.toLocaleString()} full settlement for ${member?.memberName} with ₹${discountAmount.toLocaleString()} discount?`,
        confirmLabel: 'Record Payment',
      };
    }

    return {
      title: 'Confirm Full Payment',
      description:
        unsettledCycles > 1
          ? `Settle ₹${paymentAmount.toLocaleString()} across ${unsettledCycles} unsettled cycles for ${member?.memberName}?`
          : `Are you sure you want to settle ₹${paymentAmount.toLocaleString()} for ${member?.memberName}?`,
      confirmLabel: unsettledCycles > 1 ? 'Settle All Dues' : 'Mark Paid',
    };
  };

  const handlePartialPayment = () => {
    if (!member || !gymBranch?.gymId) return;
    const copy = getPartialPaymentCopy();

    showConfirm({
      title: copy.title,
      description: copy.description,
      confirmLabel: copy.confirmLabel,
      onConfirm: async () => {
        await recordPartialPayment({
          memberId: member.memberId,
          gymId: gymBranch.gymId,
          membershipPlanId: member.membershipPlanId,
          amount: amountNum,
          paymentMethod: paymentMethod || '',
          paymentType: 0,
        });

        resetPaymentForm();
        onOpenChange(false);
      },
    });
  };

  const handleFullPayment = () => {
    if (!member || !gymBranch?.gymId || !paymentMethod || !isFullPaymentValid)
      return;

    const paymentAmount = getFullPaymentAmount();
    const copy = getFullPaymentCopy(paymentAmount);

    showConfirm({
      title: copy.title,
      description: copy.description,
      confirmLabel: copy.confirmLabel,
      onConfirm: async () => {
        await recordFullPayment({
          memberId: member.memberId,
          gymId: gymBranch.gymId,
          membershipPlanId: member.membershipPlanId,
          amount: paymentAmount,
          paymentMethod,
          paymentType: 1,
          ...(discountAmount > 0 ? { discountAmount } : {}),
        });

        resetPaymentForm();
        onOpenChange(false);
      },
    });
  };

  const footer = (
    <div className="flex items-center justify-end w-full">
      <Button variant="outline" onClick={() => onOpenChange(false)}>
        Close
      </Button>
    </div>
  );

  return (
    <KSheet
      isOpen={open}
      onClose={() => {
        setShowHistory(false);
        setPaymentType('partial');
        resetPaymentForm();
        onOpenChange(false);
      }}
      title={showHistory ? 'Payment History' : 'Manage Payment'}
      footer={footer}
      className="w-[500px]"
    >
      {!member ? null : showHistory ? (
        <PaymentHistory
          history={paymentHistory}
          memberName={member.memberName}
          onBack={() => setShowHistory(false)}
          isLoading={isHistoryLoading}
        />
      ) : (
        <div className="space-y-6">
          {/* Member Summary Card */}
          <div className="rounded-md border border-primary-blue-400 bg-secondary-blue-500 px-4 py-3">
            <div>
              <div className="flex items-center justify-between">
                <div className="mb-2">
                  <h1 className="text-base text-white">{member.memberName}</h1>
                  <div className="text-[10px] font-medium text-primary-green-200 tracking-wide uppercase">
                    #
                    {member.memberIdentifier ||
                      `KC${member.memberId.toString().padStart(3, '0')}`}
                  </div>
                </div>
                <Badge className="bg-primary-blue-400 text-primary-blue-100">
                  {planLabel}
                </Badge>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-primary-blue-200" />
                  <div>
                    <div className="text-primary-blue-200 text-xs">
                      Current Cycle Fee
                    </div>
                    <div className="text-white">
                      ₹{member.currentCycle?.planFee || 0}
                    </div>
                  </div>
                </div>
                <Separator
                  orientation="vertical"
                  className="h-12 hidden sm:block bg-primary-blue-400"
                />

                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary-blue-200" />
                  <div>
                    <div className="text-primary-blue-200 text-xs">
                      {dueDateLabel}
                    </div>
                    <div className="text-white">
                      {displayDueDate
                        ? formatDateTime(displayDueDate, 'date')
                        : 'N/A'}
                    </div>
                  </div>
                </div>

                <Separator
                  orientation="vertical"
                  className="h-12 hidden sm:block bg-primary-blue-400"
                />

                <div className="flex items-center gap-2">
                  <Hourglass className="w-5 h-5 text-primary-blue-200" />
                  <div>
                    <div className="text-primary-blue-200 text-xs">
                      {amountLabel}
                    </div>
                    <div className="text-white">
                      ₹{fullPaymentAmount.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Payments */}
          <PaymentHistory
            history={paymentHistory}
            showRecent
            onViewAll={() => setShowHistory(true)}
            isLoading={isHistoryLoading}
          />

          {/* Payment Type Selector */}
          <KTabs
            variant="underline"
            value={paymentType}
            onTabChange={(value) => {
              setPaymentType(value as PaymentAction);
              resetPaymentForm();
            }}
            items={
              isOutstandingFlow
                ? [
                    { id: 'partial', label: 'Partial Payment', icon: Plus },
                    { id: 'full', label: 'Full Settlement', icon: CreditCard },
                  ]
                : [
                    { id: 'partial', label: 'Advance Payment', icon: Plus },
                    {
                      id: 'full',
                      label: 'Advance Full Amount',
                      icon: CreditCard,
                    },
                  ]
            }
          />

          {/* Payment Actions */}
          <div className="grid gap-4">
            <FormProvider {...form}>
              {paymentType === 'partial' ? (
                <Card className="border-primary-blue-400 bg-primary-blue-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-white">
                      <Plus className="w-4 h-4" />
                      {isOutstandingFlow
                        ? 'Record Partial Payment'
                        : 'Record Advance Payment'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <KFormField
                          fieldType={KFormFieldType.INPUT}
                          control={form.control}
                          name="amount"
                          label="Amount (₹)"
                          type="number"
                          placeholder="0"
                          size="sm"
                        />
                        <div className="mt-1 text-xs text-primary-blue-200">
                          {isOutstandingFlow
                            ? settlementAmount > currentCyclePending
                              ? `Current cycle max: ₹${currentCyclePending.toLocaleString()}`
                              : `Maximum: ₹${currentCyclePending.toLocaleString()}`
                            : 'Collect any advance amount for a future cycle.'}
                        </div>
                      </div>
                      <KFormField
                        fieldType={KFormFieldType.SELECT}
                        control={form.control}
                        name="method"
                        label="Payment Method"
                        options={paymentMethodOptions}
                        size="sm"
                      />
                    </div>
                    <Button
                      className="w-full"
                      disabled={!isPartialPaymentValid || isProcessing}
                      onClick={handlePartialPayment}
                    >
                      {isProcessing ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          {isOutstandingFlow
                            ? 'Add Payment'
                            : 'Collect Advance'}
                        </div>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-primary-blue-400 bg-primary-blue-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-white">
                      <CreditCard className="w-4 h-4" />
                      {isOutstandingFlow
                        ? 'Full Settlement'
                        : 'Advance Full Amount'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-md border border-primary-blue-400/70 bg-primary-blue-500/30 p-3">
                      <div className="text-xs text-primary-blue-200">
                        {isOutstandingFlow
                          ? 'Settlement Amount'
                          : 'Advance Full Amount'}
                      </div>
                      <div className="text-xl font-bold text-white">
                        ₹{fullPaymentAmount.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="apply-discount"
                        checked={isDiscounted}
                        onCheckedChange={(checked) => {
                          setIsDiscounted(Boolean(checked));
                          if (!checked) {
                            form.setValue('amount', '');
                          }
                        }}
                      />
                      <label
                        htmlFor="apply-discount"
                        className="text-sm text-primary-blue-100"
                      >
                        Apply Discount
                      </label>
                      {isDiscounted && discountAmount > 0 ? (
                        <span className="text-xs font-medium text-primary-green-200">
                          Discount: ₹{discountAmount.toLocaleString()}
                        </span>
                      ) : null}
                    </div>
                    {isDiscounted ? (
                      <KFormField
                        fieldType={KFormFieldType.INPUT}
                        control={form.control}
                        name="amount"
                        label="Amount Paid (₹)"
                        type="number"
                        placeholder="0"
                        size="sm"
                      />
                    ) : null}
                    <div className="flex w-full items-center gap-3">
                      <div className="w-full sm:w-2/3">
                        <KFormField
                          fieldType={KFormFieldType.SELECT}
                          control={form.control}
                          name="method"
                          label="Payment Method"
                          options={paymentMethodOptions}
                          size="sm"
                        />
                      </div>
                      <div className="flex flex-col items-center w-full sm:w-1/3">
                        <div className="text-xs text-primary-blue-200">
                          {isDiscounted ? 'Amount Paid' : 'Amount'}
                        </div>
                        <div className="text-base font-bold text-white">
                          ₹{getFullPaymentAmount().toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {isDiscounted && amountNum >= fullPaymentAmount ? (
                      <div className="text-xs text-alert-red-300">
                        Enter an amount below the{' '}
                        {isOutstandingFlow ? 'settlement' : 'advance'} amount to
                        apply a discount.
                      </div>
                    ) : unsettledCycles > 1 ? (
                      <div className="text-xs text-primary-blue-200">
                        Clears all unsettled recurring cycles for this member.
                      </div>
                    ) : null}
                    <Button
                      className="w-full"
                      disabled={!isFullPaymentValid || isProcessing}
                      onClick={handleFullPayment}
                    >
                      {isProcessing ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Handshake className="w-4 h-4" />
                          {isOutstandingFlow ? 'Settle' : 'Collect'} ₹
                          {getFullPaymentAmount().toLocaleString()}
                        </div>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </FormProvider>
          </div>
        </div>
      )}
    </KSheet>
  );
}
