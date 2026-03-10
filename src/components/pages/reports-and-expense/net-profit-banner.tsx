import Image from 'next/image';

import { ArrowDown, ArrowUp } from 'lucide-react';

import { formatCurrency } from '@/utils/format-currency';

interface ValueCardProps {
  isRevenue: boolean;
  value: string;
}

const ValueCard = ({ isRevenue, value }: ValueCardProps) => {
  return (
    <div className="p-3 rounded-xl flex flex-col gap-2 bg-card-bg/90 max-w-[160px] w-full z-10">
      <div className="flex items-center gap-1">
        <span className="text-secondary-blue-200 text-[14px] leading-normal">
          {isRevenue ? 'Revenue' : 'Expenses'}
        </span>
        {isRevenue ? (
          <ArrowUp size={14} className="text-neutral-green-500" />
        ) : (
          <ArrowDown size={14} className="text-alert-red-500" />
        )}
      </div>
      <span className="text-[20px] leading-normal">
        {formatCurrency(value)}
      </span>
    </div>
  );
};

const NetProfitBanner = () => {
  const higherThanLastMonth = true; // This would be calculated based on actual data in a real implementation
  return (
    <div
      className="rounded-xl border border-white/30 p-5 flex gap-7 items-end justify-between 
bg-gradient-to-l from-[#90A8ED]/35 to-[#11141C] relative"
    >
      <Image
        alt="banner-bg"
        src={'/assets/svg/reports-banner-bg.svg'}
        height={100}
        width={100}
        className="w-auto h-auto absolute right-0 top-0"
      />
      <div className="flex flex-col">
        <span className="text-secondary-blue-200 text-[15px] leading-normal">
          Net profit
        </span>
        <span className="mt-1 text-[44px] leading-normal">
          {formatCurrency('110000')}
        </span>
        <div className="flex items-center gap-2 mt-4">
          <span
            className={`flex items-center gap-1 px-2 py-1 rounded-[34px] text-[14px] leading-normal border ${higherThanLastMonth ? 'bg-neutral-green-500/20  border-neutral-green-500' : 'bg-alert-red-500/20  border-alert-red-500'}`}
          >
            {higherThanLastMonth ? (
              <ArrowUp size={14} className="text-neutral-green-500" />
            ) : (
              <ArrowDown size={14} className="text-alert-red-500" />
            )}
            36%
          </span>
          <span className="text-secondary-blue-200 text-[14px] leading-normal">
            Vs Last month
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 w-full justify-end">
        <ValueCard isRevenue={true} value="420000" />
        <ValueCard isRevenue={false} value="310000" />
      </div>
    </div>
  );
};

export default NetProfitBanner;
