'use client';
import { useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';

import CardList from '@/components/pages/dashboard/card-list';
import { AttendanceStats } from '@/components/pages/dashboard/insights/attendance-stats';
import OutstandingPayment from '@/components/pages/dashboard/insights/outstanding-payment';
import Payments from '@/components/pages/dashboard/insights/payments';
import SkipperStats from '@/components/pages/dashboard/insights/skipper-stats';
import { TrainerPortal } from '@/components/pages/trainer-portal';
import { KTabs } from '@/components/shared/form/k-tabs';
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

function AdminDashboard() {
  const form = useForm<z.infer<typeof DashboardDateRangeSchema>>({
    resolver: zodResolver(DashboardDateRangeSchema),
    defaultValues: {
      dateRange: undefined,
    },
  });

  const watchedDateRange = useWatch({
    control: form.control,
    name: 'dateRange',
  });
  const dateRange = useMemo(() => {
    if (!watchedDateRange?.from || !watchedDateRange?.to) {
      return { fromDate: undefined, toDate: undefined };
    }

    return {
      fromDate: toUtcDateOnlyISOString(watchedDateRange.from),
      toDate: toUtcDateOnlyISOString(watchedDateRange.to),
    };
  }, [watchedDateRange]);

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
          <Payments fromDate={dateRange.fromDate} toDate={dateRange.toDate} />
          <OutstandingPayment
            fromDate={dateRange.fromDate}
            toDate={dateRange.toDate}
          />
          <SkipperStats
            fromDate={dateRange.fromDate}
            toDate={dateRange.toDate}
          />
          <AttendanceStats
            fromDate={dateRange.fromDate}
            toDate={dateRange.toDate}
          />
        </div>
      </div>
    </div>
  );
}

const DASHBOARD_TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'my-portal', label: 'Trainer Portal' },
];

function Dashboard() {
  const { isLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const isTrainer = user?.userRole?.toLowerCase() === 'trainer';

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

  if (!isTrainer) {
    return <AdminDashboard />;
  }

  return (
    <div className="bg-background-dark">
      <div className="px-5 md:px-8 pt-5 md:pt-6">
        <KTabs
          items={DASHBOARD_TABS}
          variant="underline"
          value={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
      {activeTab === 'dashboard' ? <AdminDashboard /> : <TrainerPortal />}
    </div>
  );
}

export default Dashboard;
