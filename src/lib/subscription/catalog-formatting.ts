import type {
  SubscriptionCatalogFeatures,
  SubscriptionLimits,
} from '@/types/subscription';

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
  'studioDashboard.enabled': 'Studio dashboard',
  'studioDashboard.paymentInsights': 'Payment insights',
  'studioDashboard.skipperStats': 'Skipper stats',
  'studioDashboard.attendanceStats': 'Attendance stats',
  paymentManagement: 'Payment management',
  'attendance.memberInsights': 'Member insights',
  'attendance.deviceManagement': 'Attendance device management',
  leadsManagement: 'Leads management',
  payrollManagement: 'Payroll management',
  'programs.membershipPlans': 'Membership plans',
  'programs.workoutPlans': 'Workout plans',
  'staffManagement.activityTracking': 'Staff activity tracking',
  'staffManagement.staffLogin': 'Staff login',
  'expenses.reportsDashboard': 'Reports dashboard',
  'expenses.expenseManagement': 'Expense management',
  'helpAndSupport.ticketingPortal': 'Ticketing portal support',
  'helpAndSupport.whatsApp': 'WhatsApp support',
  'helpAndSupport.email': 'Email support',
  'helpAndSupport.call': 'Call support',
  'whatsAppNotifications.paymentReminders': 'WhatsApp payment reminders',
  'whatsAppNotifications.membershipExpiry': 'WhatsApp membership expiry alerts',
  'whatsAppNotifications.lowAttendance': 'WhatsApp low attendance alerts',
  'whatsAppNotifications.specialDays': 'WhatsApp special day alerts',
  'invoice.customTemplates': 'Custom invoice templates',
  'notifications.realtime': 'Realtime notifications',
  'notifications.whatsApp': 'WhatsApp notifications',
  'notifications.email': 'Email notifications',
  'notifications.push': 'Push notifications',
};

export const SUBSCRIPTION_LIMIT_LABELS: Record<string, string> = {
  maxClubs: 'Clubs up to',
  maxMembers: 'Members up to',
  maxTrainers: 'Trainers up to',
  maxStaffs: 'Staff up to',
  maxMembershipPlans: 'Membership plans up to',
  maxWorkoutPlans: 'Workout plans up to',
  maxLeadsPerMonth: 'Leads per month up to',
};

export type SubscriptionCatalogFeatureItem = {
  key: string;
  label: string;
  enabled: boolean;
};

const toTitleCase = (value: string) =>
  value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[._-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\w/, (char) => char.toUpperCase());

const collectSubscriptionCatalogFeatureItems = (
  features: unknown,
  prefix = ''
): SubscriptionCatalogFeatureItem[] => {
  if (Array.isArray(features)) {
    return features
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((label) => ({ key: label, label, enabled: true }));
  }

  if (!features || typeof features !== 'object') {
    return [];
  }

  const items: SubscriptionCatalogFeatureItem[] = [];

  for (const [key, value] of Object.entries(
    features as Record<string, unknown>
  )) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'boolean') {
      items.push({
        key: path,
        label:
          SUBSCRIPTION_FEATURE_LABELS[path] ||
          SUBSCRIPTION_FEATURE_LABELS[key] ||
          toTitleCase(path),
        enabled: value,
      });
      continue;
    }

    if (typeof value === 'number') {
      if (value > 0) {
        items.push({
          key: path,
          label:
            SUBSCRIPTION_FEATURE_LABELS[path] ||
            SUBSCRIPTION_FEATURE_LABELS[key] ||
            toTitleCase(path),
          enabled: true,
        });
      }
      continue;
    }

    items.push(...collectSubscriptionCatalogFeatureItems(value, path));
  }

  return items;
};

export const getSubscriptionLimitLabel = (key: string) =>
  SUBSCRIPTION_LIMIT_LABELS[key] || toTitleCase(key);

export const getSubscriptionLimitLabels = (
  limits:
    | Partial<Record<keyof SubscriptionLimits, number | null | undefined>>
    | Record<string, number | null | undefined>
    | null
    | undefined
) =>
  Object.entries(limits ?? {})
    .filter(([, value]) => typeof value === 'number' && Number.isFinite(value))
    .map(([key, value]) => `${getSubscriptionLimitLabel(key)} ${value}`);

export const getSubscriptionCatalogFeatureItems = (
  features: SubscriptionCatalogFeatures | string[] | null | undefined
) => {
  const featureMap = new Map<string, SubscriptionCatalogFeatureItem>();

  for (const item of collectSubscriptionCatalogFeatureItems(features)) {
    if (!item.label) continue;

    const existing = featureMap.get(item.label);
    featureMap.set(item.label, {
      key: existing?.key || item.key,
      label: item.label,
      enabled: Boolean(existing?.enabled) || item.enabled,
    });
  }

  return Array.from(featureMap.values()).sort(
    (left, right) => Number(right.enabled) - Number(left.enabled)
  );
};

export const getCatalogPlanFeatureLabels = (
  features: SubscriptionCatalogFeatures | string[] | null | undefined
) =>
  getSubscriptionCatalogFeatureItems(features)
    .filter((feature) => feature.enabled)
    .map((feature) => feature.label);
