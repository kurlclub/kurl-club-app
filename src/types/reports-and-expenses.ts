export interface ReportRevenueFlow {
  memberships: number;
  perSession: number;
  joiningFees: number;
  otherCollection: number;
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
  revenueBreakdown: ReportBreakdownItem[];
}
