'use client';

import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Calendar,
  CheckSquare,
  CreditCard,
  Hourglass,
  Square,
  Wallet,
} from 'lucide-react';
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
import type { MemberPaymentDetails } from '@/types/payment';

const sessionPaymentSchema = z.object({
  amount: z.string().min(1, 'Amount is required'),
  method: z.string().min(1, 'Payment method is required'),
});

type SessionPaymentFormData = z.infer<typeof sessionPaymentSchema>;

type ManageSessionPaymentSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: MemberPaymentDetails | null;
};

export function ManageSessionPaymentSheet({
  open,
  onOpenChange,
  member,
}: ManageSessionPaymentSheetProps) {
  const [isProcessing] = useState(false);
  const [selectedSessions, setSelectedSessions] = useState<number[]>([]);
  const { showConfirm } = useAppDialog();

  const form = useForm<SessionPaymentFormData>({
    resolver: zodResolver(sessionPaymentSchema),
    defaultValues: {
      amount: '',
      method: '',
    },
  });

  const formValues = form.watch();
  const selectedAmount = selectedSessions.reduce((sum, sessionId) => {
    const session = member?.sessionPayments?.find(
      (s) => s.sessionId === sessionId
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
    if (selectedSessions.length === member?.sessionPayments?.length) {
      setSelectedSessions([]);
    } else {
      setSelectedSessions(
        member?.sessionPayments?.map((s) => s.sessionId) || []
      );
    }
  };

  // Update amount when sessions are selected
  useEffect(() => {
    form.setValue('amount', String(selectedAmount));
  }, [selectedAmount, form]);

  const handleRecordPayment = () => {
    if (!member) return;

    showConfirm({
      title: 'Record Session Payment',
      description: `Record ₹${selectedAmount} payment for ${selectedSessions.length} session(s)?`,
      confirmLabel: 'Record Payment',
      onConfirm: () => {
        // TODO: Call session payment API
        console.log('Session payment:', {
          memberId: member.memberId,
          sessionIds: selectedSessions,
          amount: selectedAmount,
          method: formValues.method,
        });
        form.reset();
        setSelectedSessions([]);
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
        form.reset();
        onOpenChange(false);
      }}
      title="Record Session Payment"
      footer={footer}
      className="w-[500px]"
    >
      {!member ? null : (
        <div className="space-y-6">
          {/* Member Summary Card */}
          <div className="rounded-md border border-primary-blue-400 bg-secondary-blue-500 px-4 py-3">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-end gap-2">
                  <h1 className="text-base text-white font-semibold">
                    {member.memberName}
                  </h1>
                  <div className="text-xs font-medium text-primary-blue-200 tracking-wide">
                    #
                    {member.memberIdentifier ||
                      `KC${member.memberId.toString().padStart(3, '0')}`}
                  </div>
                </div>
                <Badge className="bg-primary-blue-400 text-primary-blue-100">
                  ₹{member.customSessionRate || 0}/session
                </Badge>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-primary-blue-200" />
                  <div>
                    <div className="text-primary-blue-200 text-xs">Rate</div>
                    <div className="text-white">
                      ₹{member.customSessionRate || 0}
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
                      Sessions
                    </div>
                    <div className="text-white">
                      {member.unpaidSessions || 0}
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
                      Total Due
                    </div>
                    <div className="text-white">
                      ₹{member.totalSessionDebt || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Session List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-white text-sm">
                Select Sessions to Pay
              </h4>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs font-semibold text-primary-green-500 hover:text-primary-green-400 flex items-center gap-1.5 k-transition"
              >
                {selectedSessions.length === member?.sessionPayments?.length ? (
                  <>
                    <CheckSquare className="w-3.5 h-3.5" /> Deselect All
                  </>
                ) : (
                  <>
                    <Square className="w-3.5 h-3.5" /> Select All
                  </>
                )}
              </button>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar">
              {member.sessionPayments && member.sessionPayments.length > 0 ? (
                member.sessionPayments.map((session) => {
                  const isSelected = selectedSessions.includes(
                    session.sessionId
                  );
                  return (
                    <div
                      key={session.sessionId}
                      onClick={() => handleSessionToggle(session.sessionId)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-all duration-200 ease-in-out ${
                        isSelected
                          ? 'bg-primary-green-600/10 border border-primary-green-300/30'
                          : 'bg-secondary-blue-400/50 hover:bg-secondary-blue-400/70 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-primary-green-500" />
                        ) : (
                          <Square className="w-4 h-4 text-primary-blue-200" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-[13.5px] font-medium text-white">
                          {new Date(session.sessionDate).toLocaleDateString(
                            'en-IN',
                            {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            }
                          )}
                        </p>
                      </div>
                      <div className="text-xs text-primary-blue-200">
                        Session #{session.sessionId}
                      </div>
                      <div className="text-sm font-medium text-white">
                        ₹{session.sessionRate}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-12 bg-secondary-blue-400/50 rounded-md border border-dashed border-secondary-blue-400">
                  <Calendar className="w-8 h-8 text-primary-blue-300 mb-3 opacity-50" />
                  <p className="text-sm font-medium text-white mb-1">
                    No unpaid sessions
                  </p>
                  <p className="text-xs text-primary-blue-200">
                    All sessions have been paid
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
        </div>
      )}
    </KSheet>
  );
}
