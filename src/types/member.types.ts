// ----------------------------------------------------------------------------
// ENUMS & CONSTANTS
// ----------------------------------------------------------------------------

export type BillingType = 'Recurring' | 'PerSession';
export type FeeStatus = 'paid' | 'unpaid' | 'partially_paid';
export type Gender = 'male' | 'female' | 'other';
export type BloodGroup =
  | 'A+'
  | 'A-'
  | 'B+'
  | 'B-'
  | 'O+'
  | 'O-'
  | 'AB+'
  | 'AB-';
export type IdType = 'aadhaar' | 'passport' | 'driving_license' | 'voter_id';
export type FitnessGoal =
  | 'weight_loss'
  | 'muscle_gain'
  | 'health_wellness'
  | 'endurance'
  | 'flexibility';
export type EmergencyRelation =
  | 'parent'
  | 'spouse'
  | 'sibling'
  | 'friend'
  | 'other';
export type MemberStatus =
  | 'Active'
  | 'Outstanding'
  | 'Overdue'
  | 'NoCycles'
  | 'Expired';
export type OnboardingStatus = 'Pending' | 'Approved' | 'Rejected';

// ----------------------------------------------------------------------------
// BASE TYPES
// ----------------------------------------------------------------------------

export interface MembershipPlan {
  planId: number;
  planName: string;
  billingType: BillingType;
  fee: number;
  durationInDays: number;
  details?: string;
}

export interface PaymentCycleInfo {
  cycleId: number;
  startDate: string;
  endDate: string;
  planFee: number;
  amountPaid: number;
  pendingAmount: number;
  status: FeeStatus;
}

export interface SessionPaymentInfo {
  totalSessions: number;
  paidSessions: number;
  unpaidSessions: number;
  totalPaid: number;
  totalPending: number;
  sessionRate: number;
  customRate: number;
  planDefaultRate: number;
  recentUnpaidSessions: Array<{
    attendanceId: number | null;
    sessionDate: string;
    sessionRate: number;
    daysOverdue: number;
  }>;
}

// ----------------------------------------------------------------------------
// MEMBER LIST TYPES
// ----------------------------------------------------------------------------

export interface MemberListItem {
  id: number;
  memberIdentifier: string;
  name: string;
  dob: string;
  bloodGroup: BloodGroup;
  gender: Gender;
  phone: string;
  email: string | null;
  feeStatus: FeeStatus;
  createdAt: string;
  modifiedAt: string;
  doj: string;
  package: string;
  packageId: number;
  status: MemberStatus;
  photoPath: string | null;
  profilePicture?: string | File | null;
  personalTrainer?: number;
  workoutPlan?: string;
  avatar?: string;
}

export interface MemberListFilters {
  search: string | null;
  feeStatus: string | null;
  package: string | null;
  gender: string | null;
  sortBy: string | null;
  sortOrder: 'asc' | 'desc';
}

export interface MemberListAvailableFilters {
  feeStatuses: Array<{ value: string; count: number }>;
  packages: Array<{ value: string; label: string; count: number }>;
  genders: Array<{ value: string; count: number }>;
  sortOptions: string[];
  sortOrders: ['asc', 'desc'];
}

export interface MemberListPagination {
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface MemberListResponse {
  status: string;
  data: MemberListItem[];
  appliedFilters: MemberListFilters;
  availableFilters: MemberListAvailableFilters;
  pagination: MemberListPagination;
}

// ----------------------------------------------------------------------------
// MEMBER DETAILS TYPES
// ----------------------------------------------------------------------------

export interface MemberDetails {
  id: number;
  memberIdentifier: string;
  name: string;
  dob: string;
  bloodGroup: BloodGroup;
  gender: Gender;
  membershipPlanId: number;
  membershipPlan: MembershipPlan;
  feeStatus: FeeStatus;
  doj: string;
  phone: string;
  email: string | null;
  height: number;
  weight: number;
  personalTrainer: number;
  fullAddress: string;
  workoutPlan: number;
  daysRemaining: number;
  bufferDaysRemaining: number | null;
  perSessionRate: number | null;
  idNumber: string;
  fitnessGoal: FitnessGoal;
  medicalHistory: string;
  idType: IdType;
  photoPath: string | null;
  idCopyPath: string | File | null;
  profilePicture?: string | File | null;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: EmergencyRelation;
  onboardingId: number | null;
  sessionPaymentInfo: SessionPaymentInfo | null;
  paymentCycleInfo: PaymentCycleInfo | null;
}

export interface MemberDetailsResponse {
  status: string;
  data: MemberDetails;
}

// ----------------------------------------------------------------------------
// MEMBER CREATION TYPES
// ----------------------------------------------------------------------------

export interface MemberCreationPayload {
  // Profile
  ProfilePicture?: File;
  Name: string;
  Dob: string;
  DOJ: string;
  BloodGroup: BloodGroup;
  Gender: Gender;
  Phone: string;
  Email?: string;
  Height: number;
  Weight: number;
  Address: string;

  // Membership
  MembershipPlanId: number;
  FeeStatus: FeeStatus;
  PersonalTrainer: number;
  WorkoutPlanId?: number;

  // Payment (for Recurring)
  AmountPaid?: number;
  ModeOfPayment?: number;

  // Payment (for PerSession)
  PerSessionRate?: number;
  NumberOfSessions?: number;

  // Identity
  IdType: IdType;
  IdNumber: string;
  IdCopyFile?: File;

