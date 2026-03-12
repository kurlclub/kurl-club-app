'use client';

import { useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Download, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod/v4';

import {
  KFormField,
  KFormFieldType,
} from '@/components/shared/form/k-formfield';
import { StudioLayout } from '@/components/shared/layout';
import { FeatureLockOverlay } from '@/components/shared/subscription';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { useSheet } from '@/hooks/use-sheet';
import { useSubscriptionAccess } from '@/hooks/use-subscription-access';
import { toUtcDateOnlyISOString } from '@/lib/utils';
import { useGymBranch } from '@/providers/gym-branch-provider';
import {
  ReportAccessError,
  reportService,
  useReportsAndExpenses,
} from '@/services/report';
import { Expense } from '@/services/revenue';
import { ReportsAndExpensesData } from '@/types/reports-and-expenses';

import AddExpense from './expenses/add-expense';
import ExpenseTracker from './expenses/expense-tracker';
import NetProfitBanner from './reports/net-profit-banner';
import ProfitChart from './reports/profit-chart';
import RevenueChart from './reports/revenue-chart';

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
    joiningFees: 52498,
    otherCollection: 300,
  },
  revenueBreakdown: [
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

const ReportsDateRangeSchema = z.object({
  dateRange: z
    .object({
      from: z.date(),
      to: z.date(),
    })
    .optional(),
});

interface LockedReportsStateProps {
  message?: string;
  onUpgrade?: () => void;
  showOverlay?: boolean;
  blur?: boolean;
}

const previewExpensesByDate = [
  {
    date: 'Feb 26',
    items: [
      {
        title: 'Communications',
        notes: 'Salary payment for Veera...',
        amount: '+₹200',
        time: '1:33 PM',
      },
      {
        title: 'Sales',
        notes: 'Commission for product sale...',
        amount: '-₹250',
        time: '1:33 PM',
      },
      {
        title: 'Refund',
        notes: 'Customer refund processed',
        amount: '+₹150',
        time: '2:10 PM',
      },
    ],
  },
  {
    date: 'Feb 12',
    items: [
      {
        title: 'Marketing',
        notes: 'Digital marketing campaign',
        amount: '-₹300',
        time: '3:00 PM',
      },
      {
        title: 'Subscription',
        notes: 'Monthly subscription fee',
        amount: '-₹100',
        time: '5:00 PM',
      },
    ],
  },
];

const PreviewExpenseSidebar = () => (
  <aside className="rounded-lg border border-secondary-blue-500 bg-secondary-blue-500 p-5 w-full xl:max-w-100 xl:sticky xl:top-17.5 xl:h-[calc(100vh-180px)] overflow-hidden flex flex-col">
    <h3 className="text-[28px] leading-none font-semibold text-white">
      Expenses
    </h3>
    <div className="mt-4 flex-1 min-h-0 space-y-5 overflow-y-auto pr-1">
      {previewExpensesByDate.map((section) => (
        <div key={section.date} className="space-y-3">
          <h4 className="text-[32px] leading-none font-semibold text-white">
            {section.date}
          </h4>
          <div className="space-y-2">
            {section.items.map((item, index) => (
              <div
                key={`${item.title}-${index}`}
                className="flex items-center justify-between gap-2 rounded-lg border border-primary-blue-400/40 bg-primary-blue-400/15 px-3 py-2"
              >
                <div className="min-w-0 flex items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-green-500 text-[11px] font-semibold text-[#0A1020]">
                    ₹
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-base font-medium text-white">
                      {item.title}
                    </p>
                    <p className="truncate text-sm text-primary-blue-100">
                      {item.notes}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-base font-semibold ${
                      item.amount.startsWith('-')
                        ? 'text-alert-red-400'
                        : 'text-[#6BC160]'
                    }`}
                  >
                    {item.amount}
                  </div>
                  <p className="text-[11px] text-primary-blue-100">
                    {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </aside>
);

const LockedReportsState = ({
  message,
  onUpgrade,
  showOverlay = false,
  blur = true,
}: LockedReportsStateProps) => {
  const blurClass = blur
    ? 'pointer-events-none select-none blur-sm saturate-[0.8] opacity-45'
    : '';
  return (
    <div className="relative">
      <div className={blurClass}>
        <div className="flex flex-col xl:flex-row gap-6 w-full justify-between relative">
          <div className="flex flex-col gap-4 w-full xl:h-[calc(100vh-180px)] xl:min-h-0">
            <NetProfitBanner report={previewReport} className="xl:flex-[0.9]" />
            <ProfitChart report={previewReport} className="xl:flex-[1.05]" />
            <RevenueChart
              report={previewReport}
              className="xl:flex-[1.35] xl:min-h-0"
            />
          </div>
          <PreviewExpenseSidebar />
        </div>
      </div>
      {showOverlay && message && onUpgrade && (
        <FeatureLockOverlay
          title="Reports require a higher plan"
          message={message}
          onUpgrade={onUpgrade}
        />
      )}
    </div>
  );
};

const ReportsAndExpenses = () => {
  const { isOpen, openSheet, closeSheet } = useSheet();
  const { gymBranch } = useGymBranch();
  const { hasFeatureAccess, openUpgradeModal } = useSubscriptionAccess();
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);
  const defaultFromDate = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }, []);
  const defaultToDate = useMemo(() => new Date(), []);

  const form = useForm<z.infer<typeof ReportsDateRangeSchema>>({
    resolver: zodResolver(ReportsDateRangeSchema),
    defaultValues: {
      dateRange: {
        from: defaultFromDate,
        to: defaultToDate,
      },
    },
  });
  const watchedDateRange = useWatch({
    control: form.control,
    name: 'dateRange',
  });
  const dateRange = useMemo(() => {
    return {
      fromDate: toUtcDateOnlyISOString(
        watchedDateRange?.from || defaultFromDate
      ),
      toDate: toUtcDateOnlyISOString(watchedDateRange?.to || defaultToDate),
    };
  }, [defaultFromDate, defaultToDate, watchedDateRange]);

  const gymId = gymBranch?.gymId ?? 0;
  const canAccessReports = hasFeatureAccess('basicReports');
  const {
    data: report,
    isLoading,
    error,
  } = useReportsAndExpenses(gymId, dateRange.fromDate, dateRange.toDate, {
    enabled: canAccessReports,
  });
  const reportError = error as Error | null;
  const accessError =
    reportError instanceof ReportAccessError ? reportError : null;
  const isReportLocked =
    accessError?.feature === 'BasicReports' ||
    /subscription plan|upgrade/i.test(accessError?.message ?? '');
  const lockedMessage =
    accessError?.message ?? 'Upgrade your subscription plan to unlock reports.';
  const closeExpenseSheet = () => {
    closeSheet();
    setSelectedExpense(null);
  };

  const openAddExpenseSheet = () => {
    setSelectedExpense(null);
    openSheet();
  };

  const openEditExpenseSheet = (expense: Expense) => {
    setSelectedExpense(expense);
    openSheet();
  };

  const handleDownloadReport = async () => {
    if (!gymId) {
      toast.error('Please select a gym before downloading reports');
      return;
    }

    setIsDownloadingReport(true);
    try {
      const { blob, filename } = await reportService.downloadCSV(
        gymId,
        dateRange.fromDate,
        dateRange.toDate
      );

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      toast.success('Report downloaded successfully');
    } catch (downloadError) {
      toast.error(
        downloadError instanceof Error
          ? downloadError.message
          : 'Failed to download report'
      );
    } finally {
      setIsDownloadingReport(false);
    }
  };

  const reportContent = (() => {
    if (!gymId) {
      return (
        <div className="rounded-xl border border-primary-blue-400/60 bg-primary-blue-400/20 p-5 text-white">
          <h3 className="text-lg font-medium">Select a gym branch</h3>
          <p className="mt-1 text-sm text-primary-blue-100">
            Choose a gym branch to load reports and expense analytics.
          </p>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex flex-col xl:flex-row gap-6 w-full justify-between relative">
          <div className="flex flex-col gap-4 w-full xl:h-[calc(100vh-180px)] xl:min-h-0">
            <Skeleton className="h-46 w-full rounded-xl xl:h-auto xl:flex-[0.9]" />
            <Skeleton className="h-43 w-full rounded-xl xl:h-auto xl:flex-[1.05]" />
            <Skeleton className="h-78 w-full rounded-xl xl:h-auto xl:flex-[1.35]" />
          </div>
          <Skeleton className="h-120 w-full xl:max-w-100 xl:h-[calc(100vh-180px)] rounded-xl" />
        </div>
      );
    }

    if (isReportLocked) {
      return (
        <LockedReportsState
          message={lockedMessage}
          onUpgrade={() =>
            openUpgradeModal({
              title: 'Reports require a higher plan',
              message: lockedMessage,
            })
          }
          showOverlay
          blur
        />
      );
    }

    if (!canAccessReports) {
      return <LockedReportsState blur={false} />;
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
      <div className="flex flex-col xl:flex-row gap-6 w-full justify-between relative">
        <div className="flex flex-col gap-3 w-full xl:min-h-0">
          <NetProfitBanner report={report} className="xl:flex-[0.7]" />
          <ProfitChart report={report} className="xl:flex-[0.8]" />
          <RevenueChart report={report} className="xl:min-h-0" />
        </div>
        <ExpenseTracker
          key={gymId}
          gymId={gymId}
          onEditExpense={openEditExpenseSheet}
        />
      </div>
    );
  })();

  const content = reportContent;

  return (
    <StudioLayout
      title="Reports and expenses"
      headerActions={
        <>
          <Form {...form}>
            <form className="min-w-60">
              <KFormField
                fieldType={KFormFieldType.DATE_PICKER}
                control={form.control}
                name="dateRange"
                label="Date Range"
                numberOfMonths={2}
                dateLabel="This month"
                showPresets
              />
            </form>
          </Form>
          <Button
            className="h-10"
            variant="secondary"
            onClick={handleDownloadReport}
            disabled={isDownloadingReport || !gymId}
          >
            {isDownloadingReport ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download CSV
          </Button>
          <Button
            className="h-10"
            onClick={openAddExpenseSheet}
            disabled={!gymId}
          >
            <Plus className="h-4 w-4" />
            Add expenses
          </Button>
          <AddExpense
            isOpen={isOpen}
            closeSheet={closeExpenseSheet}
            expenseToEdit={selectedExpense}
          />
        </>
      }
    >
      {content}
    </StudioLayout>
  );
};

export default ReportsAndExpenses;
