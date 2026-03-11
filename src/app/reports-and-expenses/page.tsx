import type { Metadata } from 'next';

import ReportsAndExpenses from '@/components/pages/reports-and-expense';

export const metadata: Metadata = {
  title: 'Reports & Expenses',
  description: 'View reports and manage expenses for your gym',
};

export default function ReportsAndExpensesPage() {
  return <ReportsAndExpenses />;
}
