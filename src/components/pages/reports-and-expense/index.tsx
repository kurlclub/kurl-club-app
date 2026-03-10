import { Plus } from 'lucide-react';

import { StudioLayout } from '@/components/shared/layout';
import { Button } from '@/components/ui/button';

import ExpenseList from './expense-list';
import NetProfitBanner from './net-profit-banner';
import ProfitChart from './profit-chart';

const ReportsAndExpenses = () => {
  return (
    <StudioLayout
      title="Reports and expenses"
      headerActions={
        <Button className="h-10">
          <Plus className="h-4 w-4" />
          Add expenses
        </Button>
      }
    >
      <div className="flex gap-8 w-full justify-between relative">
        <div className="flex flex-col gap-6 w-full">
          <NetProfitBanner />
          <ProfitChart />
        </div>
        <ExpenseList />
      </div>
    </StudioLayout>
  );
};

export default ReportsAndExpenses;
