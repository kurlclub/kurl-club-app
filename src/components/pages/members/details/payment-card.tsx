'use client';

import React from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { Skeleton } from '@/components/ui/skeleton';
import { FormOptionsResponse } from '@/hooks/use-gymform-options';
import { useSheet } from '@/hooks/use-sheet';
import { useMemberPaymentDetails } from '@/services/member';
import { RecurringPaymentMember, SessionPaymentMember } from '@/types/payment';

import { ManageSessionPaymentSheet } from '../../payments/per-session/manage-session-payment';
import { ManagePaymentSheet } from '../../payments/recurring';
import { InvoiceGenerator } from '../../payments/shared';
import { RecurringPaymentCard } from './payment-card-recurring';
import { SessionPaymentCard } from './payment-card-session';

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

  const handleCloseSheet = (open: boolean) => {
    if (!open) {
      closeSheet();
      queryClient.invalidateQueries({
        queryKey: ['memberPaymentDetails', memberId],
      });
    }
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

  return (
    <>
      {member.billingType === 'Recurring' ? (
        <RecurringPaymentCard
          member={member}
          formOptions={formOptions}
          onRecordPayment={openSheet}
          onGenerateInvoice={openInvoice}
        />
      ) : (
        <SessionPaymentCard
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

export default PaymentCard;
