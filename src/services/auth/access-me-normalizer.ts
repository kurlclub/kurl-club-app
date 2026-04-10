import type { AccessPermission, AuthEntitlements } from '@/types/access';
import type {
  BillingCycle,
  SubscriptionLimits,
  SubscriptionPlanEntitlement,
  SubscriptionPlanFeatures,
  SubscriptionPlanStatus,
} from '@/types/subscription';
import {
  DEFAULT_SUBSCRIPTION_LIMITS,
  DEFAULT_SUBSCRIPTION_PLAN_FEATURES,
} from '@/types/subscription';

type RawPermission = Partial<AccessPermission> & {
  moduleKey?: string | null;
};

type RawSubscriptionPlan = {
  id?: number | null;
  name?: string | null;
  subtitle?: string | null;
  description?: string | null;
  iconUrl?: string | null;
  monthlyPrice?: number | null;
  sixMonthsPrice?: number | null;
  yearlyPrice?: number | null;
  badge?: string | null;
  subscriptionDate?: string | null;
  billingCycle?: string | null;
  isActive?: boolean | null;
  nextBillingDate?: string | null;
  daysRemaining?: number | null;
  limits?: Record<string, unknown> | null;
  features?: Record<string, unknown> | null;
} | null;

export type AccessMeData = {
  role?: string | null;
  subscriptionPlan?: RawSubscriptionPlan;
  permissions?: RawPermission[] | null;
} | null;

export type AccessMeResponse = {
  status?: string;
  message?: string;
  data?: AccessMeData;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getBoolean = (value: unknown) => value === true;

const getNumber = (value: unknown, fallback = 0) =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const getNullableNumber = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const getString = (value: unknown) =>
  typeof value === 'string' ? value.trim() : '';

const getNullableString = (value: unknown) => {
  const normalized = getString(value);
  return normalized.length > 0 ? normalized : null;
};

const normalizeBillingCycle = (value: unknown): BillingCycle | null => {
  const billingCycle = getString(value);
  return billingCycle === 'monthly' ||
    billingCycle === 'sixMonths' ||
    billingCycle === 'yearly'
    ? billingCycle
    : null;
};

const isRequiredNumber = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value);

const isNullableNumber = (value: unknown) =>
  value === null || (typeof value === 'number' && Number.isFinite(value));

const isBooleanRecord = (
  value: unknown,
  keys: readonly string[]
): value is Record<string, boolean> =>
  isRecord(value) && keys.every((key) => typeof value[key] === 'boolean');

const hasValidSubscriptionLimits = (
  value: unknown
): value is Record<string, number | null> =>
  isRecord(value) &&
  isRequiredNumber(value.maxClubs) &&
  isRequiredNumber(value.maxMembers) &&
  isRequiredNumber(value.maxTrainers) &&
  isRequiredNumber(value.maxStaffs) &&
  isNullableNumber(value.maxMembershipPlans) &&
  isNullableNumber(value.maxWorkoutPlans) &&
  isNullableNumber(value.maxLeadsPerMonth);

const hasValidSubscriptionFeatures = (
  value: unknown
): value is Record<string, unknown> => {
  if (!isRecord(value)) return false;

  return (
    isBooleanRecord(value.studioDashboard, [
      'enabled',
      'paymentInsights',
      'skipperStats',
      'attendanceStats',
    ]) &&
    typeof value.memberManagement === 'boolean' &&
    typeof value.paymentManagement === 'boolean' &&
    isBooleanRecord(value.attendance, [
      'manual',
      'automatic',
      'memberInsights',
      'deviceManagement',
    ]) &&
    typeof value.leadsManagement === 'boolean' &&
    isBooleanRecord(value.programs, ['membershipPlans', 'workoutPlans']) &&
    isBooleanRecord(value.staffManagement, [
      'activityTracking',
      'staffLogin',
    ]) &&
    typeof value.payrollManagement === 'boolean' &&
    isBooleanRecord(value.expenses, [
      'reportsDashboard',
      'expenseManagement',
    ]) &&
    isBooleanRecord(value.helpAndSupport, [
      'ticketingPortal',
      'whatsApp',
      'email',
      'call',
    ]) &&
    isBooleanRecord(value.whatsAppNotifications, [
      'paymentReminders',
      'membershipExpiry',
      'lowAttendance',
      'specialDays',
    ]) &&
    isBooleanRecord(value.invoice, ['customTemplates']) &&
    isBooleanRecord(value.notifications, [
      'realtime',
      'whatsApp',
      'email',
      'push',
    ])
  );
};

