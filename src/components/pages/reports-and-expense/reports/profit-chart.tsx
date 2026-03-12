import { cn } from '@/lib/utils';
import { ReportsAndExpensesData } from '@/types/reports-and-expenses';
import { formatCurrency } from '@/utils/format-currency';

import { isRevenueFlowEmpty } from './report-empty-state-utils';

interface ProfitChartProps {
  report: ReportsAndExpensesData;
  className?: string;
}

const ProfitChart = ({ report, className }: ProfitChartProps) => {
  const data = [
    {
      label: 'Memberships',
      value: report.revenueFlow.memberships,
      color: 'bg-secondary-yellow-500',
      mutedColor: 'bg-[#7F879A]',
    },
    {
      label: 'Per session',
      value: report.revenueFlow.perSession,
      color: 'bg-secondary-pink-500',
      mutedColor: 'bg-[#7F879A]',
    },
    {
      label: 'Joining fees',
      value: report.revenueFlow.joiningFees,
      color: 'bg-neutral-green-400',
      mutedColor: 'bg-[#7F879A]',
    },
    {
      label: 'Other collection',
      value: report.revenueFlow.otherCollection,
      color: 'bg-semantic-blue-300',
      mutedColor: 'bg-[#7F879A]',
    },
  ];
  const total = data.reduce((acc, item) => acc + item.value, 0);
  const isEmptyState = isRevenueFlowEmpty(report);
  const GAP = 1.5;

  return (
    <div
      className={cn(
        'p-4 pb-0 rounded-xl bg-primary-blue-400/40 text-white',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[16px] leading-normal font-medium">
            Revenue flow
          </h3>
          <p className="text-xs text-primary-blue-100 mt-1">
            Collections grouped by the streams returned from the report API.
          </p>
        </div>
        <div className="text-right">
          <div className="text-[11px] uppercase tracking-[0.08em] text-primary-blue-100">
            Tracked flow
          </div>
          <div className="text-[18px] font-semibold">
            {formatCurrency(total)}
          </div>
        </div>
      </div>

      <div className="relative w-full h-3.5 bg-muted rounded-full overflow-hidden my-3">
        {data.map((item, index) => {
          const percent = total
            ? (item.value / total) * 100
            : 100 / data.length;

          const leftPercent = data
            .slice(0, index)
            .reduce(
              (acc, i) =>
                acc + (total ? (i.value / total) * 100 : 100 / data.length),
              0
            );

          const isFirst = index === 0;
          const isLast = index === data.length - 1;
          const segmentColor = isEmptyState ? item.mutedColor : item.color;

          return (
            <div
              key={index}
              className={`absolute top-0 h-full ${segmentColor}
        ${isFirst ? 'rounded-l-full' : ''}
        ${isLast ? 'rounded-r-full' : ''}
        ${!isFirst && !isLast ? 'rounded-none' : ''}
        `}
              style={{
                left: `calc(${leftPercent}% + ${index * GAP}px)`,
                width: `calc(${percent}% - ${GAP}px)`,
              }}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-1.5 mt-2.5 mb-2">
        {data.map((item, index) => (
          <div
            key={index}
            className="bg-secondary-blue-700 rounded-lg p-2 flex flex-col gap-0.5"
          >
            <div className="flex items-center gap-2 text-[13px] leading-tight text-secondary-blue-200">
              <span
                className={`w-3 h-3 rounded-[3px] ${
                  isEmptyState ? item.mutedColor : item.color
                }`}
              />
              {item.label}
            </div>

            <span className="text-[20px] font-medium leading-tight">
              {formatCurrency(item.value)}
            </span>

            <span className="text-[11px] text-primary-blue-100 leading-tight">
              {total
                ? `${((item.value / total) * 100).toFixed(1)}% of flow`
                : '0% of flow'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfitChart;
