import type { ExpenseType } from '@/types/reports-and-expenses';
import { formatExpenseDate } from '@/utils/date-utils';

import ExpenseCard from './expense-card';

const expenses: ExpenseType[] = [
  {
    category: 'Communications',
    description: 'Internet bill Internet bill Internet bill',
    amount: '-₹1200',
    time: '10:20 AM',
    date: new Date().toISOString().split('T')[0],
    role: 'Admin',
    attachments: 1,
  },
  {
    category: 'Staff Salaries',
    description: 'Trainer salary payout',
    amount: '-₹15000',
    time: '11:10 AM',
    date: new Date().toISOString().split('T')[0],
    role: 'Admin',
    attachments: 0,
  },
  {
    category: 'Food and Beverages',
    description: 'Protein shakes stock',
    amount: '-₹3200',
    time: '02:15 PM',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    role: 'Trainer',
    attachments: 1,
  },
  {
    category: 'Rent',
    description: 'Monthly gym rent',
    amount: '-₹45000',
    time: '03:00 PM',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    role: 'Admin',
    attachments: 1,
  },
  {
    category: 'Entertainment',
    description: 'Member challenge rewards',
    amount: '+₹5000',
    time: '05:10 PM',
    date: '2026-02-26',
    role: 'Staff',
    attachments: 0,
  },
  {
    category: 'Insurance',
    description: 'Health insurance premiums',
    amount: '-₹3200',
    time: '09:30 AM',
    date: '2024-02-26',
    role: 'Admin',
    attachments: 1,
  },
  {
    category: 'Communications',
    description: 'Phone system upgrade',
    amount: '-₹8500',
    time: '11:45 AM',
    date: '2024-02-26',
    role: 'Staff',
    attachments: 2,
  },
  {
    category: 'Staff Salaries',
    description: 'Monthly payroll',
    amount: '-₹125000',
    time: '04:20 PM',
    date: '2024-02-25',
    role: 'Admin',
    attachments: 3,
  },
  {
    category: 'Equipment Maintenance',
    description: 'Weight machine servicing',
    amount: '-₹1800',
    time: '02:30 PM',
    date: '2024-02-25',
    role: 'Staff',
    attachments: 1,
  },
  {
    category: 'Communications',
    description: 'Annual internet contract renewal',
    amount: '-₹25000',
    time: '10:00 AM',
    date: '2025-12-15',
    role: 'Admin',
    attachments: 2,
  },
  {
    category: 'Insurance',
    description: 'Annual liability insurance',
    amount: '-₹35000',
    time: '11:30 AM',
    date: '2025-11-20',
    role: 'Admin',
    attachments: 1,
  },
  {
    category: 'Rent',
    description: 'Annual property tax',
    amount: '-₹75000',
    time: '09:15 AM',
    date: '2025-10-10',
    role: 'Admin',
    attachments: 3,
  },
  {
    category: 'Equipment Maintenance',
    description: 'Major equipment overhaul',
    amount: '-₹45000',
    time: '02:00 PM',
    date: '2025-08-05',
    role: 'Staff',
    attachments: 4,
  },
];

const ExpenseList = () => {
  const groupedExpenses = expenses.reduce(
    (groups, expense) => {
      const date = expense.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(expense);
      return groups;
    },
    {} as Record<string, ExpenseType[]>
  );

  const sortedDates = Object.keys(groupedExpenses).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="p-5 rounded-lg border border-secondary-blue-500 bg-secondary-blue-500 flex flex-col gap-6 w-full max-w-[400px] sticky top-[70px] max-h-[calc(100vh-100px)] overflow-y-auto">
      {sortedDates.map((date) => (
        <div key={date} className="flex flex-col gap-4">
          <span className="font-medium text-[18px]">
            {formatExpenseDate(date)}
          </span>

          <div className="flex flex-col gap-3">
            {groupedExpenses[date].map((expense, index) => (
              <ExpenseCard key={`${date}-${index}`} {...expense} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExpenseList;
