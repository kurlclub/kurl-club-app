'use client';

import {
  Cell,
  Label,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import { formatCurrency } from '@/utils/format-currency';

const revenueData = [
  {
    name: 'Memberships',
    value: 260000,
    color: '#F9B130',
  },
  {
    name: 'Personal Training',
    value: 110000,
    color: '#E94B8A',
  },
  {
    name: 'Group Classes',
    value: 85000,
    color: '#7DC74D',
  },
  {
    name: 'Nutritional Plans',
    value: 45000,
    color: '#4BA5FF',
  },
  {
    name: 'Merchandise Sales',
    value: 38000,
    color: '#FF7F50',
  },
  {
    name: 'Supplements',
    value: 52000,
    color: '#A78BFA',
  },
  {
    name: 'Corporate Memberships',
    value: 95000,
    color: '#06B6D4',
  },
  {
    name: 'Facility Rental',
    value: 28000,
    color: '#EC4899',
  },
];

const total = revenueData.reduce((acc, item) => acc + item.value, 0);

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: (typeof revenueData)[number];
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload?.[0]) {
    const data = payload[0].payload;

    return (
      <div className="bg-secondary-blue-700 p-2 rounded-lg border border-secondary-blue-600 z-50">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="w-3 h-3 rounded-[3px]"
            style={{ backgroundColor: data.color }}
          />
          <p className="text-white text-sm font-medium">{data.name}</p>
        </div>

        <p className="text-secondary-blue-200 text-xs">
          {formatCurrency(data.value)}
        </p>

        <p className="text-secondary-blue-200 text-xs">
          {((data.value / total) * 100).toFixed(1)}%
        </p>
      </div>
    );
  }

  return null;
};

const RevenueChart = () => {
  return (
    <div className="p-5 rounded-xl bg-primary-blue-400/39 text-white">
      <h3 className="text-[20px] leading-normal font-medium mb-5">
        Revenue breakdown
      </h3>

      <div className="flex flex-col lg:flex-row gap-3">
        {/* Donut Chart */}
        <div className="flex-1 flex justify-center bg-secondary-blue-700 rounded-[28px] py-6.5 px-8.5 relative">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={revenueData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                dataKey="value"
                stroke="none"
              >
                {revenueData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}

                <Label
                  position="center"
                  content={() => (
                    <text
                      x="50%"
                      y="48%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                    >
                      <tspan x="50%" dy="-0.4em" fontSize="15">
                        Total revenue
                      </tspan>
                      <tspan x="50%" dy="1.4em" fontSize="20" fontWeight="bold">
                        {formatCurrency(total)}
                      </tspan>
                    </text>
                  )}
                />
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Stats Grid */}
        <div className="flex-1 flex flex-col gap-4.5 bg-secondary-blue-700 rounded-[28px] p-5">
          {revenueData.map((item, index) => (
            <div key={index} className="flex justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded-[3px]"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[15px] leading-normal">{item.name}</span>
              </div>
              <span className="text-[15px] font-bold leading-normal">
                {formatCurrency(item.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
