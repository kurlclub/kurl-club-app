import Image from 'next/image';

import { ArrowDown, ArrowUp } from 'lucide-react';

import { ReportsAndExpensesData } from '@/types/reports-and-expenses';
import { formatCurrency } from '@/utils/format-currency';

import { isSummaryEmpty } from './report-empty-state-utils';

interface ValueCardProps {
  label: string;
  value: number;
  trendPercentage: number;
  isEmptyState: boolean;
}

const formatSignedCurrency = (value: number) => {
  const absoluteValue = formatCurrency(Math.abs(value));
  return value < 0 ? `-${absoluteValue}` : absoluteValue;
};

const ValueCard = ({
  label,
  value,
  trendPercentage,
  isEmptyState,
}: ValueCardProps) => {
  const isPositiveTrend = !isEmptyState && trendPercentage > 0;
  const isNegativeTrend = !isEmptyState && trendPercentage < 0;

  return (
    <div className="p-3 rounded-xl flex flex-col gap-2 bg-card-bg/90 max-w-[180px] w-full z-10">
      <div className="flex items-center gap-1">
        <span className="text-secondary-blue-200 text-[14px] leading-normal">
          {label}
        </span>
        {isPositiveTrend ? (
          <ArrowUp size={14} className="text-neutral-green-500" />
        ) : isNegativeTrend ? (
          <ArrowDown size={14} className="text-alert-red-500" />
        ) : null}
      </div>
      <span className="text-[20px] leading-normal">
        {formatCurrency(value)}
      </span>
      <span className="text-[12px] text-primary-blue-100">
        {isEmptyState
          ? 'No entries yet'
          : trendPercentage === 0
            ? 'No change reported'
            : `${Math.abs(trendPercentage)}% vs previous period`}
      </span>
    </div>
  );
};

interface NetProfitBannerProps {
  report: ReportsAndExpensesData;
}

const NetProfitBanner = ({ report }: NetProfitBannerProps) => {
  const isEmptyState = isSummaryEmpty(report);
  const isNetPositive = report.netProfit >= 0;
  const statusPillClass = isEmptyState
    ? 'bg-primary-blue-400/25 border-white/25 text-secondary-blue-100'
    : isNetPositive
      ? 'bg-neutral-green-500/20 border-neutral-green-500'
      : 'bg-alert-red-500/20 border-alert-red-500';
  const collectionsLabel = isEmptyState
    ? 'No collections recorded yet'
    : `Current member collections ${formatCurrency(report.currentMemberCollections)}`;

  return (
    <div
      className="rounded-xl border border-white/30 p-5 flex flex-col lg:flex-row gap-7 lg:items-end justify-between 
bg-gradient-to-l from-[#90A8ED]/35 to-[#11141C] relative"
    >
      <Image
        alt="banner-bg"
        src={'/assets/svg/reports-banner-bg.svg'}
        height={100}
        width={100}
        className="w-auto h-auto absolute right-0 top-0"
      />
      <div className="flex flex-col z-10">
        <span className="text-secondary-blue-200 text-[15px] leading-normal">
          Net {isNetPositive ? 'profit' : 'loss'}
        </span>
        <span className="mt-1 text-[44px] leading-normal">
          {formatSignedCurrency(report.netProfit)}
        </span>
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span
            className={`flex items-center gap-1 px-2 py-1 rounded-[34px] text-[14px] leading-normal border ${statusPillClass}`}
          >
            {isEmptyState ? null : isNetPositive ? (
              <ArrowUp size={14} className="text-neutral-green-500" />
            ) : (
              <ArrowDown size={14} className="text-alert-red-500" />
            )}
            {isEmptyState
              ? 'No activity yet'
              : isNetPositive
                ? 'Operating profit'
                : 'Operating loss'}
          </span>
          <span className="text-secondary-blue-200 text-[14px] leading-normal rounded-[34px] border border-white/20 px-2 py-1">
            {collectionsLabel}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 w-full justify-start lg:justify-end">
        <ValueCard
          label="Total revenue"
          value={report.totalRevenue}
          trendPercentage={report.revenueTrendPercentage}
          isEmptyState={isEmptyState}
        />
        <ValueCard
          label="Total expenses"
          value={report.totalExpenses}
          trendPercentage={report.expenseTrendPercentage}
          isEmptyState={isEmptyState}
        />
      </div>
    </div>
  );
};

export default NetProfitBanner;
