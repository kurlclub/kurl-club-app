export interface PaymentResponse {
  status: string;
  data: MemberPaymentDetails[];
}

export interface PaymentCycle {
  cycleId: number;
  startDate: string;
  endDate: string;
  dueDate: string;
  planFee: number;
  amountPaid: number;
  pendingAmount: number;
  status: 'Pending' | 'Completed' | 'Partial' | 'Debt';
  bufferEndDate: string | null;
  totalBufferDays: number;
  bufferEligible: boolean;
  lastAmountPaid: number;
  lastAmountPaidDate: string;
}

export interface SessionPayment {
  sessionId: number;
  attendanceId: number;
  memberId: number;
  sessionDate: string;
  sessionRate: number;
  amountPaid: number;
  pendingAmount: number;
  status: 'Paid' | 'Pending' | 'Partial';
  paymentDate?: string;
}

export interface MemberPaymentDetails {
  memberId: number;
  memberName: string;
  membershipPlanId: number;
  billingType: 'Recurring' | 'PerSession';
  profilePicture?: string;
  photoPath?: string;
  // For Recurring billing
  currentCycle?: PaymentCycle;
  previousCycles?: PaymentCycle[];
  totalDebtCycles?: number;
  totalDebtAmount?: number;
  // For PerSession billing
  sessionPayments?: SessionPayment[];
  unpaidSessions?: number;
  totalSessionDebt?: number;
  customSessionRate?: number;
  // Common fields
  memberStatus: 'Outstanding' | 'Expired' | 'Completed' | 'Debts';
  memberIdentifier?: string;
}
