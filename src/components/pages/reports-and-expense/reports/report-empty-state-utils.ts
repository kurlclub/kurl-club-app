import { ReportsAndExpensesData } from '@/types/reports-and-expenses';

export const hasExpenseBreakdownData = (report: ReportsAndExpensesData) =>
  report.revenueBreakdown?.some((item) => item.amount !== 0) ?? false;

export const isRevenueFlowEmpty = (report: ReportsAndExpensesData) =>
  Object.values(report.revenueFlow).every((value) => value === 0);

export const isSummaryEmpty = (report: ReportsAndExpensesData) =>
  report.currentMemberCollections === 0 &&
  report.netProfit === 0 &&
  report.totalRevenue === 0 &&
  report.totalExpenses === 0 &&
  isRevenueFlowEmpty(report) &&
  !hasExpenseBreakdownData(report);
