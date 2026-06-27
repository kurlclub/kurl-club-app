'use client';

import { Fragment, useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';

import { Loader2, Paperclip, Search, X } from 'lucide-react';

import { KDatePicker } from '@/components/shared/form/k-datepicker';
import { DataTableFacetedFilter } from '@/components/shared/table/data-table-faceted-filter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrency } from '@/hooks/use-currency';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import {
  Expense,
  ExpenseFilterCategory,
  useExpenseCategories,
  useInfiniteExpenses,
} from '@/services/revenue';
import { formatCurrency } from '@/utils/format-currency';

import ReportEmptyState from '../reports/report-empty-state';

const getApiCategoryFilters = (
  availableFilters: unknown
): ExpenseFilterCategory[] => {
  if (!availableFilters || typeof availableFilters !== 'object') return [];

  const raw = availableFilters as {
    Categories?: unknown[];
    categories?: unknown[];
  };

  const source = Array.isArray(raw.Categories)
    ? raw.Categories
    : Array.isArray(raw.categories)
      ? raw.categories
      : [];

  const parsed: ExpenseFilterCategory[] = [];

  source.forEach((item) => {
    if (!item || typeof item !== 'object') return;

    const category = item as {
      value?: string | number;
      id?: string | number;
      label?: string;
      name?: string;
      count?: number;
    };

    const value = category.value ?? category.id;
    const label = category.label ?? category.name;
    if (value === undefined || !label) return;

    parsed.push({
      value: String(value),
      label,
      count: typeof category.count === 'number' ? category.count : undefined,
    });
  });

  return parsed;
};

interface ExpenseTrackerProps {
  gymId: number;
  onEditExpense: (expense: Expense) => void;
  className?: string;
}

