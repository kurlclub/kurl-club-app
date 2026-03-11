import { ReportsAndExpensesData } from '@/types/reports-and-expenses';
import { formatCurrency } from '@/utils/format-currency';

interface ProfitChartProps {
  report: ReportsAndExpensesData;
}

const ProfitChart = ({ report }: ProfitChartProps) => {
  const data = [
    {
      label: 'Memberships',
      value: report.revenueFlow.memberships,
      color: 'bg-secondary-yellow-500',
    },
    {
      label: 'Per session',
      value: report.revenueFlow.perSession,
      color: 'bg-secondary-pink-500',
    },
    {
      label: 'Other collections',
      value: report.revenueFlow.otherMemberCollections,
      color: 'bg-neutral-green-400',
    },
    {
      label: 'Other income',
      value: report.revenueFlow.otherIncome,
      color: 'bg-semantic-blue-300',
    },
  ];
  const total = data.reduce((acc, item) => acc + item.value, 0);
  const GAP = 1.5;

  return (
    <div className="p-5 rounded-xl bg-primary-blue-400/40 text-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[18px] leading-normal font-medium">
            Revenue flow
          </h3>
          <p className="text-sm text-primary-blue-100 mt-1">
            Collections grouped by the streams returned from the report API.
          </p>
        </div>
        <div className="text-right">
          <div className="text-[12px] uppercase tracking-[0.08em] text-primary-blue-100">
            Tracked flow
          </div>
          <div className="text-[20px] font-semibold">
            {formatCurrency(total)}
          </div>
        </div>
      </div>

      <div className="relative w-full h-4 bg-muted rounded-full overflow-hidden mt-4">
        {data.map((item, index) => {
          const percent = total ? (item.value / total) * 100 : 0;

          const leftPercent = data
            .slice(0, index)
            .reduce((acc, i) => acc + (total ? (i.value / total) * 100 : 0), 0);

          const isFirst = index === 0;
          const isLast = index === data.length - 1;

          return (
            <div
              key={index}
              className={`absolute top-0 h-full ${item.color}
        ${isFirst ? 'rounded-l-full' : ''}
        ${isLast ? 'rounded-r-full' : ''}
        ${!isFirst && !isLast ? 'rounded-none' : ''}
        `}
              style={{
                left: `calc(${leftPercent}% + ${index * GAP}px)`,
                width: total ? `calc(${percent}% - ${GAP}px)` : '0%',
              }}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 mt-5">
        {data.map((item, index) => (
          <div
            key={index}
            className="bg-secondary-blue-700 rounded-lg p-2 flex flex-col gap-2"
          >
            <div className="flex items-center gap-2 text-[14px] leading-normal text-secondary-blue-200">
              <span className={`w-3 h-3 rounded-[3px] ${item.color}`} />
              {item.label}
            </div>

            <span className="text-[24px] font-medium leading-normal">
              {formatCurrency(item.value)}
            </span>

            <span className="text-[12px] text-primary-blue-100">
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
