'use client';

import { Calendar, Clock, Edit, Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatDateTime } from '@/lib/utils';
import { SessionPaymentMember } from '@/types/payment';

interface SessionPaymentCardProps {
  member: SessionPaymentMember;
  onRecordPayment: () => void;
}

export function SessionPaymentCard({
  member,
  onRecordPayment,
}: SessionPaymentCardProps) {
  const {
    sessionFee,
    unpaidSessions,
    totalSessionDebt,
    paymentSummary,
    sessions,
    sessionPayments,
  } = member;

  const totalSessions = sessions?.total || 0;
  const paidSessions = sessions?.used || 0;
  const hasUnpaid = unpaidSessions > 0;
  const lastPayment = sessionPayments?.find((s) => s.status === 'paid');
  const lastSession = sessionPayments?.[sessionPayments.length - 1];

  return (
    <div className="shadow-sm bg-secondary-blue-500 rounded-lg h-full flex flex-col">
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <div className="tracking-tight text-white text-base font-normal leading-normal">
          Per-Session Billing
        </div>
        <Button
          onClick={onRecordPayment}
          className="bg-primary-blue-400 text-white hover:bg-primary-blue-500"
          size="sm"
        >
          <Edit className="h-4 w-4" />
          <span>Record Payment</span>
        </Button>
      </div>

      {hasUnpaid && (
        <div className="bg-secondary-yellow-500/30 text-neutral-ochre-200 inline-flex items-center gap-2 px-4 py-1 border-l-4 border-yellow-400">
          <Info size={12} />
          <p className="text-xs">
            {unpaidSessions} unpaid session
            {unpaidSessions > 1 ? 's' : ''} • ₹
            {totalSessionDebt.toLocaleString()} pending
          </p>
        </div>
      )}

      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-secondary-blue-50 text-sm font-medium flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Session Overview
          </span>
          <span className="text-secondary-blue-50 text-sm">
            ₹{sessionFee}/session
          </span>
        </div>

        <div className="bg-primary-blue-400 rounded-lg p-2 mb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-center flex-1">
              <div className="text-xl font-bold text-white">
                {totalSessions}
              </div>
              <div className="text-primary-blue-50 text-[10px] uppercase tracking-wide">
                Total
              </div>
            </div>

            <Separator orientation="vertical" className="h-8 bg-white/20" />

            <div className="text-center flex-1">
              <div className="text-xl font-bold text-green-400">
                {paidSessions}
              </div>
              <div className="text-primary-blue-50 text-[10px] uppercase tracking-wide">
                Paid
              </div>
            </div>

            <Separator orientation="vertical" className="h-8 bg-white/20" />

            <div className="text-center flex-1">
              <div
                className={`text-xl font-bold ${hasUnpaid ? 'text-red-400' : 'text-green-400'}`}
              >
                {unpaidSessions}
              </div>
              <div className="text-primary-blue-50 text-[10px] uppercase tracking-wide">
                Unpaid
              </div>
            </div>
          </div>
        </div>

        <div className="bg-primary-blue-400 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white font-medium">Payment Summary</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-2">
            <div className="text-center flex-1">
              <div className="text-lg font-bold text-green-400">
                ₹{paymentSummary.paid.toLocaleString()}
              </div>
              <div className="text-primary-blue-50 text-xs">Total Paid</div>
              {lastPayment && (
                <div className="text-white/70 text-xs">
                  {formatDateTime(lastPayment.sessionDate, 'date')}
                </div>
              )}
            </div>

            <Separator
              orientation="vertical"
              className="hidden sm:block h-8 bg-white/20"
            />

            <div className="text-center flex-1">
              <div
                className={`text-lg font-bold ${hasUnpaid ? 'text-red-400' : 'text-green-400'}`}
              >
                ₹{paymentSummary.pending.toLocaleString()}
              </div>
              <div className="text-primary-blue-50 text-xs">Outstanding</div>
              {lastSession && (
                <div className="text-white/70 text-xs">
                  Last: {formatDateTime(lastSession.sessionDate, 'date')}
                </div>
              )}
            </div>

            <Separator
              orientation="vertical"
              className="hidden sm:block h-8 bg-white/20"
            />

            <div className="text-center flex-1">
              <div className="text-lg font-bold text-white">
                ₹{lastPayment?.amountPaid?.toLocaleString() || 0}
              </div>
              <div className="text-primary-blue-50 text-xs">Last Payment</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-2 border-t border-white/10 mt-auto">
        <div className="flex items-center justify-center gap-2 text-primary-blue-50 text-xs">
          <Clock className="h-3 w-3" />
          <span>Click Record Payment to manage sessions</span>
        </div>
      </div>
    </div>
  );
}
