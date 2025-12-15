export type ApiResponse<T = void> = {
  status: string;
  message?: string;
  data?: T;
  error?: string;
};

// Re-export common types
export type { BillingType, FeeStatus } from './payment';

// Dashboard types
export type OutstandingPayments = {
  memberId: number;
  memberIdentifier: string;
  memberName: string;
  photoPath?: string | null;
  package: string;
  feeStatus: 'paid' | 'partially_paid' | 'unpaid';
  amount: number;
};

export type Skippers = {
  memberId: number;
  memberIdentifier: string;
  memberName: string;
  photoPath: string | null;
  lastCheckIn: string;
  daysSinceLastCheckIn: number;
};
