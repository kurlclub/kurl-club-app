'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useGymBranch } from '@/providers/gym-branch-provider';
import { useDashboardData } from '@/services/dashboard';

const chartConfig = {
  count: {
    label: 'Count',
    color: 'hsl(69, 93%, 76%)',
  },
  date: {
    label: 'Date',
  },
} satisfies ChartConfig;

export function AttendanceStats() {
  const { gymBranch } = useGymBranch();
  const { data: dashboardData } = useDashboardData(gymBranch?.gymId || 0);

  const chartData =
    dashboardData?.attendanceStats?.map((stat) => ({
      date: stat.date,
      day: stat.day.slice(0, 3),
      count: stat.count || 0,
    })) || [];

  return (
    <Card className="border-none bg-secondary-blue-500 rounded-lg w-full">
      <CardHeader className="flex flex-row items-center justify-between p-5 sm:pb-7">
        <CardTitle className="text-white text-base font-normal leading-normal">
          Attendance Stats (Date vs Count)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 pr-5 pb-5 k-chart">
        <ChartContainer config={chartConfig} className="w-full sm:h-[235px]">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid stroke="#414349" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={8}
              axisLine={false}
              angle={-90}
              textAnchor="end"
              height={80}
              tick={(props) => {
                const { x, y, payload } = props;
                return (
                  <text
                    x={x}
                    y={y}
                    dy={-4}
                    textAnchor="end"
                    fill="#ffff"
                    fontSize={10}
                    transform={`rotate(-90 ${x} ${y})`}
                  >
                    {payload.value}
                  </text>
                );
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={(props) => {
                const { x, y, payload } = props;
                return (
                  <text
                    x={x}
                    y={y}
                    dx={0}
                    dy={3}
                    textAnchor="end"
                    fill="#b5b6b9"
                  >
                    {payload.value}
                  </text>
                );
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => `Date: ${value}`}
                />
              }
            />
            <Bar dataKey="count" fill="#EBFB8B" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
