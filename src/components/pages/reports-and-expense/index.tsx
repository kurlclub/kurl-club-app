'use client';

import { Plus } from 'lucide-react';

import { StudioLayout } from '@/components/shared/layout';
import { Button } from '@/components/ui/button';
import { useSheet } from '@/hooks/use-sheet';

import AddExpense from './add-expense';
import ExpenseList from './expense-list';
import NetProfitBanner from './net-profit-banner';
import ProfitChart from './profit-chart';
import RevenueChart from './revenue-chart';

const ReportsAndExpenses = () => {
  const { isOpen, openSheet, closeSheet } = useSheet();

  return (
    <StudioLayout
      title="Reports and expenses"
      headerActions={
        <>
          <Button className="h-10" onClick={openSheet}>
            <Plus className="h-4 w-4" />
            Add expenses
          </Button>
          <AddExpense isOpen={isOpen} closeSheet={closeSheet} />
        </>
      }
    >
      <div className="flex gap-8 w-full justify-between relative">
        <div className="flex flex-col gap-6 w-full">
          <NetProfitBanner />
          <ProfitChart />
          <RevenueChart />
        </div>
        <ExpenseList />
      </div>
    </StudioLayout>
  );
};

export default ReportsAndExpenses;
