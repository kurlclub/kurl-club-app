'use client';

import { useState } from 'react';

import { ColumnDef } from '@tanstack/react-table';
import { IndianRupee, Users } from 'lucide-react';

import InfoCard from '@/components/shared/cards/info-card';
import { TableSkeleton } from '@/components/shared/table';
import { FormOptionsResponse } from '@/hooks/use-gymform-options';
import { useSheet } from '@/hooks/use-sheet';
import { getCompletedPaymentFilters, getPaymentFilters } from '@/lib/filters';
import { useGymBranch } from '@/providers/gym-branch-provider';
import { useFilteredPayments } from '@/services/payments';
import type {
  MemberPaymentDetails,
  RecurringPaymentMember,
} from '@/types/payment';

import { InvoiceGenerator } from '../shared';
import { createPaymentColumns } from './columns';
import { ManagePaymentSheet } from './manage-payment';
import { TableView } from './table-view';

type PaymentTabType = 'current-due' | 'overdue' | 'completed' | 'history';

type Props = {
  type: PaymentTabType;
  formOptions?: FormOptionsResponse | null;
};

const getStatsConfig = (
  payments: RecurringPaymentMember[],
  type: PaymentTabType
) => {
  const totalOutstanding = payments.reduce((sum, member) => {
    if (member.billingType === 'Recurring' && member.currentCycle) {
      return sum + member.currentCycle.pendingAmount;
    }
    return sum;
  }, 0);

  const totalRevenue = payments.reduce((sum, member) => {
    if (member.billingType === 'Recurring' && member.currentCycle) {
      return sum + member.currentCycle.amountPaid;
    }
    return sum;
  }, 0);

  const configs = {
    'current-due': [
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
        title: 'Total due',
        count: totalOutstanding,
      },
    ],
    overdue: [
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
    useState<RecurringPaymentMember | null>(null);
  const [selectedInvoiceMember, setSelectedInvoiceMember] =
    useState<RecurringPaymentMember | null>(null);
  const { isOpen, openSheet, closeSheet } = useSheet();
  const {
    isOpen: isInvoiceOpen,
    openSheet: openInvoice,
    closeSheet: closeInvoice,
  } = useSheet();

  const { gymBranch } = useGymBranch();
  const gymId = gymBranch?.gymId;

  const { currentDuePayments, overduePayments, completedPayments, isLoading } =
    useFilteredPayments(gymId!);

  const handleRecord = (member: MemberPaymentDetails) => {
    if (member.billingType === 'Recurring') {
      setSelectedPayment(member);
      openSheet();
    }
  };

  const handleGenerateInvoice = (member: MemberPaymentDetails) => {
    if (member.billingType === 'Recurring') {
      setSelectedInvoiceMember(member);
      openInvoice();
    }
  };

  const columns = createPaymentColumns(
    handleRecord,
    formOptions?.membershipPlans || [],
    handleGenerateInvoice,
    type === 'history'
  ) as ColumnDef<MemberPaymentDetails>[];

  const getPaymentsData = () => {
    switch (type) {
      case 'current-due':
        return currentDuePayments || [];
      case 'overdue':
        return overduePayments || [];
      case 'completed':
        return completedPayments || [];
      case 'history':
        return [];
      default:
        return [];
    }
  };

  const stats = getStatsConfig(
    getPaymentsData() as RecurringPaymentMember[],
    type
  );

  const getFilters = () => {
    const membershipPlans = formOptions?.membershipPlans || [];

    switch (type) {
      case 'current-due':
      case 'overdue':
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
          <ManagePaymentSheet
            open={isOpen}
            onOpenChange={closeSheet}
            member={selectedPayment}
          />
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
