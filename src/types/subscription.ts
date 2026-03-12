export type SubscriptionPlanStatus = 'active' | 'expired' | 'cancelled';
export type BillingCycle = 'monthly' | 'sixMonths' | 'yearly';

export type SubscriptionFeatures = {
  emailNotifications: boolean;
  whatsAppNotifications: boolean;
  manualAttendance: boolean;
  liveAttendance: boolean;
  doorAccessAttendance: boolean;
  devicesPerUserLimit: number;
  staffLoginLimit: number;
  trainerLoginLimit: number;
  memberManagement: boolean;
  trainerManagement: boolean;
  staffManagement: boolean;
  membershipManagement: boolean;
  paymentTracking: boolean;
  memberPortal: boolean;
  qrCodeCheckIn: boolean;
  basicDashboard: boolean;
  invoiceGeneration: boolean;
  expenseTracker: boolean;
  leadManagement: boolean;
  attendanceTracking: boolean;
  offersDiscounts: boolean;
  roleBasedAccess: boolean;
  trainerPortal: boolean;
  ptCollections: boolean;
  commissionTracking: boolean;
  basicReports: boolean;
  revenueAnalytics: boolean;
  advancedAnalytics: boolean;
  exportToExcel: boolean;
  customReports: boolean;
  emailSupport: boolean;
  chatSupport: boolean;
  phoneSupport: boolean;
  prioritySupport: boolean;
  prioritySupport24x7: boolean;
  reportsAnalytics: boolean;
  classScheduling: boolean;
  mobileAppAccess: boolean;
  customBranding: boolean;
  realTimeNotifications: boolean;
  paymentRecording: boolean;
};

export type SubscriptionFeatureKey = keyof SubscriptionFeatures;

export type UsageLimits = {
  maxClubs: number;
  maxMembers: number;
  maxTrainers: number;
  maxStaffs: number;
};

export type SubscriptionPlanInfo = {
  id: number;
  name: string;
  tier: string;
  status: SubscriptionPlanStatus;
};

export type UserSubscription = {
  plan: SubscriptionPlanInfo;
  subscriptionId: number;
  billingCycle: BillingCycle;
  startDate: string;
  endDate: string;
  usageLimits: UsageLimits;
  features: SubscriptionFeatures;
};

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
  limits: UsageLimits;
  features: SubscriptionFeatures;
  tier?: string;
  status?: SubscriptionPlanStatus;
};

export const DEFAULT_SUBSCRIPTION_FEATURES: SubscriptionFeatures = {
  emailNotifications: false,
  whatsAppNotifications: false,
  manualAttendance: false,
  liveAttendance: false,
  doorAccessAttendance: false,
  devicesPerUserLimit: 0,
  staffLoginLimit: 0,
  trainerLoginLimit: 0,
  memberManagement: false,
  trainerManagement: false,
  staffManagement: false,
  membershipManagement: false,
  paymentTracking: false,
  memberPortal: false,
  qrCodeCheckIn: false,
  basicDashboard: false,
  invoiceGeneration: false,
  expenseTracker: false,
  leadManagement: false,
  attendanceTracking: false,
  offersDiscounts: false,
  roleBasedAccess: false,
  trainerPortal: false,
  ptCollections: false,
  commissionTracking: false,
  basicReports: false,
  revenueAnalytics: false,
  advancedAnalytics: false,
  exportToExcel: false,
  customReports: false,
  emailSupport: false,
  chatSupport: false,
  phoneSupport: false,
  prioritySupport: false,
  prioritySupport24x7: false,
  reportsAnalytics: false,
  classScheduling: false,
  mobileAppAccess: false,
  customBranding: false,
  realTimeNotifications: false,
  paymentRecording: false,
};

export const DEFAULT_USAGE_LIMITS: UsageLimits = {
  maxClubs: 0,
  maxMembers: 0,
  maxTrainers: 0,
  maxStaffs: 0,
};
