'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { WeeklyActivityPoint } from '@/types/trainer-activity';

interface ActivityChartProps {
  data: WeeklyActivityPoint[];
}

const tooltipStyle = {
  backgroundColor: '#1a2035',
  border: '1px solid #2d3a55',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '12px',
};

export function ActivityChart({ data }: ActivityChartProps) {
  if (data.length === 0) return null;

  const hasData = data.some((d) => d.sessionsLogged > 0);

  return (
    <Card className="border-none bg-secondary-blue-500 rounded-lg">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-normal text-white">
          Sessions logged — last 8 weeks
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 pr-4 pb-4">
        {!hasData ? (
          <div className="flex items-center justify-center h-[160px]">
            <p className="text-xs text-primary-blue-200">
              No sessions logged in the last 8 weeks
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data} barSize={20}>
              <CartesianGrid stroke="#2d3a55" vertical={false} />
              <XAxis
                dataKey="weekLabel"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#8a9bc0', fontSize: 10 }}
                tickMargin={6}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#8a9bc0', fontSize: 10 }}
                tickMargin={4}
                allowDecimals={false}
                width={28}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value?: number) => [value ?? '-', 'Sessions']}
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              />
              <Bar
                dataKey="sessionsLogged"
                fill="#EBFB8B"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
