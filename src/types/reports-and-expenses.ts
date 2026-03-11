export interface ReportRevenueFlow {
  memberships: number;
  perSession: number;
  otherMemberCollections: number;
  otherIncome: number;
}

export interface ReportBreakdownItem {
  name: string;
  amount: number;
  color: string;
}

export interface ReportsAndExpensesData {
  currentMemberCollections: number;
  netProfit: number;
  totalRevenue: number;
  totalExpenses: number;
  revenueTrendPercentage: number;
  expenseTrendPercentage: number;
  revenueFlow: ReportRevenueFlow;
  expenseBreakdown: ReportBreakdownItem[];
}
