'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime } from '@/lib/utils';
import type { ProgressLog } from '@/types/progress';

interface ProgressChartsProps {
  logs: ProgressLog[];
}

interface ChartPoint {
  date: string;
  weight?: number | null;
  bodyFat?: number | null;
}

const tooltipStyle = {
  backgroundColor: '#1a2035',
  border: '1px solid #2d3a55',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '12px',
};

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-[160px]">
      <p className="text-xs text-primary-blue-200">{message}</p>
    </div>
  );
}

export function ProgressCharts({ logs }: ProgressChartsProps) {
  const sorted = [...logs].sort(
    (a, b) => new Date(a.logDate).getTime() - new Date(b.logDate).getTime()
  );

  const chartData: ChartPoint[] = sorted.map((log) => ({
    date: formatDateTime(log.logDate, 'date'),
    weight: log.bodyMetrics.weight ?? undefined,
    bodyFat: log.bodyMetrics.bodyFatPercent ?? undefined,
  }));

  const hasWeightData = chartData.some((d) => d.weight != null);
  const hasBodyFatData = chartData.some((d) => d.bodyFat != null);

  if (!hasWeightData && !hasBodyFatData) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Weight Trend */}
      {hasWeightData && (
        <Card className="border-none bg-secondary-blue-500 rounded-lg">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-normal text-white">
              Weight Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pr-4 pb-4">
            {chartData.filter((d) => d.weight != null).length < 2 ? (
              <EmptyChart message="Add at least 2 logs with weight to see the trend" />
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={chartData}>
                  <CartesianGrid stroke="#2d3a55" vertical={false} />
                  <XAxis
                    dataKey="date"
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
                    unit="kg"
                    width={40}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value?: number) => [
                      `${value ?? '-'} kg`,
                      'Weight',
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#EBFB8B"
                    strokeWidth={2}
                    dot={{ fill: '#EBFB8B', r: 3 }}
                    activeDot={{ r: 5 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Body Fat Trend */}
      {hasBodyFatData && (
        <Card className="border-none bg-secondary-blue-500 rounded-lg">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-normal text-white">
              Body Fat Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pr-4 pb-4">
            {chartData.filter((d) => d.bodyFat != null).length < 2 ? (
              <EmptyChart message="Add at least 2 logs with body fat % to see the trend" />
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={chartData}>
                  <CartesianGrid stroke="#2d3a55" vertical={false} />
                  <XAxis
                    dataKey="date"
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
                    unit="%"
                    width={36}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value?: number) => [
                      `${value ?? '-'}%`,
                      'Body Fat',
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="bodyFat"
                    stroke="#7dd3fc"
                    strokeWidth={2}
                    dot={{ fill: '#7dd3fc', r: 3 }}
                    activeDot={{ r: 5 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
