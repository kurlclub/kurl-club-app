import React from 'react';

import {
  Cell,
  Label,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { PAYMENT_CHART_COLORS, formatAmount } from '@/lib/utils';
import { useGymBranch } from '@/providers/gym-branch-provider';
import { useDashboardData } from '@/services/dashboard';

type ChartTooltipPayload = {
  payload?: {
    name: string;
    amount: number;
    color: string;
  };
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: ChartTooltipPayload[];
  total: number;
};

interface PaymentsProps {
  fromDate?: string;
  toDate?: string;
}

function CustomTooltip({ active, payload, total }: CustomTooltipProps) {
  if (active && payload?.[0]) {
    const data = payload[0].payload;
    if (!data) return null;

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
          {formatAmount(data.amount)}
        </p>

        <p className="text-secondary-blue-200 text-xs">
          {total ? `${((data.amount / total) * 100).toFixed(1)}%` : '0%'}
        </p>
      </div>
    );
  }

  return null;
}

function Payments({ fromDate, toDate }: PaymentsProps) {
  const { gymBranch } = useGymBranch();
  const { data: dashboardData } = useDashboardData(
    gymBranch?.gymId || 0,
    fromDate,
    toDate
  );

  const totalOutstanding = dashboardData?.payments.totalOutstanding || 0;
  const totalPaid = dashboardData?.payments.totalPaid || 0;

  const chartData = [
    {
      name: 'Unpaid',
      amount: totalOutstanding,
      color: PAYMENT_CHART_COLORS.UNPAID,
    },
    {
      name: 'Paid',
      amount: totalPaid,
      color: PAYMENT_CHART_COLORS.PAID,
    },
  ];
  const totalPayments = chartData.reduce((sum, item) => sum + item.amount, 0);

  const paymentSummary = [
    {
      label: 'Total unpaid members',
      value: dashboardData?.payments.totalUnpaidMembers || 0,
      color: PAYMENT_CHART_COLORS.UNPAID,
    },
    {
      label: 'Total outstanding',
      value: `₹${totalOutstanding.toLocaleString()}`,
      color: PAYMENT_CHART_COLORS.UNPAID,
    },
    {
      label: 'Total paid members',
      value: dashboardData?.payments.totalPaidMembers || 0,
      color: PAYMENT_CHART_COLORS.PAID,
    },
    {
      label: 'Total paid',
      value: `₹${totalPaid.toLocaleString()}`,
      color: PAYMENT_CHART_COLORS.PAID,
    },
  ];

  const isEmpty = totalPayments === 0;

  return (
    <Card className="border-none bg-secondary-blue-500 rounded-lg w-full">
      <CardContent className="flex h-full flex-col xl:flex-row gap-3 p-5 justify-between">
        <div className="flex flex-col gap-2 w-full xl:w-fit">
          <CardTitle className="text-white text-base font-normal leading-normal">
            Payments
          </CardTitle>
          {/* Pie Chart */}
          <div className="w-[240px] h-[240px] relative mx-auto flex items-center justify-center">
            {isEmpty ? (
              <div className="w-[220px] h-[220px] rounded-full border border-secondary-blue-400/70 bg-linear-to-br from-secondary-blue-400/20 via-secondary-blue-600/10 to-secondary-blue-700/20 flex flex-col items-center justify-center text-center px-6">
                <div className="w-14 h-14 rounded-full bg-secondary-blue-400/30 border border-secondary-blue-300/40 mb-3 flex items-center justify-center">
                  <span className="text-xl text-secondary-blue-100">₹</span>
                </div>
                <p className="text-white text-sm font-medium">
                  No payment activity
                </p>
                <p className="text-secondary-blue-200 text-xs mt-1">
                  Select another date range or wait for new transactions.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={<CustomTooltip total={totalPayments} />}
                    cursor={{ fill: 'rgba(255, 255, 255, 0.08)' }}
                  />
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={85}
                    outerRadius={120}
                    dataKey="amount"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}

                    <Label
                      position="center"
                      content={() => (
                        <text
                          x="50%"
                          y="50%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="white"
                        >
                          <tspan
                            x="50%"
                            dy="0.4em"
                            fontSize={32}
                            fontWeight="bold"
                          >
                            {formatAmount(totalOutstanding)}
                          </tspan>
                          <tspan x="50%" dy="-2.4em" fontSize={15}>
                            Unpaid
                          </tspan>
                        </text>
                      )}
                    />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="flex flex-col sm:flex-row xl:flex-col xl:py-3 justify-center gap-[6px] text-white w-full xl:max-w-[50%] max-w-full">
          <div className="bg-primary-blue-400 rounded-xl h-full p-5 flex flex-col gap-[10px] w-full">
            {paymentSummary.slice(0, 2).map((item, idx) => (
              <div className="flex items-start gap-[6px]" key={idx}>
                <span
                  className="w-[14px] h-[14px] rounded-full"
                  style={{ backgroundColor: item.color }}
                ></span>
                <div className="flex flex-col gap-2">
                  <span className="text-sm leading-normal">{item.label}</span>
                  <span className="font-medium text-base leading-normal ">
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-primary-blue-400 rounded-xl h-full p-5 flex flex-col gap-[10px] w-full">
            {paymentSummary.slice(2).map((item, idx) => (
              <div className="flex items-start gap-[6px]" key={idx}>
                <span
                  className="w-[14px] h-[14px] rounded-full"
                  style={{ backgroundColor: item.color }}
                ></span>
                <div className="flex flex-col gap-2">
                  <span className="text-sm leading-normal">{item.label}</span>
                  <span className="font-medium text-base leading-normal ">
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default Payments;
