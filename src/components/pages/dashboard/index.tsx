'use client';

import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';

import CardList from '@/components/pages/dashboard/card-list';
import { AttendanceChats } from '@/components/pages/dashboard/insights/attendance-chats';
import OutstandingPayment from '@/components/pages/dashboard/insights/outstanding-payment';
import Payments from '@/components/pages/dashboard/insights/payments';
import SkipperStats from '@/components/pages/dashboard/insights/skipper-stats';
import { MultiStepLoader } from '@/components/shared/loaders/multi-step-loader';
import { useAuth } from '@/providers/auth-provider';
import { DatePickerSchema } from '@/schemas';

import { KFormField, KFormFieldType } from '../../shared/form/k-formfield';
import { dashboardLoadingStates } from '../../shared/loaders';
import { Form } from '../../ui/form';

function Dashboard() {
  const { isAppUserLoading } = useAuth();

  const form = useForm<z.infer<typeof DatePickerSchema>>({
    resolver: zodResolver(DatePickerSchema),
    defaultValues: {
      dateOfBirth: undefined,
    },
  });

  if (isAppUserLoading) {
    return (
      <MultiStepLoader
        loadingStates={dashboardLoadingStates}
        loading={isAppUserLoading}
        duration={2500}
        loop={false}
      />
    );
  }

  return (
    <div className="p-5 md:p-8 bg-background-dark">
      <CardList />
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
                name="dateOfBirth"
                label="Date of birth"
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
          <AttendanceChats />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
