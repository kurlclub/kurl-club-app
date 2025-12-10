// Universal fee status
export type FeeStatus = 'paid' | 'unpaid' | 'partially_paid';

// Session payment detail types
export interface SessionDetail {
  sessionPaymentId: number;
  attendanceId: number | null;
  sessionDate: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  sessionRate: number;
  amountPaid: number;
  paymentDate: string | null;
  paymentMethod: string | null;
  paymentStatus: 'paid' | 'unpaid' | 'partially_paid';
  attendanceStatus: 'used' | 'unused';
  daysOverdue: number | null;
}

export interface SessionPaymentDetail {
  member: {
    id: number;
    name: string;
    memberIdentifier: string;
    sessionRate: number;
    planName: string;
  };
  summary: {
    totalSessions: number;
    unusedPrepaidSessions: number;
    usedSessions: number;
    pendingPaymentSessions: number;
    totalPaid: number;
    totalPending: number;
  };
  sessions: SessionDetail[];
}

export interface SessionPaymentDetailResponse {
  status: string;
  data: SessionPaymentDetail;
}

// Base member fields shared across all payment types
export interface BaseMember {
  memberId: number;
  memberName: string;
  memberIdentifier?: string;
  membershipPlanId: number;
  billingType: 'Recurring' | 'PerSession';
  profilePicture?: string;
  photoPath?: string;
}

// Recurring payment specific
export interface PaymentCycle {
  cycleId: number;
  startDate: string;
  endDate: string;
  dueDate: string;
  planFee: number;
  amountPaid: number;
  pendingAmount: number;
  cyclePaymentStatus: FeeStatus;
  bufferEndDate: string | null;
  totalBufferDays: number;
  bufferEligible: boolean;
  lastAmountPaid: number;
  lastAmountPaidDate: string;
}

export interface RecurringPaymentMember extends BaseMember {
  billingType: 'Recurring';
  currentCycle?: PaymentCycle;
  previousCycles?: PaymentCycle[];
  totalDebtCycles: number;
  totalDebtAmount: number;
  overallPaymentStatus: 'CurrentDue' | 'Overdue' | 'Completed' | 'NoCycles';
}

// Per-session payment specific
export interface SessionPayment {
  sessionId: number;
  sessionDate: string;
  sessionRate: number;
  amountPaid: number;
  pendingAmount: number;
  status: FeeStatus;
}

export interface SessionPaymentMember extends BaseMember {
  billingType: 'PerSession';
  membershipPlanName: string;
  sessions: {
    used: number;
    total: number;
  };
  paymentSummary: {
    paid: number;
    total: number;
    pending: number;
  };
  status: FeeStatus;
  package: string;
  sessionFee: number;
  customSessionRate: number;
  unpaidSessions: number;
  totalSessionDebt: number;
  sessionPayments: SessionPayment[];
}

// Union type for all payment members
export type MemberPaymentDetails =
  | RecurringPaymentMember
  | SessionPaymentMember;

// API Response types
export interface PaymentResponse {
  status: string;
  data: MemberPaymentDetails[];
}

export interface SessionPaymentResponse {
  status: string;
  message: string;
  data: SessionPaymentMember[];
}
