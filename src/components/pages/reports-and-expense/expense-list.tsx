import {
  ReportBreakdownItem,
  ReportsAndExpensesData,
} from '@/types/reports-and-expenses';
import { formatCurrency } from '@/utils/format-currency';

import ExpenseCard from './expense-card';

interface ExpenseListProps {
  expenseBreakdown: ReportsAndExpensesData['expenseBreakdown'];
  totalExpenses: number;
}

const getPercentage = (amount: number, totalExpenses: number) => {
  if (!totalExpenses) return 0;
  return (amount / totalExpenses) * 100;
};

const ExpenseList = ({ expenseBreakdown, totalExpenses }: ExpenseListProps) => {
  const sortedExpenses = [...expenseBreakdown].sort(
    (first: ReportBreakdownItem, second: ReportBreakdownItem) =>
      second.amount - first.amount
  );

  return (
    <aside className="p-5 rounded-lg border border-secondary-blue-500 bg-secondary-blue-500 flex flex-col gap-5 w-full xl:max-w-[400px] xl:sticky xl:top-[70px] h-fit">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium text-[18px] text-white">
            Expense categories
          </h3>
          <p className="text-sm text-primary-blue-100 mt-1">
            Spend distribution from the report API.
          </p>
        </div>

        <div className="rounded-xl bg-primary-blue-400 px-3 py-2 text-right">
          <div className="text-[11px] uppercase tracking-[0.08em] text-primary-blue-100">
            Total
          </div>
          <div className="text-[16px] font-semibold text-white">
            {formatCurrency(totalExpenses)}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 max-h-[calc(100vh-180px)] overflow-y-auto pr-1">
        {sortedExpenses.map((expense) => (
          <ExpenseCard
            key={expense.name}
            {...expense}
            share={getPercentage(expense.amount, totalExpenses)}
          />
        ))}
      </div>
    </aside>
  );
};

export default ExpenseList;
