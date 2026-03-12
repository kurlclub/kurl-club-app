import type { PayrollSummary } from '@/types/payroll-management';
import { formatCurrency } from '@/utils/format-currency';

const InfoCard = ({
  amount,
  paidCount,
  totalCount,
  isPaid,
}: {
  amount: string;
  paidCount: number;
  totalCount: number;
  isPaid?: boolean;
}) => {
  return (
    <div
      className="rounded-lg w-full border border-white/30 px-4 py-4 flex flex-col 
bg-linear-to-l from-[#90A8ED]/30 to-[#11141C] relative"
    >
      <div className="flex items-center gap-2">
        <span className="text-secondary-blue-200 text-[13px] leading-normal uppercase">
          {isPaid ? 'Total paid' : 'Total pending'}
        </span>
        <span
          className={`w-2.5 h-2.5 rounded-[3px] block ${isPaid ? 'bg-neutral-green-400' : 'bg-alert-red-400'}`}
        />
      </div>
      <span className="text-[40px] leading-normal mt-1">{amount}</span>
      <span className="text-secondary-blue-200/70 text-[14px] leading-normal mt-3">
        {paidCount}/{totalCount} people {isPaid ? 'paid' : 'pending'}
      </span>
    </div>
  );
};

const CardWrapper = ({
  summary,
  isLoading,
}: {
  summary: PayrollSummary;
  isLoading?: boolean;
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        <InfoCard amount="₹0" paidCount={0} totalCount={0} isPaid />
        <InfoCard amount="₹0" paidCount={0} totalCount={0} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      <InfoCard
        amount={formatCurrency(summary.totalPaid)}
        paidCount={summary.paidCount}
        totalCount={summary.totalEmployees}
        isPaid
      />
      <InfoCard
        amount={formatCurrency(summary.totalUnpaid)}
        paidCount={summary.unpaidCount}
        totalCount={summary.totalEmployees}
      />
    </div>
  );
};

export default CardWrapper;
