import type { AuthEntitlements, PermissionModuleKey } from '@/types/access';
import type {
  SubscriptionAccessKey,
  SubscriptionLimitKey,
  SubscriptionPlanEntitlement,
  SubscriptionPlanFeatures,
} from '@/types/subscription';

export {
  getCatalogPlanFeatureLabels,
  SUBSCRIPTION_FEATURE_LABELS,
} from '@/lib/subscription/catalog-formatting';

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
