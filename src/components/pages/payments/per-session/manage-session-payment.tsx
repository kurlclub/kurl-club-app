'use client';

import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Calendar,
  CheckCircle2,
  CheckSquare,
  Clock,
  CreditCard,
  Square,
} from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod/v4';

import {
  KFormField,
  KFormFieldType,
} from '@/components/shared/form/k-formfield';
import { KSheet } from '@/components/shared/form/k-sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAppDialog } from '@/hooks/use-app-dialog';
import { paymentMethodOptions } from '@/lib/constants';
import { safeParseDate } from '@/lib/utils';
import { useGymBranch } from '@/providers/gym-branch-provider';
import {
  useMemberSessionDetails,
  useRecordSessionPayment,
} from '@/services/session-payments';
import type { SessionDetail, SessionPaymentMember } from '@/types/payment';

const sessionPaymentSchema = z.object({
  amount: z.string().min(1, 'Amount is required'),
  method: z.string().min(1, 'Payment method is required'),
});

type SessionPaymentFormData = z.infer<typeof sessionPaymentSchema>;

type ManageSessionPaymentSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: SessionPaymentMember | null;
};

export function ManageSessionPaymentSheet({
  open,
  onOpenChange,
  member,
}: ManageSessionPaymentSheetProps) {
  const [selectedSessions, setSelectedSessions] = useState<number[]>([]);
  const { showConfirm } = useAppDialog();
  const { gymBranch } = useGymBranch();

  const { data: sessionData, isLoading } = useMemberSessionDetails(
    member?.memberId || null,
    open
  );

  const { mutate: recordPayment, isPending: isProcessing } =
    useRecordSessionPayment();

  const form = useForm<SessionPaymentFormData>({
    resolver: zodResolver(sessionPaymentSchema),
    defaultValues: {
      amount: '',
      method: '',
    },
  });

  const formValues = form.watch();
  const sessions = sessionData?.sessions || [];
  const unpaidSessions = sessions.filter(
    (s: SessionDetail) => s.paymentStatus === 'unpaid'
  );

  const selectedAmount = selectedSessions.reduce((sum, sessionId) => {
    const session = sessions.find(
      (s: SessionDetail) => s.sessionPaymentId === sessionId
    );
    return sum + (session?.sessionRate || 0);
  }, 0);

  const handleSessionToggle = (sessionId: number) => {
    setSelectedSessions((prev) =>
      prev.includes(sessionId)
        ? prev.filter((id) => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSessions.length === unpaidSessions.length) {
      setSelectedSessions([]);
    } else {
      setSelectedSessions(
        unpaidSessions.map((s: SessionDetail) => s.sessionPaymentId)
      );
    }
  };

  useEffect(() => {
    form.setValue('amount', String(selectedAmount));
  }, [selectedAmount, form]);

  const handleRecordPayment = () => {
    if (!member || !gymBranch?.gymId) return;

    showConfirm({
      title: 'Record Session Payment',
      description: `Record ₹${selectedAmount} payment for ${selectedSessions.length} session(s)?`,
      confirmLabel: 'Record Payment',
      onConfirm: () => {
        recordPayment(
          {
            sessionPaymentIds: selectedSessions,
            totalAmountPaid: selectedAmount,
            paymentMethod: formValues.method,
            recordedBy: gymBranch.gymId,
          },
          {
            onSuccess: () => {
              toast.success('Payment recorded successfully');
              form.reset();
              setSelectedSessions([]);
              onOpenChange(false);
            },
            onError: (error: Error) => {
              toast.error(error.message || 'Failed to record payment');
            },
          }
        );
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

  if (isLoading) {
    return (
      <KSheet
        isOpen={open}
        onClose={() => onOpenChange(false)}
        title="Record Session Payment"
        footer={footer}
        className="w-[600px]"
      >
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </KSheet>
    );
  }

  const summary = sessionData?.summary;
  const memberInfo = sessionData?.member;

  return (
    <KSheet
      isOpen={open}
      onClose={() => {
        form.reset();
        setSelectedSessions([]);
        onOpenChange(false);
      }}
      title="Record Session Payment"
      footer={footer}
      className="w-[600px]"
    >
      {!memberInfo || !summary ? null : (
        <div className="space-y-6">
          {/* Member Summary Card */}
          <div className="rounded-md border border-primary-blue-400 bg-secondary-blue-500 px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-lg text-white font-semibold">
                  {memberInfo.name}
                </h1>
                <div className="text-xs text-primary-blue-200">
                  #{memberInfo.memberIdentifier} • {memberInfo.planName}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-primary-blue-200">
                  Session Rate
                </div>
                <div className="text-white font-bold text-lg">
                  ₹{memberInfo.sessionRate}
                </div>
              </div>
            </div>

            <Separator className="bg-primary-blue-400 mb-4" />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-primary-blue-200 mb-1">
                  Sessions
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">
                    {summary.usedSessions}
                  </span>
                  <span className="text-sm text-primary-blue-200">
                    / {summary.totalSessions} used
                  </span>
                </div>
                <div className="text-xs text-primary-green-400 mt-1">
                  {summary.unusedPrepaidSessions} prepaid available
                </div>
              </div>

              <div>
                <div className="text-xs text-primary-blue-200 mb-1">
                  Payment
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-alert-red-300">
                    ₹{summary.totalPending}
                  </span>
                  <span className="text-sm text-primary-blue-200">pending</span>
                </div>
                <div className="text-xs text-white mt-1">
                  {summary.pendingPaymentSessions} unpaid sessions
                </div>
              </div>
            </div>
          </div>

          {/* Session List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-white text-sm">
                Select Sessions to Pay ({unpaidSessions.length} unpaid)
              </h4>
              {unpaidSessions.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs font-semibold text-primary-green-500 hover:text-primary-green-400 flex items-center gap-1.5"
                >
                  {selectedSessions.length === unpaidSessions.length ? (
                    <>
                      <CheckSquare className="w-3.5 h-3.5" /> Deselect All
                    </>
                  ) : (
                    <>
                      <Square className="w-3.5 h-3.5" /> Select All
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar">
              {sessions.length > 0 ? (
                sessions.map((session: SessionDetail) => {
                  const isSelected = selectedSessions.includes(
                    session.sessionPaymentId
                  );
                  const isPaid = session.paymentStatus === 'paid';
                  const isUsed = session.attendanceStatus === 'used';
                  const checkInDate = safeParseDate(session.checkInTime);

                  return (
                    <div
                      key={session.sessionPaymentId}
                      onClick={() =>
                        !isPaid && handleSessionToggle(session.sessionPaymentId)
                      }
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg border transition-all ${
                        isPaid
                          ? 'bg-primary-blue-400/20 border-primary-blue-400/40 cursor-not-allowed'
                          : isSelected
                            ? 'bg-primary-green-600/10 border-primary-green-500 cursor-pointer'
                            : 'bg-secondary-blue-400/40 border-secondary-blue-400/60 hover:border-primary-blue-400 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-center w-5">
                        {isPaid ? (
                          <CheckCircle2 className="w-4 h-4 text-primary-green-500" />
                        ) : isSelected ? (
                          <CheckSquare className="w-4 h-4 text-primary-green-500" />
                        ) : (
                          <Square className="w-4 h-4 text-primary-blue-200" />
                        )}
                      </div>

                      <div className="flex-1">
                        {isUsed && session.checkInTime ? (
                          <>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-white">
                                {checkInDate
                                  ? checkInDate.toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    })
                                  : '--'}
                              </p>
                              <Badge className="bg-primary-green-600/20 text-primary-green-400 text-[10px] px-2 py-0.5">
                                Attended
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-primary-blue-200 mt-1">
                              <Clock className="w-3 h-3" />
                              {checkInDate
                                ? checkInDate.toLocaleTimeString('en-IN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : '--'}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-white">
                                Session #{session.sessionPaymentId}
                              </p>
                              {isPaid && (
                                <Badge className="bg-primary-blue-400/30 text-primary-blue-100 text-[10px] px-2 py-0.5">
                                  Prepaid
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-primary-blue-200 mt-1">
                              {isPaid ? 'Not yet used' : 'Awaiting payment'}
                            </div>
                          </>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-medium text-white">
                          ₹{session.sessionRate}
                        </div>
                        {isPaid && session.paymentMethod && (
                          <div className="text-xs text-primary-blue-200">
                            {session.paymentMethod}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-12 bg-secondary-blue-400/50 rounded-md border border-dashed border-secondary-blue-400">
                  <Calendar className="w-8 h-8 text-primary-blue-300 mb-3 opacity-50" />
                  <p className="text-sm font-medium text-white mb-1">
                    No sessions found
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Selected Amount Display */}
          {selectedSessions.length > 0 && (
            <div className="rounded-md border border-primary-blue-400 bg-secondary-blue-500 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-primary-green-500" />
                  <div>
                    <div className="text-primary-blue-200 text-xs">
                      Selected Sessions
                    </div>
                    <div className="text-white font-semibold">
                      {selectedSessions.length} session
                      {selectedSessions.length > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <Separator
                  orientation="vertical"
                  className="h-12 bg-primary-blue-400"
                />
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary-blue-200" />
                  <div>
                    <div className="text-primary-blue-200 text-xs">
                      Total Amount
                    </div>
                    <div className="text-white font-bold text-lg">
                      ₹{selectedAmount.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Form */}
          {unpaidSessions.length > 0 && (
            <FormProvider {...form}>
              <Card className="border-primary-blue-400 bg-primary-blue-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-white">
                    <CreditCard className="w-4 h-4" />
                    Record Session Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <KFormField
                      fieldType={KFormFieldType.INPUT}
                      control={form.control}
                      name="amount"
                      label="Amount (₹)"
                      type="number"
                      placeholder="0"
                      size="sm"
                    />
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
                    disabled={
                      selectedSessions.length === 0 ||
                      !formValues.method ||
                      isProcessing
                    }
                    onClick={handleRecordPayment}
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Record Payment
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </FormProvider>
          )}
        </div>
      )}
    </KSheet>
  );
}
