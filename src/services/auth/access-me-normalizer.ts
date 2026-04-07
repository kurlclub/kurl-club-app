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
  subscriptionId?: number | null;
  id?: number | null;
  name?: string | null;
  subtitle?: string | null;
  description?: string | null;
  descriptionPlainText?: string | null;
  iconUrl?: string | null;
  monthlyPrice?: number | null;
  sixMonthsPrice?: number | null;
  yearlyPrice?: number | null;
  badge?: string | null;
  subscriptionDate?: string | null;
  status?: string | null;
  billingCycle?: string | null;
  currency?: string | null;
  billingAmount?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  nextBillingDate?: string | null;
  daysRemaining?: number | null;
  cancelAtPeriodEnd?: boolean | null;
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

const normalizeSubscriptionStatus = (
  value: unknown
): SubscriptionPlanStatus | null => {
  const status = getString(value).toLowerCase();

  return status === 'active' || status === 'expiring' || status === 'expired'
    ? status
    : null;
};

const isValidDateString = (value: string | null) =>
  typeof value === 'string' &&
  value.length > 0 &&
  !Number.isNaN(Date.parse(value));

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

const hasValidLifecycleContract = (
  value: Record<string, unknown>,
  status: SubscriptionPlanStatus,
  billingCycle: BillingCycle,
  billingAmount: number,
  subscriptionDate: string,
  startDate: string,
  endDate: string,
  currency: string
) => {
  if (
    !isRequiredNumber(value.subscriptionId) ||
    !isRequiredNumber(value.id) ||
    getString(value.name).length === 0 ||
    !isValidDateString(subscriptionDate) ||
    !isValidDateString(startDate) ||
    !isValidDateString(endDate) ||
    currency.length === 0 ||
    !Number.isFinite(billingAmount)
  ) {
    return false;
  }

  if (status === 'expired') {
    return value.nextBillingDate === null && value.daysRemaining === null;
  }

  return (
    isValidDateString(getNullableString(value.nextBillingDate)) &&
    Number.isInteger(value.daysRemaining)
  );
};

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

  const status = normalizeSubscriptionStatus(value.status);
  const billingCycle = normalizeBillingCycle(value.billingCycle);
  const currency = getNullableString(value.currency);
  const billingAmount = getNullableNumber(value.billingAmount);
  const subscriptionDate = getNullableString(value.subscriptionDate);
  const startDate = getNullableString(value.startDate);
  const endDate = getNullableString(value.endDate);
  const descriptionPlainText = getString(value.descriptionPlainText);

  if (
    !status ||
    !billingCycle ||
    currency === null ||
    billingAmount === null ||
    subscriptionDate === null ||
    startDate === null ||
    endDate === null ||
    !hasValidSubscriptionLimits(value.limits) ||
    !hasValidSubscriptionFeatures(value.features) ||
    !hasValidLifecycleContract(
      value,
      status,
      billingCycle,
      billingAmount,
      subscriptionDate,
      startDate,
      endDate,
      currency
    )
  ) {
    return null;
  }

  const description = getString(value.description);

  return {
    subscriptionId: getNumber(value.subscriptionId),
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
    status,
    billingCycle,
    currency,
    billingAmount,
    subscriptionDate,
    startDate,
    endDate,
    nextBillingDate: getNullableString(value.nextBillingDate),
    daysRemaining: getNullableNumber(value.daysRemaining),
    cancelAtPeriodEnd: value.cancelAtPeriodEnd === true,
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
