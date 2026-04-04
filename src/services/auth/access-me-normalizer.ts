import type { AccessPermission, AuthEntitlements } from '@/types/access';
import type {
  SubscriptionLimits,
  SubscriptionPlanEntitlement,
  SubscriptionPlanFeatures,
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
  monthlyPrice?: number | null;
  sixMonthsPrice?: number | null;
  yearlyPrice?: number | null;
  badge?: string | null;
  subscriptionDate?: string | null;
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

  return {
    id: getNumber(value.id),
    name: getString(value.name),
    subtitle: getString(value.subtitle),
    description: getString(value.description),
    monthlyPrice: getNumber(value.monthlyPrice),
    sixMonthsPrice: getNumber(value.sixMonthsPrice),
    yearlyPrice: getNumber(value.yearlyPrice),
    badge: getString(value.badge) || null,
    subscriptionDate:
      typeof value.subscriptionDate === 'string'
        ? value.subscriptionDate
        : null,
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
