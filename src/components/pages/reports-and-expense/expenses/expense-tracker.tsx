'use client';

import { useMemo, useState } from 'react';

import { Calendar, Filter, Loader2, Paperclip, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
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

type DatePreset =
  | 'Today'
  | 'Yesterday'
  | 'This week'
  | 'Last week'
  | 'This month'
  | 'Last month'
  | 'This year'
  | 'Last year'
  | 'Custom range';

type ExpenseFilterState = {
  datePreset?: DatePreset | null;
  categoryIds?: string[];
};

const DATE_PRESETS: DatePreset[] = [
  'Today',
  'Yesterday',
  'This week',
  'Last week',
  'This month',
  'Last month',
  'This year',
  'Last year',
  'Custom range',
];

const getPresetDateRange = (preset: DatePreset) => {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  switch (preset) {
    case 'Today':
      break;
    case 'Yesterday':
      start.setDate(now.getDate() - 1);
      end.setDate(now.getDate() - 1);
      break;
    case 'This week': {
      const day = now.getDay();
      const diff = day === 0 ? 6 : day - 1;
      start.setDate(now.getDate() - diff);
      break;
    }
    case 'Last week': {
      const day = now.getDay();
      const diff = day === 0 ? 6 : day - 1;
      start.setDate(now.getDate() - diff - 7);
      end.setDate(now.getDate() - diff - 1);
      break;
    }
    case 'This month':
      start.setDate(1);
      break;
    case 'Last month':
      start.setMonth(now.getMonth() - 1, 1);
      end.setDate(0);
      break;
    case 'This year':
      start.setMonth(0, 1);
      break;
    case 'Last year':
      start.setFullYear(now.getFullYear() - 1, 0, 1);
      end.setFullYear(now.getFullYear() - 1, 11, 31);
      break;
    default:
      break;
  }

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const parseDateInputValue = (dateValue: Date) => {
  const year = dateValue.getFullYear();
  const month = String(dateValue.getMonth() + 1).padStart(2, '0');
  const day = String(dateValue.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 350);
  const [filterOpen, setFilterOpen] = useState(false);

  const [appliedFilterState, setAppliedFilterState] =
    useState<ExpenseFilterState>({});
  const [draftFilters, setDraftFilters] = useState<ExpenseFilterState>({});
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);

  const defaultStart = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }, []);
  const defaultEnd = useMemo(() => new Date(), []);
  const [draftFromDate, setDraftFromDate] = useState(defaultStart);
  const [draftToDate, setDraftToDate] = useState(defaultEnd);

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
    categoryId: appliedFilterState.categoryIds?.length
      ? appliedFilterState.categoryIds.map((id) => Number(id))
      : undefined,
    startDate:
      appliedFilterState.datePreset && fromDate
        ? fromDate.toISOString()
        : undefined,
    endDate:
      appliedFilterState.datePreset && toDate
        ? toDate.toISOString()
        : undefined,
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
  const mergedCategories = useMemo(() => {
    const mergedMap = new Map<string, ExpenseFilterCategory>();

    categoryOptions.forEach((category) => {
      mergedMap.set(category.value, category);
    });
    availableApiCategories.forEach((category) => {
      const existing = mergedMap.get(category.value);
      mergedMap.set(category.value, {
        ...existing,
        ...category,
      });
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
      .map(([date, items]) => {
        const expenseDate = new Date(`${date}T00:00:00`);
        const title = expenseDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });

        return {
          date,
          title,
          items,
        };
      });
  }, [expenses]);

  const activeFilterLabel = useMemo(() => {
    const dateLabel = appliedFilterState.datePreset || 'All time';
    const selectedCount = appliedFilterState.categoryIds?.length || 0;

    if (selectedCount === 0) return dateLabel;
    if (selectedCount === 1) {
      const selectedCategoryId = appliedFilterState.categoryIds?.[0];
      const categoryName = mergedCategories.find(
        (category) => category.value === selectedCategoryId
      )?.label;
      return categoryName ? `${dateLabel} • ${categoryName}` : dateLabel;
    }

    return `${dateLabel} • ${selectedCount} categories`;
  }, [appliedFilterState, mergedCategories]);

  const handleOpenFilters = () => {
    setDraftFilters({
      datePreset: appliedFilterState.datePreset || null,
      categoryIds: appliedFilterState.categoryIds || [],
    });
    setDraftFromDate(fromDate || defaultStart);
    setDraftToDate(toDate || defaultEnd);
    setFilterOpen(true);
  };

  const toggleDraftCategory = (categoryId: string) => {
    setDraftFilters((prev) => {
      const currentValues = prev.categoryIds || [];
      const selected = currentValues.includes(categoryId);
      return {
        ...prev,
        categoryIds: selected
          ? currentValues.filter((value) => value !== categoryId)
          : [...currentValues, categoryId],
      };
    });
  };

  const handleSelectDatePreset = (preset: DatePreset) => {
    setDraftFilters((prev) => ({ ...prev, datePreset: preset }));
    if (preset === 'Custom range') return;

    const range = getPresetDateRange(preset);
    setDraftFromDate(range.start);
    setDraftToDate(range.end);
  };

  const applyFilters = () => {
    setAppliedFilterState({
      datePreset: draftFilters.datePreset || null,
      categoryIds: draftFilters.categoryIds?.length
        ? draftFilters.categoryIds
        : undefined,
    });
    setFromDate(draftFilters.datePreset ? draftFromDate : undefined);
    setToDate(draftFilters.datePreset ? draftToDate : undefined);
    setFilterOpen(false);
  };

  const resetFilters = () => {
    setDraftFilters({});
    setAppliedFilterState({});
    setFromDate(undefined);
    setToDate(undefined);
    setDraftFromDate(defaultStart);
    setDraftToDate(defaultEnd);
    setFilterOpen(false);
  };

  return (
    <aside
      className={cn(
        'rounded-lg border border-secondary-blue-500 bg-[#25282F] p-5 w-full xl:max-w-100 xl:sticky xl:top-17.5 xl:h-[calc(100vh-180px)] overflow-hidden',
        className
      )}
    >
      <div className="flex h-full min-h-0 flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[28px] leading-none font-semibold text-white">
            Expenses
          </h3>
          <Button
            type="button"
            variant="secondary"
            className="h-10 gap-2"
            onClick={handleOpenFilters}
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-primary-blue-100" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search expenses..."
            className="h-10 border-primary-blue-400 bg-primary-blue-400/20 pl-9 text-white"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          <div className="rounded-md border border-primary-blue-400/40 bg-primary-blue-400/10 px-2 py-1 text-[11px] text-primary-blue-100">
            Expense:{' '}
            <span className="font-semibold text-alert-red-400">
              {formatCurrency(summary.totalExpense)}
            </span>
          </div>
          <div className="rounded-md border border-primary-blue-400/40 bg-primary-blue-400/10 px-2 py-1 text-[11px] text-primary-blue-100">
            Income:{' '}
            <span className="font-semibold text-[#6BC160]">
              {formatCurrency(summary.totalIncome)}
            </span>
          </div>
          <div className="rounded-md border border-primary-blue-400/40 bg-primary-blue-400/10 px-2 py-1 text-[11px] text-primary-blue-100">
            Net:{' '}
            <span
              className={cn(
                'font-semibold',
                summary.netProfit >= 0 ? 'text-[#6BC160]' : 'text-alert-red-400'
              )}
            >
              {formatCurrency(summary.netProfit)}
            </span>
          </div>
        </div>

        <p className="text-right text-[11px] text-primary-blue-100">
          {activeFilterLabel}
        </p>

        {isLoading ? (
          <div className="space-y-2 pt-1">
            <Skeleton className="h-17.5 w-full rounded-lg" />
            <Skeleton className="h-17.5 w-full rounded-lg" />
            <Skeleton className="h-17.5 w-full rounded-lg" />
            <Skeleton className="h-17.5 w-full rounded-lg" />
          </div>
        ) : groupedExpenses.length === 0 ? (
          <ReportEmptyState
            className="rounded-xl border-primary-blue-400/40 bg-primary-blue-400/10 p-8"
            title="No expenses found"
            description="Add an expense to start tracking."
            titleClassName="text-base font-medium"
            descriptionClassName="mt-1"
          />
        ) : (
          <div className="flex-1 min-h-0 space-y-5 overflow-y-auto pr-1">
            {groupedExpenses.map((section) => (
              <div key={section.date} className="space-y-3">
                <h4 className="text-[20px] leading-none font-semibold text-white">
                  {section.title}
                </h4>
                <div className="space-y-3">
                  {section.items.map((expense) => {
                    const isExpense = (expense.type || 'expense') === 'expense';
                    const expenseTime = new Date(
                      expense.expenseDate
                    ).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    const categoryMeta = categories.find(
                      (category) => category.id === expense.expenseCategoryId
                    );
                    const categoryIcon =
                      categoryMeta?.icon?.trim() ||
                      expense.categoryName.slice(0, 1);
                    const categoryColor = categoryMeta?.color || '#6B7280';

                    return (
                      <button
                        type="button"
                        key={expense.id}
                        onClick={() => onEditExpense(expense)}
                        className="flex w-full items-center justify-between gap-2 rounded-lg border border-primary-blue-400/40 bg-primary-blue-400 p-3 text-left transition-colors hover:bg-primary-blue-400/60 cursor-pointer"
                      >
                        <div className="min-w-0 flex items-center gap-2.5">
                          <div
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-[#0A1020]"
                            style={{ backgroundColor: categoryColor }}
                          >
                            {categoryIcon}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-base font-medium text-white">
                              {expense.categoryName}
                            </p>
                            <p className="max-w-52 truncate text-sm text-primary-blue-100">
                              {expense.notes || 'No notes'}
                            </p>{' '}
                          </div>
                          {(expense.isFileAttached || expense.receiptPath) && (
                            <span className="rounded bg-primary-blue-400/50 px-1 py-0.5 text-white">
                              <Paperclip className="h-3 w-3" />
                            </span>
                          )}
                        </div>

                        <div className="text-right">
                          <div
                            className={cn(
                              'text-base font-semibold',
                              isExpense
                                ? 'text-alert-red-400'
                                : 'text-[#6BC160]'
                            )}
                          >
                            {isExpense ? '-' : '+'}
                            {formatCurrency(expense.amount)}
                          </div>
                          <p className="text-[11px] text-primary-blue-100">
                            {expenseTime}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
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

      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className="max-w-2xl border-secondary-blue-400 bg-secondary-blue-500 text-white">
          <DialogHeader>
            <DialogTitle>Filters</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-wide text-primary-blue-100">
                DATE RANGE
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setDraftFilters((prev) => ({ ...prev, datePreset: null }))
                  }
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-sm transition-colors',
                    !draftFilters.datePreset
                      ? 'border-primary-green-500 bg-primary-green-500/20 text-primary-green-500'
                      : 'border-primary-blue-400 text-primary-blue-100 hover:bg-primary-blue-400/20'
                  )}
                >
                  All time
                </button>
                {DATE_PRESETS.map((preset) => (
                  <button
                    type="button"
                    key={preset}
                    onClick={() => handleSelectDatePreset(preset)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-sm transition-colors',
                      draftFilters.datePreset === preset
                        ? 'border-primary-green-500 bg-primary-green-500/20 text-primary-green-500'
                        : 'border-primary-blue-400 text-primary-blue-100 hover:bg-primary-blue-400/20'
                    )}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {draftFilters.datePreset === 'Custom range' && (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <LabelWithIcon label="From" />
                  <Input
                    type="date"
                    value={parseDateInputValue(draftFromDate)}
                    onChange={(event) => {
                      const selectedDate = new Date(event.target.value);
                      selectedDate.setHours(0, 0, 0, 0);
                      setDraftFromDate(selectedDate);
                      setDraftFilters((prev) => ({
                        ...prev,
                        datePreset: 'Custom range',
                      }));
                    }}
                    className="h-11 border-primary-blue-400 bg-primary-blue-400/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <LabelWithIcon label="To" />
                  <Input
                    type="date"
                    value={parseDateInputValue(draftToDate)}
                    onChange={(event) => {
                      const selectedDate = new Date(event.target.value);
                      selectedDate.setHours(23, 59, 59, 999);
                      setDraftToDate(selectedDate);
                      setDraftFilters((prev) => ({
                        ...prev,
                        datePreset: 'Custom range',
                      }));
                    }}
                    className="h-11 border-primary-blue-400 bg-primary-blue-400/20 text-white"
                  />
                </div>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-wide text-primary-blue-100">
                CATEGORIES
              </p>
              <div className="max-h-60 space-y-2 overflow-y-auto rounded-lg border border-primary-blue-400/40 bg-primary-blue-400/10 p-3">
                {mergedCategories.length === 0 ? (
                  <p className="text-sm text-primary-blue-100">
                    No categories available.
                  </p>
                ) : (
                  mergedCategories.map((category) => {
                    const checked = (draftFilters.categoryIds || []).includes(
                      category.value
                    );

                    return (
                      <label
                        key={category.value}
                        className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 hover:bg-primary-blue-400/20"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() =>
                              toggleDraftCategory(category.value)
                            }
                          />
                          <span className="text-sm text-white">
                            {category.label}
                          </span>
                        </div>
                        {typeof category.count === 'number' && (
                          <span className="text-xs text-primary-blue-100">
                            {category.count}
                          </span>
                        )}
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-end gap-3">
            <Button type="button" variant="secondary" onClick={resetFilters}>
              Reset
            </Button>
            <Button type="button" onClick={applyFilters}>
              Apply filters
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  );
};

const LabelWithIcon = ({ label }: { label: string }) => (
  <div className="flex items-center gap-2 text-sm text-primary-blue-100">
    <Calendar className="h-4 w-4" />
    {label}
  </div>
);

export default ExpenseTracker;