  // Health
  FitnessGoal: FitnessGoal;
  MedicalHistory?: string;

  // Emergency
  EmergencyContactName: string;
  EmergencyContactPhone: string;
  EmergencyContactRelation: EmergencyRelation;

  // System
  GymId: number;
}

export interface MemberCreationResponse {
  status: string;
  message: string;
  data: {
    id: number;
    memberIdentifier: string;
    name: string;
    membershipPlanId: number;
    billingType: BillingType;
    perSessionRate: number | null;
    hasProfilePicture: boolean;
    photoPath: string | null;
    idCopyPath: string | null;
    paymentId: number;
    paymentAmount: number;
    gymId: number;
    package: number;
    cycleId: number | null;
    cycleStatus: FeeStatus | null;
    numberOfSessionsPrepaid: number | null;
    isOnboardingApproval: boolean;
    notifications: {
      whatsAppSent: boolean;
      emailQueued: boolean;
    };
  };
}

// ----------------------------------------------------------------------------
// MEMBER UPDATE TYPES
// ----------------------------------------------------------------------------

export interface MemberUpdatePayload {
  // Existing data
  id: number;
  memberIdentifier: string;
  PhotoPath?: string;
  IdCopyPath?: string;

  // Profile
  ProfilePicture?: File;
  name: string;
  dob: string;
  bloodGroup: BloodGroup;
  gender: Gender;
  phone: string;
  email?: string;
  height: number;
  weight: number;
  address: string;

  // Membership
  membershipPlanId: number;
  feeStatus: FeeStatus;
  doj: string;
  personalTrainer: number;
  workoutPlanId?: number;

  // Identity
  idType: IdType;
  idNumber: string;
  IdCopyFile?: File;

  // Health
  fitnessGoal: FitnessGoal;
  medicalHistory?: string;

  // Emergency
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: EmergencyRelation;

  // System fields (read-only, sent back)
  daysRemaining?: number;
  bufferDaysRemaining?: number;
  membershipPlan?: string;
  paymentCycleInfo?: string;
}

export interface MemberUpdateResponse {
  status: string;
  message: string;
  data: {
    id: number;
    memberIdentifier: string;
    name: string;
    membershipPlanId: number;
    membershipPlan: string;
    workoutPlanId: number | null;
    personalTrainer: number;
    feeStatus: FeeStatus;
    perSessionRate: number | null;
    hasProfilePicture: boolean;
    photoPath: string | null;
    idCopyPath: string | null;
    membershipPlanChanged: boolean;
  };
}

// ----------------------------------------------------------------------------
// MEMBER DELETE TYPES
// ----------------------------------------------------------------------------

export interface MemberDeleteResponse {
  status: string;
  message: string;
}

// ----------------------------------------------------------------------------
// ONBOARDING TYPES
// ----------------------------------------------------------------------------

export interface OnboardingMember {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  gender: Gender;
  dob: string;
  height: number;
  weight: number;
  bloodGroup: BloodGroup;
  address: string;
  idNumber: string;
  fitnessGoal: FitnessGoal;
  medicalHistory: string;
  idType: IdType;
  photoPath: string | null;
  idCopyPath: string | null;
  profilePicture?: string | File | null;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: EmergencyRelation;
  status: OnboardingStatus;
  submittedAt: string;
  daysSinceSubmission: number;
}

export interface OnboardingMemberListResponse {
  status: string;
  count: number;
  data: OnboardingMember[];
}

export interface OnboardingMemberDetails extends OnboardingMember {
  gymName: string;
}

export interface OnboardingMemberDetailsResponse {
  status: string;
  data: OnboardingMemberDetails;
}

export interface OnboardingRejectResponse {
  status: string;
  message: string;
  data: {
    onboardId: number;
    name: string;
    phone: string;
    filesDeleted: string[];
    fileErrors: string | null;
  };
}

// ----------------------------------------------------------------------------
// FORM OPTIONS TYPES
// ----------------------------------------------------------------------------

export interface Trainer {
  id: number;
  trainerId: string;
  trainerName: string;
  email: string;
  phone: string;
  uuid: string;
}

export interface WorkoutPlan {
  id: number;
  name: string;
  isDefault: boolean;
}

export interface CertificateOption {
  id: number;
  name: string;
}

export interface GenderOption {
  id: number;
  name: string;
}

export interface PackageOption {
  id: number;
  name: string;
}

export interface FeeStatusOption {
  id: number;
  value: string;
}

export interface BloodGroupOption {
  id: number;
  name: string;
}

export interface GymFormData {
  trainers: Trainer[];
  workoutPlans: WorkoutPlan[];
  membershipPlans: MembershipPlan[];
  certificatesOptions: CertificateOption[];
  genderOptions: GenderOption[];
  packageOptions: PackageOption[];
  feeStatusOptions: FeeStatusOption[];
  bloodGroupOptions: BloodGroupOption[];
}

export interface GymFormDataResponse {
  success: boolean;
  data: GymFormData;
  message: string;
}

// ----------------------------------------------------------------------------
// QUERY FILTER TYPES (for React Query)
// ----------------------------------------------------------------------------

export interface MemberQueryFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  feeStatus?: string;
  package?: string;
  gender?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ----------------------------------------------------------------------------
// UTILITY TYPES
// ----------------------------------------------------------------------------

export type MemberFormData = Omit<
  MemberDetails,
  'id' | 'memberIdentifier' | 'createdAt' | 'modifiedAt'
>;

export type MemberEditableFields = Partial<MemberDetails>;
