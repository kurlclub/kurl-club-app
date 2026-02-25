'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';

import CardList from '@/components/pages/dashboard/card-list';
import { AttendanceStats } from '@/components/pages/dashboard/insights/attendance-stats';
import OutstandingPayment from '@/components/pages/dashboard/insights/outstanding-payment';
import Payments from '@/components/pages/dashboard/insights/payments';
import SkipperStats from '@/components/pages/dashboard/insights/skipper-stats';
import { MultiStepLoader } from '@/components/shared/loaders/multi-step-loader';
import { toUtcDateOnlyISOString } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';

import { KFormField, KFormFieldType } from '../../shared/form/k-formfield';
import { dashboardLoadingStates } from '../../shared/loaders';
import { Form } from '../../ui/form';

const DashboardDateRangeSchema = z.object({
  dateRange: z
    .object({
      from: z.date(),
      to: z.date(),
    })
    .optional(),
});

function Dashboard() {
  const { isLoading } = useAuth();
  const [dateRange, setDateRange] = useState<{
    fromDate?: string;
    toDate?: string;
  }>({});

  const form = useForm<z.infer<typeof DashboardDateRangeSchema>>({
    resolver: zodResolver(DashboardDateRangeSchema),
    defaultValues: {
      dateRange: undefined,
    },
  });

  // Watch for date range changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.dateRange?.from && value.dateRange?.to) {
        setDateRange({
          fromDate: toUtcDateOnlyISOString(value.dateRange.from),
          toDate: toUtcDateOnlyISOString(value.dateRange.to),
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  if (isLoading) {
    return (
      <MultiStepLoader
        loadingStates={dashboardLoadingStates}
        loading={isLoading}
        duration={2500}
        loop={false}
      />
    );
  }

  return (
    <div className="p-5 md:p-8 bg-background-dark">
      <CardList fromDate={dateRange.fromDate} toDate={dateRange.toDate} />
      <div className="flex flex-col gap-4 mt-7">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-white font-medium text-2xl leading-normal">
            Insights
          </h2>
          <Form {...form}>
            <form>
              <KFormField
                fieldType={KFormFieldType.DATE_PICKER}
                control={form.control}
                name="dateRange"
                label="Date Range"
                numberOfMonths={2}
                dateLabel="Last month"
                showPresets
              />
            </form>
          </Form>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Payments />
          <OutstandingPayment />
          <SkipperStats />
          <AttendanceStats />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
