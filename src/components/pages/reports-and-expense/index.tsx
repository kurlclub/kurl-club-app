'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Crown, Sparkles } from 'lucide-react';
import { Plus } from 'lucide-react';
import { z } from 'zod/v4';

import {
  KFormField,
  KFormFieldType,
} from '@/components/shared/form/k-formfield';
import { StudioLayout } from '@/components/shared/layout';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { useSheet } from '@/hooks/use-sheet';
import { toUtcDateOnlyISOString } from '@/lib/utils';
import { useGymBranch } from '@/providers/gym-branch-provider';
import { ReportAccessError, useReportsAndExpenses } from '@/services/report';
import { ReportsAndExpensesData } from '@/types/reports-and-expenses';

import AddExpense from './add-expense';
import ExpenseList from './expense-list';
import NetProfitBanner from './net-profit-banner';
import ProfitChart from './profit-chart';
import RevenueChart from './revenue-chart';

const previewReport: ReportsAndExpensesData = {
  currentMemberCollections: 194717,
  netProfit: -2015216,
  totalRevenue: 195017,
  totalExpenses: 2210233,
  revenueTrendPercentage: 0,
  expenseTrendPercentage: 0,
  revenueFlow: {
    memberships: 194717,
    perSession: 11528,
    otherMemberCollections: 52498,
    otherIncome: 300,
  },
  expenseBreakdown: [
    { name: 'Communication', amount: 524968, color: '#FFD700' },
    { name: 'Insurance', amount: 492101, color: '#FFB6C1' },
    { name: 'Equipment Maintenance', amount: 457836, color: '#90EE90' },
    { name: 'Food & Beverages', amount: 452367, color: '#D3D3D3' },
    { name: 'Cleaning Supplies', amount: 235461, color: '#87CEEB' },
    { name: 'Staff Salaries', amount: 47200, color: '#E6E6FA' },
    { name: 'Entertainment', amount: 400, color: '#FF69B4' },
    { name: 'Rent', amount: 200, color: '#FFA500' },
  ],
};

const upgradeRoute = '/account-settings?tab=subscription';

const ReportsDateRangeSchema = z.object({
  dateRange: z
    .object({
      from: z.date(),
      to: z.date(),
    })
    .optional(),
});

interface LockedReportsStateProps {
  message: string;
}

const LockedReportsState = ({ message }: LockedReportsStateProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const router = useRouter();

  return (
    <>
      <div className="relative">
        <div className="pointer-events-none select-none blur-sm saturate-[0.8] opacity-45">
          <div className="flex flex-col xl:flex-row gap-8 w-full justify-between relative">
            <div className="flex flex-col gap-6 w-full">
              <NetProfitBanner report={previewReport} />
              <ProfitChart report={previewReport} />
              <RevenueChart report={previewReport} />
            </div>
            <ExpenseList
              expenseBreakdown={previewReport.expenseBreakdown}
              totalExpenses={previewReport.totalExpenses}
            />
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md border-secondary-blue-400 bg-secondary-blue-500 text-white">
          <DialogHeader className="text-left">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-primary-green-500/15 border border-primary-green-500/30 flex items-center justify-center">
                <Crown className="h-5 w-5 text-primary-green-500" />
              </div>
              <div>
                <DialogTitle>Reports require a higher plan</DialogTitle>
                <DialogDescription className="text-primary-blue-100 mt-1">
                  Upgrade your subscription to unlock Basic Reports.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="rounded-2xl border border-secondary-blue-400 bg-primary-blue-400/40 p-4">
            <p className="text-sm leading-6 text-primary-blue-100">{message}</p>

            <div className="mt-4 flex items-center gap-2 rounded-xl bg-secondary-blue-700 px-3 py-2">
              <Sparkles className="h-4 w-4 text-primary-green-500" />
              <span className="text-sm text-white">
                Unlock financial summaries, revenue flow, and expense
                breakdowns.
              </span>
            </div>
          </div>

          <DialogFooter className="sm:justify-start">
            <Button asChild className="h-11">
              <Link href={upgradeRoute}>See plans</Link>
            </Button>
            <Button
              variant="outline"
              className="h-11 border-white/15 bg-transparent hover:bg-white/5"
              onClick={() => router.push('/dashboard')}
            >
              Maybe later
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const ReportsAndExpenses = () => {
  const { isOpen, openSheet, closeSheet } = useSheet();
  const { gymBranch } = useGymBranch();
  const form = useForm<z.infer<typeof ReportsDateRangeSchema>>({
    resolver: zodResolver(ReportsDateRangeSchema),
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
  const gymId = gymBranch?.gymId ?? 1;
  const {
    data: report,
    isLoading,
    error,
  } = useReportsAndExpenses(gymId, dateRange.fromDate, dateRange.toDate);
  const reportError = error as Error | null;
  const accessError =
    reportError instanceof ReportAccessError ? reportError : null;
  const isReportLocked =
    accessError?.feature === 'BasicReports' ||
    /subscription plan|upgrade/i.test(accessError?.message ?? '');
  const lockedMessage =
    accessError?.message ?? 'Upgrade your subscription plan to unlock reports.';

  const content = (() => {
    if (isLoading) {
      return (
        <div className="flex flex-col xl:flex-row gap-8 w-full justify-between relative">
          <div className="flex flex-col gap-6 w-full">
            <Skeleton className="h-[230px] w-full rounded-xl" />
            <Skeleton className="h-[214px] w-full rounded-xl" />
            <Skeleton className="h-[390px] w-full rounded-xl" />
          </div>
          <Skeleton className="h-[560px] w-full xl:max-w-[400px] rounded-xl" />
        </div>
      );
    }

    if (isReportLocked) {
      return <LockedReportsState message={lockedMessage} />;
    }

    if (error || !report) {
      return (
        <div className="rounded-xl border border-alert-red-500/40 bg-alert-red-500/10 p-5 text-white">
          <h3 className="text-lg font-medium">Unable to load reports</h3>
          <p className="text-sm text-primary-blue-100 mt-1">
            {(error as Error | undefined)?.message ||
              'The reports endpoint did not return usable data.'}
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col xl:flex-row gap-8 w-full justify-between relative">
        <div className="flex flex-col gap-6 w-full">
          <NetProfitBanner report={report} />
          <ProfitChart report={report} />
          <RevenueChart report={report} />
        </div>
        <ExpenseList
          expenseBreakdown={report.expenseBreakdown}
          totalExpenses={report.totalExpenses}
        />
      </div>
    );
  })();

  return (
    <StudioLayout
      title="Reports and expenses"
      headerActions={
        <>
          <Form {...form}>
            <form className="min-w-[240px]">
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
          <Button className="h-10" onClick={openSheet}>
            <Plus className="h-4 w-4" />
            Add expenses
          </Button>
          <AddExpense isOpen={isOpen} closeSheet={closeSheet} />
        </>
      }
    >
      {content}
    </StudioLayout>
  );
};

export default ReportsAndExpenses;
