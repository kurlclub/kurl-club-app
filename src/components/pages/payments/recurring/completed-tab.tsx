'use client';

import { useState } from 'react';

import { ColumnDef } from '@tanstack/react-table';
import { IndianRupee, Users } from 'lucide-react';

import InfoCard from '@/components/shared/cards/info-card';
import { TableSkeleton } from '@/components/shared/table';
import { useDebounce } from '@/hooks/use-debounce';
import { useSheet } from '@/hooks/use-sheet';
import { FilterConfig } from '@/lib/filters';
import { useGymBranch } from '@/providers/gym-branch-provider';
import { useCompletedPayments } from '@/services/payments';
import type {
  MemberPaymentDetails,
  RecurringPaymentMember,
} from '@/types/payment';

import { InvoiceGenerator } from '../shared';
import { createPaymentColumns } from './columns';
import { ManagePaymentSheet } from './manage-payment';
import { TableView } from './table-view';

export function CompletedTab() {
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
  const gymId = gymBranch?.gymId || 0;

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [selectedFilters, setSelectedFilters] = useState<{
    membershipPlan?: string[];
  }>({});
  const [apiFilters, setApiFilters] = useState<{
    search?: string;
    membershipPlan?: string;
  }>({});

  // Fetch filtered data
  const { data, isLoading } = useCompletedPayments(gymId, {
    ...apiFilters,
    search: debouncedSearch || undefined,
  });

  // Fetch unfiltered data for filter options
  const { data: filtersData } = useCompletedPayments(gymId, {});

  const payments = data?.data || [];
  const summary = data?.summary;
  const availableFilters =
    filtersData?.availableFilters || data?.availableFilters;

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
    availableFilters?.membershipPlans.map((p) => ({
      membershipPlanId: parseInt(p.value),
      planName: p.displayName,
    })) || [],
    handleGenerateInvoice,
    false
  ) as ColumnDef<MemberPaymentDetails>[];

  const dynamicFilters: FilterConfig[] = [
    {
      columnId: 'membershipPlanId',
      title: 'Membership Plan',
      options:
        availableFilters?.membershipPlans?.map((plan) => ({
          label: plan.displayName,
          value: plan.value,
          count: plan.count,
        })) || [],
    },
  ];

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (
    columnId: string,
    values: string[] | undefined
  ) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [columnId]: values,
    }));

    const filterKey =
      columnId === 'membershipPlanId' ? 'membershipPlan' : columnId;
    setApiFilters((prev) => {
      const newFilters = { ...prev };
      if (values && values.length > 0) {
        newFilters[filterKey as keyof typeof newFilters] = values.join(',');
      } else {
        delete newFilters[filterKey as keyof typeof newFilters];
      }
      return newFilters;
    });
  };

  const handleResetFilters = () => {
    setSelectedFilters({});
    setSearchTerm('');
    setApiFilters({});
  };

  const stats = [
    {
      id: 1,
      icon: <Users size={20} strokeWidth={1.75} color="#151821" />,
      color: 'primary-green-500',
      title: 'Paid members',
      count: summary?.totalMembers || 0,
    },
    {
      id: 2,
      icon: <IndianRupee size={20} strokeWidth={1.75} color="#151821" />,
      color: 'primary-green-500',
      title: 'Revenue collected',
      count: summary?.totalDebt || 0,
    },
  ];

  return (
    <div className="flex flex-col gap-7">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <InfoCard item={stat} key={stat.id} />
        ))}
      </div>

      {isLoading ? (
        <TableSkeleton rows={10} columns={7} />
      ) : (
        <>
          <TableView
            payments={payments}
            columns={columns}
            filters={dynamicFilters}
            onSearch={handleSearch}
            searchValue={searchTerm}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            selectedFilters={selectedFilters}
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