const hasValidSubscriptionPricing = (value: Record<string, unknown>) =>
  isRequiredNumber(value.monthlyPrice) &&
  isRequiredNumber(value.sixMonthsPrice) &&
  isRequiredNumber(value.yearlyPrice);

const normalizeDaysRemaining = (
  value: unknown,
  isActive: boolean
): number | null => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return isActive ? null : null;
  }

  if (!Number.isInteger(value)) {
    return null;
  }

  if (isActive && value < 0) {
    return null;
  }

  return value;
};

const deriveSubscriptionStatus = ({
  isActive,
  daysRemaining,
}: {
  isActive: boolean;
  daysRemaining: number | null;
}): SubscriptionPlanStatus => {
  if (!isActive) {
    return 'expired';
  }

  return daysRemaining !== null && daysRemaining <= 7 ? 'expiring' : 'active';
};

const deriveBillingAmount = (
  value: Record<string, unknown>,
  billingCycle: BillingCycle | null
): number | null => {
  if (!billingCycle || !hasValidSubscriptionPricing(value)) {
    return null;
  }

  if (billingCycle === 'yearly') {
    return getNumber(value.yearlyPrice);
  }

  if (billingCycle === 'sixMonths') {
    return getNumber(value.sixMonthsPrice);
  }

  return getNumber(value.monthlyPrice);
};

const stripHtmlToText = (value: string) =>
  value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

export const normalizeSubscriptionLimits = (
  value: unknown
): SubscriptionLimits => {
  if (!isRecord(value)) {
    return DEFAULT_SUBSCRIPTION_LIMITS;
  }

  return {
    maxClubs: getNullableNumber(value.maxClubs),
    maxMembers: getNullableNumber(value.maxMembers),
    maxTrainers: getNullableNumber(value.maxTrainers),
    maxStaffs: getNullableNumber(value.maxStaffs),
    maxMembershipPlans: getNullableNumber(value.maxMembershipPlans),
    maxWorkoutPlans: getNullableNumber(value.maxWorkoutPlans),
    maxLeadsPerMonth: getNullableNumber(value.maxLeadsPerMonth),
  };
};

export const normalizeSubscriptionPlanFeatures = (
  value: unknown
): SubscriptionPlanFeatures => {
  const source = isRecord(value) ? value : {};

  const studioDashboard = isRecord(source.studioDashboard)
    ? source.studioDashboard
    : {};
  const attendance = isRecord(source.attendance) ? source.attendance : {};
  const programs = isRecord(source.programs) ? source.programs : {};
  const staffManagement = isRecord(source.staffManagement)
    ? source.staffManagement
    : {};
  const expenses = isRecord(source.expenses) ? source.expenses : {};
  const helpAndSupport = isRecord(source.helpAndSupport)
    ? source.helpAndSupport
    : {};
  const whatsAppNotifications = isRecord(source.whatsAppNotifications)
    ? source.whatsAppNotifications
    : {};
  const invoice = isRecord(source.invoice) ? source.invoice : {};
  const notifications = isRecord(source.notifications)
    ? source.notifications
    : {};

  return {
    studioDashboard: {
      enabled: getBoolean(studioDashboard.enabled),
      paymentInsights: getBoolean(studioDashboard.paymentInsights),
      skipperStats: getBoolean(studioDashboard.skipperStats),
      attendanceStats: getBoolean(studioDashboard.attendanceStats),
    },
    memberManagement: getBoolean(source.memberManagement),
    paymentManagement: getBoolean(source.paymentManagement),
    attendance: {
      manual: getBoolean(attendance.manual),
      automatic: getBoolean(attendance.automatic),
      memberInsights: getBoolean(attendance.memberInsights),
      deviceManagement: getBoolean(attendance.deviceManagement),
    },
    leadsManagement: getBoolean(source.leadsManagement),
    programs: {
      membershipPlans: getBoolean(programs.membershipPlans),
      workoutPlans: getBoolean(programs.workoutPlans),
    },
    staffManagement: {
      activityTracking: getBoolean(staffManagement.activityTracking),
      staffLogin: getBoolean(staffManagement.staffLogin),
    },
    payrollManagement: getBoolean(source.payrollManagement),
    expenses: {
      reportsDashboard: getBoolean(expenses.reportsDashboard),
      expenseManagement: getBoolean(expenses.expenseManagement),
    },
    helpAndSupport: {
      ticketingPortal: getBoolean(helpAndSupport.ticketingPortal),
      whatsApp: getBoolean(helpAndSupport.whatsApp),
      email: getBoolean(helpAndSupport.email),
      call: getBoolean(helpAndSupport.call),
    },
    whatsAppNotifications: {
      paymentReminders: getBoolean(whatsAppNotifications.paymentReminders),
      membershipExpiry: getBoolean(whatsAppNotifications.membershipExpiry),
      lowAttendance: getBoolean(whatsAppNotifications.lowAttendance),
      specialDays: getBoolean(whatsAppNotifications.specialDays),
    },
    invoice: {
      customTemplates: getBoolean(invoice.customTemplates),
    },
    notifications: {
      realtime: getBoolean(notifications.realtime),
      whatsApp: getBoolean(notifications.whatsApp),
      email: getBoolean(notifications.email),
      push: getBoolean(notifications.push),
    },
  };
};

