export type Member = {
  id: string;
  gymNo: string;
  gymId?: string;
  name: string;
  avatar: string;
  package: 'Monthly' | 'Yearly' | 'Special' | 'Quarterly' | 'Half_Yearly';
  feeStatus: 'paid' | 'partially_paid' | 'unpaid';
  email: string;
  phone: string;
  bloodGroup: string;
  gender?: string;
  dob?: string;
  doj?: string;
  workoutPlan?: string;
  memberIdentifier?: string;
  profilePicture: string | File | null;
  photoPath?: string;
  createdAt: string;
  personalTrainer?: string | number;
};

export type MembershipPlan = {
  planId: number;
  planName: string;
  billingType: 'Recurring' | 'PerSession';
  fee: number;
  durationInDays: number;
};

export type PaymentCycleInfo = {
  cycleId: number;
  startDate: string;
  endDate: string;
  planFee: number;
  amountPaid: number;
  pendingAmount: number;
  status: string;
};

export type SessionPaymentInfo = {
  totalSessions: number;
  completedSessions: number;
  pendingSessions: number;
  sessionRate: number;
  totalAmountPaid: number;
  totalPendingAmount: number;
};

export type MemberDetails = {
  id: number;
  memberIdentifier: string;
  name: string;
  dob: string;
  bloodGroup: string;
  gender?: string;
  package: string;
  feeStatus: string;
  doj: string;
  phone: string;
  email: string;
  height: number;
  weight: number;
  personalTrainer: number;
  membershipPlanId: number;
  membershipPlan?: MembershipPlan;
  fullAddress: string;
  workoutPlan: number;
  profilePicture: string | File | null;
  perSessionRate?: number | null;
  photoPath?: string;
  idCopyPath?: string | File | null;
  address?: string;
  idType?: string;
  idNumber?: string;
  fitnessGoal?: string;
  medicalHistory?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  onboardingId?: number;
  sessionPaymentInfo?: SessionPaymentInfo | null;
  paymentCycleInfo?: PaymentCycleInfo | null;
  daysRemaining?: number;
  bufferDaysRemaining?: number;
};

export type WorkoutPlan = 'Weight loss' | 'Muscle gain' | 'General fitness';
export type BloodGroup =
  | 'A+'
  | 'B+'
  | 'O+'
  | 'AB+'
  | 'A-'
  | 'B-'
  | 'O-'
  | 'AB-';
export type Trainer = 'Hafiz' | 'John' | 'Sarah';

export interface EditableSectionProps {
  isEditing: boolean;
  details: MemberDetails | null;
  onUpdate: <K extends keyof MemberDetails>(
    key: K,
    value: MemberDetails[K]
  ) => void;
}
