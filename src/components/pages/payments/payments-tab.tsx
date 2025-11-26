'use client';

import { useState } from 'react';

import { IndianRupee, Users } from 'lucide-react';

import InfoCard from '@/components/shared/cards/info-card';
import { TableSkeleton } from '@/components/shared/table';
import { FormOptionsResponse } from '@/hooks/use-gymform-options';
import { useSheet } from '@/hooks/use-sheet';
import { getCompletedPaymentFilters, getPaymentFilters } from '@/lib/filters';
import { useGymBranch } from '@/providers/gym-branch-provider';
import { useFilteredPayments } from '@/services/payments';
import type { MemberPaymentDetails } from '@/types/payment';

import { InvoiceGenerator } from './invoice-generator';
import { ManagePaymentSheet } from './manage-payment';
import { ManageSessionPaymentSheet } from './manage-session-payment';
import { createPaymentColumns } from './table/columns';
import { TableView } from './table/table-view';

type PaymentTabType = 'outstanding' | 'expired' | 'completed' | 'history';

type Props = {
  type: PaymentTabType;
  formOptions?: FormOptionsResponse | null;
};

const getStatsConfig = (
  payments: MemberPaymentDetails[],
  type: PaymentTabType
) => {
  const totalOutstanding = payments.reduce(
    (sum, member) => sum + (member.currentCycle?.pendingAmount || 0),
    0
  );
  const totalRevenue = payments.reduce(
    (sum, member) => sum + (member.currentCycle?.amountPaid || 0),
    0
  );

  const configs = {
    outstanding: [
      {
        id: 1,
        icon: <Users size={20} strokeWidth={1.75} color="#151821" />,
        color: 'primary-green-500',
        title: 'Members with dues',
        count: payments.length,
      },
      {
        id: 2,
        icon: <IndianRupee size={20} strokeWidth={1.75} color="#151821" />,
        color: 'secondary-pink-500',
        title: 'Total outstanding',
        count: totalOutstanding,
      },
    ],
    expired: [
      {
        id: 1,
        icon: <Users size={20} strokeWidth={1.75} color="#151821" />,
        color: 'alert-red-400',
        title: 'Overdue members',
        count: payments.length,
      },
      {
        id: 2,
        icon: <IndianRupee size={20} strokeWidth={1.75} color="#151821" />,
        color: 'secondary-pink-500',
        title: 'Overdue amount',
        count: totalOutstanding,
      },
    ],
    completed: [
      {
        id: 1,
        icon: <Users size={20} strokeWidth={1.75} color="#151821" />,
        color: 'primary-green-500',
        title: 'Paid members',
        count: payments.length,
      },
      {
        id: 2,
        icon: <IndianRupee size={20} strokeWidth={1.75} color="#151821" />,
        color: 'primary-green-500',
        title: 'Revenue collected',
        count: totalRevenue,
      },
    ],
    history: [
      {
        id: 1,
        icon: <Users size={20} strokeWidth={1.75} color="#151821" />,
        color: 'primary-green-500',
        title: 'Total members',
        count: payments.length,
      },
      {
        id: 2,
        icon: <IndianRupee size={20} strokeWidth={1.75} color="#151821" />,
        color: 'primary-green-500',
        title: 'Total revenue',
        count: totalRevenue,
      },
    ],
  };

  return configs[type] || [];
};

