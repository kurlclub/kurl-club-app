import { formatCurrency } from '@/utils/format-currency';

const data = [
  {
    label: 'Memberships',
    value: 260000,
    color: 'bg-secondary-yellow-500',
  },
  {
    label: 'Personal training',
    value: 110000,
    color: 'bg-secondary-pink-500',
  },
  {
    label: 'Add-On’s',
    value: 50000,
    color: 'bg-neutral-green-400',
  },
  {
    label: 'Joining fees',
    value: 30000,
    color: 'bg-semantic-blue-300',
  },
];

const ProfitChart = () => {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  const GAP = 1.5;

  return (
    <div className="p-5 rounded-xl bg-primary-blue-400/40 text-white">
      <h3 className="text-[18px] leading-normal font-medium">Net profit</h3>

      {/* Segmented Progress */}
      <div className="relative w-full h-4 bg-muted rounded-full overflow-hidden mt-4">
        {data.map((item, index) => {
          const percent = (item.value / total) * 100;

          const leftPercent = data
            .slice(0, index)
            .reduce((acc, i) => acc + (i.value / total) * 100, 0);

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
                width: `calc(${percent}% - ${GAP}px)`,
              }}
            />
          );
        })}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-4 gap-2 mt-5">
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfitChart;