const ExpenseTracker = ({
  gymId,
  onEditExpense,
  className,
}: ExpenseTrackerProps) => {
  const { data: categories = [] } = useExpenseCategories();
  const { currencySymbol } = useCurrency();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 350);

  // Filters apply immediately (toolbar pattern), no draft/apply step.
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [categoryIds, setCategoryIds] = useState<string[]>([]);

  const {
    data: expensesData,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteExpenses({
    gymId,
    pageSize: 20,
    search: debouncedSearch.trim() ? debouncedSearch : undefined,
    categoryId: categoryIds.length ? categoryIds.map(Number) : undefined,
    startDate: dateRange?.from ? dateRange.from.toISOString() : undefined,
    endDate: dateRange?.to ? dateRange.to.toISOString() : undefined,
  });

  const categoryOptions = useMemo<ExpenseFilterCategory[]>(
    () =>
      categories.map((category) => ({
        value: String(category.id),
        label: category.name,
      })),
    [categories]
  );

  const availableApiCategories = useMemo(
    () => getApiCategoryFilters(expensesData?.pages[0]?.availableFilters),
    [expensesData]
  );
  const categoryFilterOptions = useMemo(() => {
    const mergedMap = new Map<string, ExpenseFilterCategory>();

    categoryOptions.forEach((category) => {
      mergedMap.set(category.value, category);
    });
    availableApiCategories.forEach((category) => {
      const existing = mergedMap.get(category.value);
      mergedMap.set(category.value, { ...existing, ...category });
    });

    return Array.from(mergedMap.values());
  }, [availableApiCategories, categoryOptions]);

  const expenses = useMemo(
    () => expensesData?.pages.flatMap((page) => page.data) || [],
    [expensesData]
  );

  const summary = useMemo(
    () =>
      expensesData?.pages[0]?.summary || {
        totalExpense: 0,
        totalIncome: 0,
        netProfit: 0,
      },
    [expensesData]
  );

  const groupedExpenses = useMemo(() => {
    const grouped = expenses.reduce(
      (acc, expense) => {
        const dateKey = expense.expenseDate.includes('T')
          ? expense.expenseDate.split('T')[0]
          : expense.expenseDate;
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(expense);
        return acc;
      },
      {} as Record<string, Expense[]>
    );

    return Object.entries(grouped)
      .sort(
        ([first], [second]) =>
          new Date(second).getTime() - new Date(first).getTime()
      )
      .map(([date, items]) => ({
        date,
        title: new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        items,
      }));
  }, [expenses]);

  const hasActiveFilters = Boolean(dateRange?.from) || categoryIds.length > 0;

  const resetFilters = () => {
    setDateRange(undefined);
    setCategoryIds([]);
  };

  return (
    <aside
      className={cn(
        'rounded-xl border border-white/10 bg-primary-blue-400/40 p-4 w-full xl:max-w-100 xl:sticky xl:top-17.5 xl:h-[calc(100vh-180px)] overflow-hidden',
        className
      )}
    >
      <div className="flex h-full min-h-0 flex-col gap-3">
        <h3 className="text-lg font-semibold text-white">Expenses</h3>

        <div className="grid grid-cols-3 divide-x divide-white/10 rounded-lg border border-white/10 bg-secondary-blue-700">
          <div className="px-3 py-2.5">
            <p className="text-[11px] text-white/50">Money in</p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums text-neutral-green-300">
              {formatCurrency(summary.totalIncome, currencySymbol)}
            </p>
          </div>
          <div className="px-3 py-2.5">
            <p className="text-[11px] text-white/50">Money out</p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums text-alert-red-400">
              {formatCurrency(summary.totalExpense, currencySymbol)}
            </p>
          </div>
          <div className="px-3 py-2.5">
            <p className="text-[11px] text-white/50">Net</p>
            <p
              className={cn(
                'mt-0.5 text-sm font-semibold tabular-nums',
                summary.netProfit >= 0
                  ? 'text-neutral-green-300'
                  : 'text-alert-red-400'
              )}
            >
              {formatCurrency(summary.netProfit, currencySymbol)}
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search expenses…"
            className="h-10 border-white/10 bg-secondary-blue-700 pl-9 text-white placeholder:text-white/45"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <KDatePicker
            mode="range"
            numberOfMonths={2}
            label="All time"
            value={dateRange}
            onDateChange={(range) =>
              setDateRange(range as DateRange | undefined)
            }
            className="h-8 border-dashed border-white/25 bg-secondary-blue-700 px-3 text-xs font-normal hover:bg-secondary-blue-600"
          />
          <DataTableFacetedFilter
            title="Category"
            options={categoryFilterOptions}
            selectedValues={categoryIds}
            onFilterChange={(values) => setCategoryIds(values ?? [])}
            maxBadges={1}
            triggerClassName="border-white/25 bg-secondary-blue-700 hover:bg-secondary-blue-600"
          />
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={resetFilters}
              className="h-8 px-2 text-xs"
            >
              Reset
              <X className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="min-h-0 flex-1 space-y-2 overflow-hidden pt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : groupedExpenses.length === 0 ? (
          <ReportEmptyState
            className="rounded-xl border-white/10 bg-secondary-blue-700 p-8"
            title="No expenses found"
            description="Add an expense to start tracking."
            titleClassName="text-base font-medium"
            descriptionClassName="mt-1"
          />
        ) : (
          <div className="-mr-1 min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
            {groupedExpenses.map((section, index) => {
              const [month, day] = section.title.split(' ');
              const year = new Date(`${section.date}T00:00:00`).getFullYear();
              const prevYear =
                index > 0
                  ? new Date(
                      `${groupedExpenses[index - 1].date}T00:00:00`
                    ).getFullYear()
                  : null;

              return (
                <Fragment key={section.date}>
                  {year !== prevYear && (
                    <div className="flex items-center gap-2 pt-1 first:pt-0">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
                        {year}
                      </span>
                      <span className="h-px flex-1 bg-white/10" />
                    </div>
                  )}
                  <div className="flex gap-3">
                    <div className="flex w-12 shrink-0 flex-col items-center rounded-lg bg-secondary-blue-700 py-2">
                      <span className="text-[10px] font-medium uppercase tracking-wide text-primary-green-500">
                        {month}
                      </span>
                      <span className="text-xl font-bold leading-none text-white">
                        {day}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 border-l border-white/10 pl-3">
                      {section.items.map((expense) => {
                        const isExpense =
                          (expense.type || 'expense') === 'expense';
                        const expenseTime = new Date(
                          expense.expenseDate
                        ).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        });
                        const categoryColor =
                          categories.find(
                            (category) =>
                              category.id === expense.expenseCategoryId
                          )?.color || '#6B7280';
                        const hasAttachment =
                          expense.isFileAttached ||
                          Boolean(expense.receiptPath);

                        return (
                          <button
                            type="button"
                            key={expense.id}
                            onClick={() => onEditExpense(expense)}
                            className="flex w-full cursor-pointer items-start justify-between gap-2 rounded-md px-1.5 py-2 text-left transition-colors hover:bg-white/5"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="size-2 shrink-0 rounded-full"
                                  style={{ backgroundColor: categoryColor }}
                                />
                                <p className="truncate text-sm font-medium text-white">
                                  {expense.categoryName}
                                </p>
                                {hasAttachment && (
                                  <Paperclip className="size-3 shrink-0 text-white/50" />
                                )}
                              </div>
                              <p className="mt-0.5 truncate text-xs text-white/50">
                                {expense.notes || 'No notes'}
                              </p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p
                                className={cn(
                                  'text-sm font-semibold tabular-nums',
                                  isExpense
                                    ? 'text-alert-red-400'
                                    : 'text-neutral-green-300'
                                )}
                              >
                                {isExpense ? '−' : '+'}
                                {formatCurrency(expense.amount, currencySymbol)}
                              </p>
                              <p className="text-[11px] text-white/45">
                                {expenseTime}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </Fragment>
              );
            })}
            {hasNextPage && (
              <div className="flex justify-center pt-1">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="min-w-30"
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load more'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

export default ExpenseTracker;