export const normalizeAccessPermissions = (
  value: unknown
): AccessPermission[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((permission) => {
      if (!isRecord(permission)) return null;
      const moduleKey = getString(permission.moduleKey);
      if (!moduleKey) return null;

      return {
        moduleKey,
        canView: getBoolean(permission.canView),
        canCreate: getBoolean(permission.canCreate),
        canEdit: getBoolean(permission.canEdit),
        canDelete: getBoolean(permission.canDelete),
      };
    })
    .filter(
      (permission): permission is AccessPermission => permission !== null
    );
};

export const normalizeSubscriptionPlanEntitlement = (
  value: unknown
): SubscriptionPlanEntitlement | null => {
  if (!isRecord(value)) return null;

  const billingCycle = normalizeBillingCycle(value.billingCycle);
  const isActive = typeof value.isActive === 'boolean' ? value.isActive : null;
  const subscriptionDate = getNullableString(value.subscriptionDate);
  const nextBillingDate = getNullableString(value.nextBillingDate);
  const daysRemaining =
    isActive === null
      ? null
      : normalizeDaysRemaining(value.daysRemaining, isActive);
  const billingAmount =
    billingCycle === null ? null : deriveBillingAmount(value, billingCycle);

  if (
    isActive === null ||
    subscriptionDate === null ||
    nextBillingDate === null ||
    !hasValidSubscriptionLimits(value.limits) ||
    !hasValidSubscriptionFeatures(value.features) ||
    !hasValidSubscriptionPricing(value)
  ) {
    return null;
  }

  const description = getString(value.description);
  const descriptionPlainText = stripHtmlToText(description);
  const status = deriveSubscriptionStatus({
    isActive,
    daysRemaining,
  });

  return {
    subscriptionId: null,
    id: getNumber(value.id),
    name: getString(value.name),
    subtitle: getString(value.subtitle),
    description,
    descriptionPlainText,
    iconUrl: getNullableString(value.iconUrl),
    monthlyPrice: getNumber(value.monthlyPrice),
    sixMonthsPrice: getNumber(value.sixMonthsPrice),
    yearlyPrice: getNumber(value.yearlyPrice),
    badge: getString(value.badge) || null,
    isActive,
    status,
    billingCycle,
    currency: null,
    billingAmount,
    subscriptionDate,
    startDate: subscriptionDate,
    endDate: nextBillingDate,
    nextBillingDate,
    daysRemaining,
    cancelAtPeriodEnd: false,
    limits: normalizeSubscriptionLimits(value.limits),
    features: normalizeSubscriptionPlanFeatures(value.features),
  };
};

export const normalizeAccessMeData = (
  value: AccessMeData | Record<string, unknown> | null | undefined
): AuthEntitlements => {
  const source = isRecord(value) ? value : {};

  return {
    role: getString(source.role),
    permissions: normalizeAccessPermissions(source.permissions),
    subscriptionPlan: normalizeSubscriptionPlanEntitlement(
      source.subscriptionPlan
    ),
  };
};

export const getDefaultEntitlements = (): AuthEntitlements => ({
  role: '',
  permissions: [],
  subscriptionPlan: null,
});

export const getDefaultPlanFeatures = () => DEFAULT_SUBSCRIPTION_PLAN_FEATURES;
