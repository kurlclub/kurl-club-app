import { safeParseDate } from '@/lib/utils';
import type {
  OverallPaymentStatus,
  PaymentCycle,
  RecurringPaymentMember,
} from '@/types/payment';

export type ApiRecurringPaymentCycle = Omit<
  PaymentCycle,
  'lastAmountPaid' | 'lastAmountPaidDate'
> & {
  lastAmountPaid?: number | null;
  lastAmountPaidDate?: string | null;
};

export type ApiRecurringPaymentMember = {
  memberId: number;
  memberName: string;
  memberIdentifier?: string;
  membershipPlanId: number;
  membershipPlanName?: string;
  billingType: 'Recurring';
  profilePicture?: string;
  photoPath?: string | null;
  currentCycle?: ApiRecurringPaymentCycle | null;
  advanceCycle?: ApiRecurringPaymentCycle | null;
  previousCycles?: ApiRecurringPaymentCycle[] | null;
  totalDebtCycles: number;
  totalDebtAmount: number;
  hasAdvancePayment?: boolean;
  advancePaidAmount?: number;
  paymentStatus?: OverallPaymentStatus;
  overallPaymentStatus?: OverallPaymentStatus;
};

export const normalizeRecurringPaymentCycle = (
  cycle?: ApiRecurringPaymentCycle | null
): PaymentCycle | undefined => {
  if (!cycle) return undefined;

  return {
    ...cycle,
    lastAmountPaid: cycle.lastAmountPaid ?? null,
    lastAmountPaidDate: cycle.lastAmountPaidDate ?? null,
  };
};

export const normalizeRecurringPaymentStatus = ({
  overallPaymentStatus,
  paymentStatus,
}: Pick<
  ApiRecurringPaymentMember,
  'overallPaymentStatus' | 'paymentStatus'
>): OverallPaymentStatus => overallPaymentStatus ?? paymentStatus ?? 'NoCycles';

export const normalizeRecurringPaymentMember = (
  member: ApiRecurringPaymentMember
): RecurringPaymentMember => {
  const {
    currentCycle,
    previousCycles,
    photoPath,
    overallPaymentStatus,
    paymentStatus,
    ...rest
  } = member;

  return {
    ...rest,
    photoPath: photoPath ?? undefined,
    currentCycle: normalizeRecurringPaymentCycle(currentCycle),
    advanceCycle: normalizeRecurringPaymentCycle(member.advanceCycle) ?? null,
    previousCycles: (previousCycles ?? [])
      .map((cycle) => normalizeRecurringPaymentCycle(cycle))
      .filter((cycle): cycle is PaymentCycle => Boolean(cycle)),
    overallPaymentStatus: normalizeRecurringPaymentStatus({
      overallPaymentStatus,
      paymentStatus,
    }),
  };
};

export const getRecurringFullSettlementAmount = (
  member?: Pick<
    RecurringPaymentMember,
    'totalDebtAmount' | 'currentCycle'
  > | null
): number =>
  member?.totalDebtAmount || member?.currentCycle?.pendingAmount || 0;

export const getRecurringDisplayCycle = (
  member?: Pick<
    RecurringPaymentMember,
    'currentCycle' | 'previousCycles' | 'overallPaymentStatus'
  > | null
): PaymentCycle | undefined => {
  if (!member?.currentCycle) return undefined;

  if (member.overallPaymentStatus !== 'Overdue') {
    return member.currentCycle;
  }

  const unsettledCycles = [
    member.currentCycle,
    ...(member.previousCycles ?? []),
  ]
    .filter((cycle): cycle is PaymentCycle => Boolean(cycle))
    .filter((cycle) => cycle.cyclePaymentStatus !== 'paid');

  if (unsettledCycles.length === 0) {
    return member.currentCycle;
  }

  return unsettledCycles.reduce((oldestCycle, cycle) => {
    const oldestDate = safeParseDate(oldestCycle.dueDate);
    const cycleDate = safeParseDate(cycle.dueDate);

    if (!oldestDate) return cycle;
    if (!cycleDate) return oldestCycle;

    return cycleDate.getTime() < oldestDate.getTime() ? cycle : oldestCycle;
  });
};

export const getRecurringDisplayDueDate = (
  member?: Pick<
    RecurringPaymentMember,
    'currentCycle' | 'previousCycles' | 'overallPaymentStatus'
  > | null
): string | undefined => getRecurringDisplayCycle(member)?.dueDate;

export interface RecurringPaymentSummary {
  amountPaid: number;
  totalBilled: number;
  pendingAmount: number;
  progress: number; // 0–100
}

export const getRecurringPaymentSummary = (
  member?: Pick<
    RecurringPaymentMember,
    | 'currentCycle'
    | 'previousCycles'
    | 'overallPaymentStatus'
    | 'totalDebtAmount'
  > | null
): RecurringPaymentSummary | undefined => {
  if (!member?.currentCycle) return undefined;

  // Non-overdue: the current cycle is the whole story.
  if (member.overallPaymentStatus !== 'Overdue') {
    const { amountPaid, planFee, pendingAmount } = member.currentCycle;
    const progress =
      planFee > 0 ? Math.min((amountPaid / planFee) * 100, 100) : 0;
    return { amountPaid, totalBilled: planFee, pendingAmount, progress };
  }

  // Overdue: aggregate across every unsettled cycle so the row reflects the
  // member's full outstanding debt, not just the current cycle.
  const unsettledCycles = [
    member.currentCycle,
    ...(member.previousCycles ?? []),
  ]
    .filter((cycle): cycle is PaymentCycle => Boolean(cycle))
    .filter((cycle) => cycle.cyclePaymentStatus !== 'paid');

  const amountPaid = unsettledCycles.reduce(
    (sum, cycle) => sum + (cycle.amountPaid ?? 0),
    0
  );
  const pendingAmount =
    member.totalDebtAmount ||
    unsettledCycles.reduce((sum, cycle) => sum + (cycle.pendingAmount ?? 0), 0);
  // PaymentCycle carries no discountAmount; totalDebtAmount already nets out
  // discounts, so deriving billed from paid + pending keeps the bar coherent.
  const totalBilled = amountPaid + pendingAmount;
  const progress =
    totalBilled > 0 ? Math.min((amountPaid / totalBilled) * 100, 100) : 0;

  return { amountPaid, totalBilled, pendingAmount, progress };
};
