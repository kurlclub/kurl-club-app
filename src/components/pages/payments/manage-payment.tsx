'use client';

import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Calendar,
  Clock,
  CreditCard,
  Handshake,
  Hourglass,
  OctagonAlert,
  Plus,
  Shield,
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
import { formatDateTime } from '@/lib/utils';
import { useGymBranch } from '@/providers/gym-branch-provider';
import { paymentFormSchema } from '@/schemas';
import type { MemberPaymentDetails } from '@/types/payment';

import { PaymentHistory } from './payment-history';

type PaymentFormData = z.infer<typeof paymentFormSchema>;

type ManagePaymentSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: MemberPaymentDetails | null;
};

export function ManagePaymentSheet({
  open,
  onOpenChange,
  member,
}: ManagePaymentSheetProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [paymentType, setPaymentType] = useState<'partial' | 'full'>('partial');
  const pending = member?.currentCycle?.pendingAmount || 0;
  const { gymBranch } = useGymBranch();
  const {
    recordPartialPayment,
    recordFullPayment,
    extendBuffer,
    isProcessing,
  } = usePaymentManagement();
  const { data: paymentHistory = [], isLoading: isHistoryLoading } =
    usePaymentHistory(member?.memberId || 0);
  const { showConfirm } = useAppDialog();

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: '',
      method: '',
      extendDays: '',
    },
  });

  const formValues = form.watch();
  const amountNum = Number(formValues.amount) || 0;
  const extendDaysNum = Number(formValues.extendDays) || 0;

  const isPartialPaymentValid =
    amountNum >= 1 && amountNum <= pending && formValues.method;
  const isExtendValid = extendDaysNum >= 1;

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
          paymentMethod: formValues.method,
          paymentType: 0,
        });

        form.reset();
        onOpenChange(false);
      },
    });
  };

  const handleFullPayment = () => {
    if (!member || !gymBranch?.gymId || !formValues.method) return;

    showConfirm({
      title: 'Confirm Full Payment',
      description: `Are you sure you want to mark ₹${pending} as fully paid for ${member.memberName}?`,
      confirmLabel: 'Mark Paid',
      onConfirm: async () => {
        await recordFullPayment({
          memberId: member.memberId,
          gymId: gymBranch.gymId,
          membershipPlanId: member.membershipPlanId,
          amount: pending,
          paymentMethod: formValues.method,
          paymentType: 1,
        });

        form.reset();
        onOpenChange(false);
      },
    });
  };

  const handleExtendBuffer = () => {
    if (!member) return;

    showConfirm({
      title: 'Extend Buffer Period',
      description: `Extend buffer by ${extendDaysNum} day${extendDaysNum > 1 ? 's' : ''} for ${member.memberName}?`,
      confirmLabel: 'Extend Buffer',
      onConfirm: async () => {
        await extendBuffer({
          memberId: member.memberId,
          daysToAdd: extendDaysNum,
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
                <div className="space-y-1 mb-2">
                  <div className="text-xs font-medium text-primary-green-200 tracking-wide uppercase">
                    #
                    {member.memberIdentifier ||
                      `KC${member.memberId.toString().padStart(3, '0')}`}
                  </div>
                  <h1 className="text-base text-white">{member.memberName}</h1>
                </div>
                <Badge className="bg-primary-blue-400 text-primary-blue-100">
                  Plan {member.membershipPlanId}
                </Badge>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-primary-blue-200" />
                  <div>
                    <div className="text-primary-blue-200 text-xs">
                      Total Fee
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
                      Due Date
                    </div>
                    <div className="text-white">
                      {member.currentCycle?.dueDate
                        ? formatDateTime(member.currentCycle.dueDate, 'date')
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
                    <div className="text-primary-blue-200 text-xs">Pending</div>
                    <div className="text-white">₹{pending}</div>
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
            {/* Conditional Payment Card */}
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
                          Maximum: ₹{pending}
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
                          ₹{pending}
                        </div>
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      disabled={
                        pending <= 0 || !formValues.method || isProcessing
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
                          Settle ₹{pending}
                        </div>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </FormProvider>

            {/* Buffer Extension */}
            <FormProvider {...form}>
              <Card className="border-primary-blue-400 bg-primary-blue-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-white">
                    <Shield className="w-4 h-4" />
                    Buffer Extension
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <KFormField
                        fieldType={KFormFieldType.INPUT}
                        control={form.control}
                        name="extendDays"
                        label="Extension Days"
                        type="number"
                        placeholder="0"
                        size="sm"
                      />
                    </div>
                    <Button
                      disabled={!isExtendValid || isProcessing}
                      onClick={handleExtendBuffer}
                    >
                      {isProcessing ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Extend
                        </div>
                      )}
                    </Button>
                  </div>
                  <div className="inline-flex items-center w-full bg-neutral-ochre-400/30 px-2 py-1 rounded border-neutral-ochre-500">
                    <OctagonAlert
                      size={10}
                      className="mr-2 text-neutral-ochre-200"
                    />
                    <span className="text-[10px] text-neutral-ochre-100">
                      Use only for genuine cases with proper justification
                    </span>
                  </div>
                </CardContent>
              </Card>
            </FormProvider>
          </div>
        </div>
      )}
    </KSheet>
  );
}
