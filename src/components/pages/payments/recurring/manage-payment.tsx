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
  const [paymentType, setPaymentType] = useState<'partial' | 'full'>('partial');
  const currentCyclePending = member?.currentCycle?.pendingAmount || 0;
  const settlementAmount = getRecurringFullSettlementAmount(member);
  const displayDueDate = getRecurringDisplayDueDate(member);
  const unsettledCycles = member?.totalDebtCycles || 0;
  const isOverdue = member?.overallPaymentStatus === 'Overdue';
  const dueDateLabel = isOverdue ? 'Oldest Due Date' : 'Due Date';
  const amountLabel = isOverdue ? 'Total Outstanding' : 'Current Pending';
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

  const isPartialPaymentValid =
    amountNum >= 1 &&
    amountNum <= currentCyclePending &&
    Boolean(paymentMethod);

  const handlePartialPayment = () => {
    if (!member || !gymBranch?.gymId) return;

    showConfirm({
      title: 'Confirm Partial Payment',
      description: `Record ₹${amountNum} payment for ${member.memberName}?`,
      confirmLabel: 'Record Payment',
      onConfirm: async () => {
        await recordPartialPayment({
          memberId: member.memberId,
          gymId: gymBranch.gymId,
          membershipPlanId: member.membershipPlanId,
          amount: amountNum,
          paymentMethod: paymentMethod || '',
          paymentType: 0,
        });

        form.reset();
        onOpenChange(false);
      },
    });
  };

  const handleFullPayment = () => {
    if (!member || !gymBranch?.gymId || !paymentMethod || settlementAmount <= 0)
      return;

    const settlementDescription =
      unsettledCycles > 1
        ? `Settle ₹${settlementAmount.toLocaleString()} across ${unsettledCycles} unsettled cycles for ${member.memberName}?`
        : `Are you sure you want to settle ₹${settlementAmount.toLocaleString()} for ${member.memberName}?`;

    showConfirm({
      title: 'Confirm Full Payment',
      description: settlementDescription,
      confirmLabel: unsettledCycles > 1 ? 'Settle All Dues' : 'Mark Paid',
      onConfirm: async () => {
        await recordFullPayment({
          memberId: member.memberId,
          gymId: gymBranch.gymId,
          membershipPlanId: member.membershipPlanId,
          amount: settlementAmount,
          paymentMethod,
          paymentType: 1,
        });

        form.reset();
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
                      ₹{settlementAmount.toLocaleString()}
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
            onTabChange={(value) => setPaymentType(value as 'partial' | 'full')}
            items={[
              { id: 'partial', label: 'Partial Payment', icon: Plus },
              { id: 'full', label: 'Full Settlement', icon: CreditCard },
            ]}
          />

          {/* Payment Actions */}
          <div className="grid gap-4">
            <FormProvider {...form}>
              {paymentType === 'partial' ? (
                <Card className="border-primary-blue-400 bg-primary-blue-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-white">
                      <Plus className="w-4 h-4" />
                      Record Partial Payment
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
                          {settlementAmount > currentCyclePending
                            ? `Current cycle max: ₹${currentCyclePending.toLocaleString()}`
                            : `Maximum: ₹${currentCyclePending.toLocaleString()}`}
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
                          Add Payment
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
                      Full Settlement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                          Amount
                        </div>
                        <div className="text-base font-bold text-white">
                          ₹{settlementAmount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {unsettledCycles > 1 ? (
                      <div className="text-xs text-primary-blue-200">
                        Clears all unsettled recurring cycles for this member.
                      </div>
                    ) : null}
                    <Button
                      className="w-full"
                      disabled={
                        settlementAmount <= 0 || !paymentMethod || isProcessing
                      }
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
                          Settle ₹{settlementAmount.toLocaleString()}
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
