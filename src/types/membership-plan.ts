import type { BillingType } from './payment';

export interface MembershipPlan {
  membershipPlanId: number;
  gymId: number;
  planName: string;
  details: string;
  fee: number | string;
  durationInDays: number | string;
  isActive: boolean;
  billingType: BillingType;
  defaultSessionRate?: number;
}
