'use client';

import {
  Cell,
  Label,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import { RevenueBreakdownEmptyIcon } from '@/components/shared/icons/revenue-breakdown-empty-icon';
import { cn } from '@/lib/utils';
import { ReportsAndExpensesData } from '@/types/reports-and-expenses';
import { formatCurrency } from '@/utils/format-currency';

import ReportEmptyState from './report-empty-state';
import { hasExpenseBreakdownData } from './report-empty-state-utils';

interface RevenueChartProps {
  report: ReportsAndExpensesData;
  className?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      name: string;
      amount: number;
      color: string;
    };
  }>;
  total: number;
}

const CustomTooltip = ({ active, payload, total }: CustomTooltipProps) => {
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
          {formatCurrency(data.amount)}
        </p>

        <p className="text-secondary-blue-200 text-xs">
          {total ? `${((data.amount / total) * 100).toFixed(1)}%` : '0%'}
        </p>
      </div>
    );
  }

  return null;
};

const RevenueChart = ({ report, className }: RevenueChartProps) => {
  const total = report.totalExpenses || 0;
  const hasBreakdownData = hasExpenseBreakdownData(report);

  return (
    <div
      className={cn(
        'p-4 rounded-xl bg-primary-blue-400/39 text-white',
        className
      )}
    >
      <h3 className="text-[18px] leading-normal font-medium mb-3">
        Expense breakdown
      </h3>

      {hasBreakdownData ? (
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 flex justify-center items-center bg-secondary-blue-700 rounded-[28px] relative h-72">
            <ResponsiveContainer width="100%" height={288}>
              <PieChart>
                <Pie
                  data={report.revenueBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  dataKey="amount"
                  stroke="none"
                >
                  {report.revenueBreakdown.map((entry, index) => (
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
                        <tspan x="50%" dy="-0.4em" fontSize={12}>
                          Total expenses
                        </tspan>
                        <tspan
                          x="50%"
                          dy="1.4em"
                          fontSize={16}
                          fontWeight="bold"
                        >
                          {formatCurrency(total)}
                        </tspan>
                      </text>
                    )}
                  />
                </Pie>
                <Tooltip content={<CustomTooltip total={total} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1 flex flex-col gap-3 bg-secondary-blue-700 rounded-[28px] p-4 overflow-y-auto h-72">
            {report.revenueBreakdown.map((item, index) => (
              <div key={index} className="flex justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-[3px]"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[13px] leading-normal">
                    {item.name}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-[13px] font-bold leading-normal">
                    {formatCurrency(item.amount)}
                  </div>
                  <div className="text-[11px] text-primary-blue-100">
                    {total
                      ? `${((item.amount / total) * 100).toFixed(1)}%`
                      : '0%'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <ReportEmptyState
          className="mt-3 rounded-[28px] border-0 bg-secondary-blue-700 px-5 py-5"
          icon={<RevenueBreakdownEmptyIcon size={180} />}
          title="No data available yet !"
          description="Add expenses or revenue manually, or through staff payments and membership fees."
          titleClassName="text-[28px] mt-4 leading-[1.05]"
          descriptionClassName="mx-auto mt-2 max-w-135"
        />
      )}
    </div>
  );
};

export default RevenueChart;
