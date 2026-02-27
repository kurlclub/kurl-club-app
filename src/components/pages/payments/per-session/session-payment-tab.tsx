'use client';

import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { Calendar, IndianRupee, Users } from 'lucide-react';

import InfoCard from '@/components/shared/cards/info-card';
import { api } from '@/lib/api';
import { SessionPaymentMember, SessionPaymentResponse } from '@/types/payment';

import { createSessionPaymentColumns } from './columns';
import { ManageSessionPaymentSheet } from './manage-session-payment';
import { SessionPaymentTableView } from './table-view';

type Props = {
  gymId: number;
};

export function SessionPaymentTab({ gymId }: Props) {
  const [selectedMember, setSelectedMember] =
    useState<SessionPaymentMember | null>(null);
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['session-payments', gymId],
    queryFn: () =>
      api.get<SessionPaymentResponse>(`/SessionPayment/gym/${gymId}`),
  });

  const sessionPayments = data?.data || [];

  const totalUnpaid = sessionPayments.filter(
    (m) => m.status === 'unpaid' || m.status === 'partially_paid'
  ).length;
  const outstandingAmount = sessionPayments.reduce(
    (sum, m) => sum + (m.paymentSummary?.pending || 0),
    0
  );
  const usedSessions = sessionPayments.reduce(
    (sum, m) => sum + (m.sessions?.used || 0),
    0
  );
  const totalSessions = sessionPayments.reduce(
    (sum, m) => sum + (m.sessions?.total || 0),
    0
  );

  const handleRecordPayment = (member: SessionPaymentMember) => {
    setSelectedMember(member);
    setIsPaymentSheetOpen(true);
  };

  const columns = createSessionPaymentColumns(
    handleRecordPayment,
    undefined,
    false
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    {
      id: 1,
      icon: <Users size={20} strokeWidth={1.75} color="#151821" />,
      color: 'alert-red-400',
      title: 'Total Unpaid',
      count: totalUnpaid,
    },
    {
      id: 2,
      icon: <IndianRupee size={20} strokeWidth={1.75} color="#151821" />,
      color: 'secondary-pink-500',
      title: 'Outstanding Amount',
      count: outstandingAmount,
    },
    {
      id: 3,
      icon: <Calendar size={20} strokeWidth={1.75} color="#151821" />,
      color: 'primary-green-500',
      title: 'Total Sessions',
      count: `${usedSessions}/${totalSessions}`,
    },
  ];

  return (
    <div className="flex flex-col gap-7">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <InfoCard item={stat} key={stat.id} />
        ))}
      </div>

      {/* Table */}
      <SessionPaymentTableView payments={sessionPayments} columns={columns} />

      {/* Payment Sheet */}
      {selectedMember && (
        <ManageSessionPaymentSheet
          open={isPaymentSheetOpen}
          onOpenChange={setIsPaymentSheetOpen}
          member={{
            ...selectedMember,
            memberName: selectedMember.memberName,
          }}
        />
      )}
    </div>
  );
}
