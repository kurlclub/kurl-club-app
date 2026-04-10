export type SubscriptionPlanStatus = 'active' | 'expiring' | 'expired';
export type BillingCycle = 'monthly' | 'sixMonths' | 'yearly';

export interface SubscriptionLimits {
  maxClubs: number | null;
  maxMembers: number | null;
  maxTrainers: number | null;
  maxStaffs: number | null;
  maxMembershipPlans: number | null;
  maxWorkoutPlans: number | null;
  maxLeadsPerMonth: number | null;
}

export interface SubscriptionStudioDashboardFeatures {
  enabled: boolean;
  paymentInsights: boolean;
  skipperStats: boolean;
  attendanceStats: boolean;
}

export interface SubscriptionAttendanceFeatures {
  manual: boolean;
  automatic: boolean;
  memberInsights: boolean;
  deviceManagement: boolean;
}

export interface SubscriptionProgramsFeatures {
  membershipPlans: boolean;
  workoutPlans: boolean;
}

export interface SubscriptionStaffManagementFeatures {
  activityTracking: boolean;
  staffLogin: boolean;
}

export interface SubscriptionExpensesFeatures {
  reportsDashboard: boolean;
  expenseManagement: boolean;
}

export interface SubscriptionHelpAndSupportFeatures {
  ticketingPortal: boolean;
  whatsApp: boolean;
  email: boolean;
  call: boolean;
}

export interface SubscriptionWhatsAppNotificationFeatures {
  paymentReminders: boolean;
  membershipExpiry: boolean;
  lowAttendance: boolean;
  specialDays: boolean;
}

export interface SubscriptionInvoiceFeatures {
  customTemplates: boolean;
}

export interface SubscriptionNotificationFeatures {
  realtime: boolean;
  whatsApp: boolean;
  email: boolean;
  push: boolean;
}

export interface SubscriptionPlanFeatures {
  studioDashboard: SubscriptionStudioDashboardFeatures;
  memberManagement: boolean;
  paymentManagement: boolean;
  attendance: SubscriptionAttendanceFeatures;
  leadsManagement: boolean;
  programs: SubscriptionProgramsFeatures;
  staffManagement: SubscriptionStaffManagementFeatures;
  payrollManagement: boolean;
  expenses: SubscriptionExpensesFeatures;
  helpAndSupport: SubscriptionHelpAndSupportFeatures;
  whatsAppNotifications: SubscriptionWhatsAppNotificationFeatures;
  invoice: SubscriptionInvoiceFeatures;
  notifications: SubscriptionNotificationFeatures;
}

export interface SubscriptionPlanEntitlement {
  subscriptionId: number | null;
  id: number;
  name: string;
  subtitle: string;
  description: string;
  descriptionPlainText: string;
  iconUrl: string | null;
  monthlyPrice: number;
  sixMonthsPrice: number;
  yearlyPrice: number;
  badge?: string | null;
  isActive: boolean;
  status?: SubscriptionPlanStatus | null; // Optional - calculated on frontend if missing
  billingCycle: BillingCycle | null;
  currency: string | null;
  billingAmount: number | null;
  subscriptionDate: string | null;
  startDate: string | null;
  endDate: string | null;
  nextBillingDate: string | null;
  daysRemaining: number | null;
  cancelAtPeriodEnd: boolean;
  limits: SubscriptionLimits;
  features: SubscriptionPlanFeatures;
}

export type SubscriptionAccessKey =
  | 'memberManagement'
  | 'paymentTracking'
  | 'attendanceTracking'
  | 'manualAttendance'
  | 'liveAttendance'
  | 'staffManagement'
  | 'membershipManagement'
  | 'basicReports'
  | 'leadManagement'
  | 'emailSupport'
  | 'chatSupport'
  | 'phoneSupport'
  | 'reportsAnalytics'
  | 'realTimeNotifications'
  | 'whatsAppNotifications';

// Compatibility alias while the app migrates away from the old flat feature vocabulary.
export type SubscriptionFeatureKey = SubscriptionAccessKey;

export type SubscriptionLimitKey = keyof SubscriptionLimits;
export type UsageLimits = SubscriptionLimits;

export interface SubscriptionCatalogFeatures {
  [key: string]: boolean | number | SubscriptionCatalogFeatures;
}

export type SubscriptionCatalogPlan = {
  id: number;
  name: string;
  subtitle?: string;
  description?: string;
  monthlyPrice: number;
  sixMonthsPrice: number;
  yearlyPrice: number;
  isPopular?: boolean;
  badge?: string;
  limits: SubscriptionLimits;
  features: SubscriptionCatalogFeatures;
  tier?: string;
  status?: SubscriptionPlanStatus;
};

export const DEFAULT_SUBSCRIPTION_LIMITS: SubscriptionLimits = {
  maxClubs: null,
  maxMembers: null,
  maxTrainers: null,
  maxStaffs: null,
  maxMembershipPlans: null,
  maxWorkoutPlans: null,
  maxLeadsPerMonth: null,
};

export const DEFAULT_SUBSCRIPTION_PLAN_FEATURES: SubscriptionPlanFeatures = {
  studioDashboard: {
    enabled: false,
    paymentInsights: false,
    skipperStats: false,
    attendanceStats: false,
  },
  memberManagement: false,
  paymentManagement: false,
  attendance: {
    manual: false,
    automatic: false,
    memberInsights: false,
    deviceManagement: false,
  },
  leadsManagement: false,
  programs: {
    membershipPlans: false,
    workoutPlans: false,
  },
  staffManagement: {
    activityTracking: false,
    staffLogin: false,
  },
  payrollManagement: false,
  expenses: {
    reportsDashboard: false,
    expenseManagement: false,
  },
  helpAndSupport: {
    ticketingPortal: false,
    whatsApp: false,
    email: false,
    call: false,
  },
  whatsAppNotifications: {
    paymentReminders: false,
    membershipExpiry: false,
    lowAttendance: false,
    specialDays: false,
  },
  invoice: {
    customTemplates: false,
  },
  notifications: {
    realtime: false,
    whatsApp: false,
    email: false,
    push: false,
  },
};