export function PaymentsTab({ type, formOptions }: Props) {
  const [selectedPayment, setSelectedPayment] =
    useState<MemberPaymentDetails | null>(null);
  const [selectedInvoiceMember, setSelectedInvoiceMember] =
    useState<MemberPaymentDetails | null>(null);
  const { isOpen, openSheet, closeSheet } = useSheet();
  const {
    isOpen: isInvoiceOpen,
    openSheet: openInvoice,
    closeSheet: closeInvoice,
  } = useSheet();

  const { gymBranch } = useGymBranch();
  const gymId = gymBranch?.gymId;

  const {
    outstandingPayments,
    expiredPayments,
    completedPayments,
    historyPayments,
    isLoading,
  } = useFilteredPayments(gymId!);

  const handleRecord = (member: MemberPaymentDetails) => {
    // Add mock session data for testing
    // const mockMember = {
    //   ...member,
    //   customSessionRate: 150,
    //   unpaidSessions: 5,
    //   totalSessionDebt: 750,
    //   sessionPayments: [
    //     {
    //       sessionId: 1,
    //       attendanceId: 101,
    //       memberId: member.memberId,
    //       sessionDate: '2025-01-20',
    //       sessionRate: 150,
    //       amountPaid: 0,
    //       pendingAmount: 150,
    //       status: 'Pending' as const,
    //     },
    //     {
    //       sessionId: 2,
    //       attendanceId: 102,
    //       memberId: member.memberId,
    //       sessionDate: '2025-01-18',
    //       sessionRate: 150,
    //       amountPaid: 0,
    //       pendingAmount: 150,
    //       status: 'Pending' as const,
    //     },
    //     {
    //       sessionId: 3,
    //       attendanceId: 103,
    //       memberId: member.memberId,
    //       sessionDate: '2025-01-16',
    //       sessionRate: 150,
    //       amountPaid: 0,
    //       pendingAmount: 150,
    //       status: 'Pending' as const,
    //     },
    //     {
    //       sessionId: 4,
    //       attendanceId: 104,
    //       memberId: member.memberId,
    //       sessionDate: '2025-01-14',
    //       sessionRate: 150,
    //       amountPaid: 0,
    //       pendingAmount: 150,
    //       status: 'Pending' as const,
    //     },
    //     {
    //       sessionId: 5,
    //       attendanceId: 105,
    //       memberId: member.memberId,
    //       sessionDate: '2025-01-12',
    //       sessionRate: 150,
    //       amountPaid: 0,
    //       pendingAmount: 150,
    //       status: 'Pending' as const,
    //     },
    //   ],
    // };
    setSelectedPayment(member);
    // setSelectedPayment(mockMember);
    openSheet();
  };

  const handleGenerateInvoice = (member: MemberPaymentDetails) => {
    setSelectedInvoiceMember(member);
    openInvoice();
  };

  const columns = createPaymentColumns(
    handleRecord,
    formOptions?.membershipPlans || [],
    handleGenerateInvoice,
    type === 'history'
  );

  const getPaymentsData = () => {
    switch (type) {
      case 'outstanding':
        return outstandingPayments;
      case 'expired':
        return expiredPayments;
      case 'completed':
        return completedPayments;
      case 'history':
        return historyPayments;
      default:
        return [];
    }
  };

  const stats = getStatsConfig(getPaymentsData(), type);

  const getFilters = () => {
    const membershipPlans = formOptions?.membershipPlans || [];

    switch (type) {
      case 'outstanding':
      case 'expired':
      case 'history':
        return getPaymentFilters(membershipPlans);
      case 'completed':
        return getCompletedPaymentFilters(membershipPlans);
      default:
        return [];
    }
  };

  return (
    <div className="flex flex-col gap-7">
      {stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <InfoCard item={stat} key={stat.id} />
          ))}
        </div>
      )}

      {isLoading ? (
        <TableSkeleton rows={10} columns={7} />
      ) : (
        <>
          <TableView
            payments={getPaymentsData()}
            columns={columns}
            filters={getFilters()}
          />
          {selectedPayment?.billingType === 'PerSession' ? (
            <ManageSessionPaymentSheet
              open={isOpen}
              onOpenChange={closeSheet}
              member={selectedPayment}
            />
          ) : (
            <ManagePaymentSheet
              open={isOpen}
              onOpenChange={closeSheet}
              member={selectedPayment}
            />
          )}
          <InvoiceGenerator
            open={isInvoiceOpen}
            onOpenChange={closeInvoice}
            member={selectedInvoiceMember}
          />
        </>
      )}
    </div>
  );
}
