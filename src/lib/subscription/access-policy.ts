import type { AuthEntitlements, PermissionModuleKey } from '@/types/access';
import type {
  SubscriptionAccessKey,
  SubscriptionCatalogFeatures,
  SubscriptionLimitKey,
  SubscriptionPlanEntitlement,
  SubscriptionPlanFeatures,
} from '@/types/subscription';

export const SUBSCRIPTION_ACCESS_LABELS: Record<SubscriptionAccessKey, string> =
  {
    memberManagement: 'Member management',
    paymentTracking: 'Payment management',
    attendanceTracking: 'Attendance tracking',
    manualAttendance: 'Manual attendance',
    liveAttendance: 'Automatic attendance',
    staffManagement: 'Staff management',
    membershipManagement: 'Membership plans & workout plans',
    basicReports: 'Reports dashboard',
    leadManagement: 'Lead management',
    emailSupport: 'Email support',
    chatSupport: 'WhatsApp support',
    phoneSupport: 'Call support',
    reportsAnalytics: 'Reports analytics',
    realTimeNotifications: 'Realtime notifications',
    whatsAppNotifications: 'WhatsApp notifications',
  };

export const SUBSCRIPTION_FEATURE_LABELS: Record<string, string> = {
  emailNotifications: 'Email notifications',
  whatsAppNotifications: 'WhatsApp notifications',
  manualAttendance: 'Manual attendance',
  liveAttendance: 'Live attendance',
  doorAccessAttendance: 'Door access attendance',
  devicesPerUserLimit: 'Devices per user',
  staffLoginLimit: 'Staff login limit',
  trainerLoginLimit: 'Trainer login limit',
  memberManagement: 'Member management',
  trainerManagement: 'Trainer management',
  staffManagement: 'Staff management',
  membershipManagement: 'Membership management',
  paymentTracking: 'Payment tracking',
  memberPortal: 'Member portal',
  qrCodeCheckIn: 'QR code check-in',
  basicDashboard: 'Basic dashboard',
  invoiceGeneration: 'Invoice generation',
  expenseTracker: 'Expense tracker',
  leadManagement: 'Lead management',
  attendanceTracking: 'Attendance tracking',
  offersDiscounts: 'Offers and discounts',
  roleBasedAccess: 'Role-based access',
  trainerPortal: 'Trainer portal',
  ptCollections: 'PT collections',
  commissionTracking: 'Commission tracking',
  basicReports: 'Basic reports',
  revenueAnalytics: 'Revenue analytics',
  advancedAnalytics: 'Advanced analytics',
  exportToExcel: 'Export to Excel',
  customReports: 'Custom reports',
  emailSupport: 'Email support',
  chatSupport: 'Chat support',
  phoneSupport: 'Phone support',
  prioritySupport: 'Priority support',
  prioritySupport24x7: 'Priority support 24x7',
  reportsAnalytics: 'Reports analytics',
  classScheduling: 'Class scheduling',
  mobileAppAccess: 'Mobile app access',
  customBranding: 'Custom branding',
  realTimeNotifications: 'Real-time notifications',
  paymentRecording: 'Payment recording',
};

const ACCESS_SELECTORS: Record<
  SubscriptionAccessKey,
  (features: SubscriptionPlanFeatures) => boolean
> = {
  memberManagement: (features) => features.memberManagement,
  paymentTracking: (features) => features.paymentManagement,
  attendanceTracking: (features) =>
    features.attendance.manual ||
    features.attendance.automatic ||
    features.attendance.memberInsights ||
    features.attendance.deviceManagement,
  manualAttendance: (features) => features.attendance.manual,
  liveAttendance: (features) => features.attendance.automatic,
  staffManagement: (features) =>
    features.staffManagement.staffLogin ||
    features.staffManagement.activityTracking,
  membershipManagement: (features) =>
    features.programs.membershipPlans || features.programs.workoutPlans,
  basicReports: (features) => features.expenses.reportsDashboard,
  leadManagement: (features) => features.leadsManagement,
  emailSupport: (features) => features.helpAndSupport.email,
  chatSupport: (features) => features.helpAndSupport.whatsApp,
  phoneSupport: (features) => features.helpAndSupport.call,
  reportsAnalytics: (features) =>
    features.expenses.reportsDashboard ||
    features.studioDashboard.paymentInsights ||
    features.studioDashboard.skipperStats ||
    features.studioDashboard.attendanceStats,
  realTimeNotifications: (features) => features.notifications.realtime,
  whatsAppNotifications: (features) =>
    features.notifications.whatsApp ||
    features.whatsAppNotifications.paymentReminders ||
    features.whatsAppNotifications.membershipExpiry ||
    features.whatsAppNotifications.lowAttendance ||
    features.whatsAppNotifications.specialDays,
};

export const getPermissionForModule = (
  entitlements: AuthEntitlements | null | undefined,
  moduleKey: PermissionModuleKey
) =>
  entitlements?.permissions.find(
    (permission) => permission.moduleKey === moduleKey
  ) ?? null;

export const hasPermissionAccess = (
  entitlements: AuthEntitlements | null | undefined,
  moduleKey: PermissionModuleKey,
  action: 'canView' | 'canCreate' | 'canEdit' | 'canDelete' = 'canView'
) => getPermissionForModule(entitlements, moduleKey)?.[action] ?? false;

export const hasSubscriptionAccess = (
  plan: SubscriptionPlanEntitlement | null | undefined,
  accessKey: SubscriptionAccessKey
) => {
  if (!plan) return false;
  return ACCESS_SELECTORS[accessKey](plan.features);
};

export const getEnabledSubscriptionCapabilities = (
  plan: SubscriptionPlanEntitlement | null | undefined
) =>
  (Object.keys(ACCESS_SELECTORS) as SubscriptionAccessKey[]).filter((key) =>
    hasSubscriptionAccess(plan, key)
  );

export const isSubscriptionLimitExceeded = (
  plan: SubscriptionPlanEntitlement | null | undefined,
  limitKey: SubscriptionLimitKey,
  currentCount: number
) => {
  const limit = plan?.limits[limitKey];
  if (typeof limit !== 'number' || !Number.isFinite(limit) || limit <= 0) {
    return false;
  }
  return currentCount >= limit;
};

export const getCatalogPlanFeatureLabels = (
  features: SubscriptionCatalogFeatures | null | undefined
) =>
  Object.entries(features ?? {})
    .filter(([, value]) => (typeof value === 'number' ? value > 0 : value))
    .map(([key]) => SUBSCRIPTION_FEATURE_LABELS[key])
    .filter(Boolean);
