import type { AttendanceSettings } from '@/services/attendance';
import type { MemberActivitySettings } from '@/services/gym';
import type { InvoiceSettings } from '@/services/invoice';
import type { NotificationSettings } from '@/services/notification';

export interface NotificationFormValues {
  paymentReminders: boolean;
  paymentReminderDays: number;
  memberExpiry: boolean;
  memberExpiryDays: number;
  notifyOnExpiryDay: boolean;
  lowAttendance: boolean;
  emailNotifications: boolean;
  whatsappNotifications: boolean;
}

const notificationFormDefaults: NotificationFormValues = {
  paymentReminders: true,
  paymentReminderDays: 3,
  memberExpiry: true,
  memberExpiryDays: 7,
  notifyOnExpiryDay: true,
  lowAttendance: false,
  emailNotifications: true,
  whatsappNotifications: false,
};

export const getDefaultNotificationFormValues = (): NotificationFormValues => ({
  ...notificationFormDefaults,
});

export const getNotificationFormValues = (
  settings?: NotificationSettings | null
): NotificationFormValues => {
  const defaults = getDefaultNotificationFormValues();

  if (!settings) {
    return defaults;
  }

  return {
    paymentReminders:
      settings.paymentReminder?.enabled ?? defaults.paymentReminders,
    paymentReminderDays:
      settings.paymentReminder?.daysBefore ?? defaults.paymentReminderDays,
    memberExpiry:
      settings.membershipExpiryAlert?.enabled ?? defaults.memberExpiry,
    memberExpiryDays:
      settings.membershipExpiryAlert?.daysBefore ?? defaults.memberExpiryDays,
    notifyOnExpiryDay:
      settings.membershipExpiryAlert?.notifyOnExpiryDay ??
      defaults.notifyOnExpiryDay,
    lowAttendance:
      settings.lowAttendanceAlert?.enabled ?? defaults.lowAttendance,
    emailNotifications: settings.channels?.email ?? defaults.emailNotifications,
    whatsappNotifications:
      settings.channels?.whatsApp ?? defaults.whatsappNotifications,
  };
};

export interface MemberActivityFormValues {
  inactiveAfterDays: number;
  skipperDays: number;
}

const memberActivityFormDefaults: MemberActivityFormValues = {
  inactiveAfterDays: 30,
  skipperDays: 4,
};

export const getDefaultMemberActivityFormValues =
  (): MemberActivityFormValues => ({
    ...memberActivityFormDefaults,
  });

export const getMemberActivityFormValues = (
  settings?: MemberActivitySettings | null
): MemberActivityFormValues => {
  const defaults = getDefaultMemberActivityFormValues();

  if (!settings) {
    return defaults;
  }

  return {
    inactiveAfterDays: settings.inactiveAfterDays ?? defaults.inactiveAfterDays,
    skipperDays: settings.skipperDays ?? defaults.skipperDays,
  };
};

export interface AttendanceSettingsFormValues {
  deviceProvider: string;
  serialNumber: string;
  doorControllerId?: string;
  unlockDuration?: number;
  liveSync: boolean;
  allowManualAttendance: boolean;
  autoUnlockOnManualCheckin: boolean;
  alertOnDeniedAttempts: boolean;
}

const attendanceSettingsFormDefaults: AttendanceSettingsFormValues = {
  deviceProvider: '',
  serialNumber: '',
  doorControllerId: undefined,
  unlockDuration: undefined,
  liveSync: true,
  allowManualAttendance: true,
  autoUnlockOnManualCheckin: false,
  alertOnDeniedAttempts: true,
};

export const getDefaultAttendanceSettingsFormValues =
  (): AttendanceSettingsFormValues => ({
    ...attendanceSettingsFormDefaults,
  });

export const getAttendanceSettingsFormValues = (
  settings?: AttendanceSettings | null
): AttendanceSettingsFormValues => {
  const defaults = getDefaultAttendanceSettingsFormValues();

  if (!settings) {
    return defaults;
  }

  return {
    deviceProvider: settings.deviceProvider ?? defaults.deviceProvider,
    serialNumber: settings.serialNumber ?? defaults.serialNumber,
    doorControllerId: settings.doorControllerId ?? defaults.doorControllerId,
    unlockDuration: settings.unlockDuration ?? defaults.unlockDuration,
    liveSync: settings.liveSync ?? defaults.liveSync,
    allowManualAttendance:
      settings.allowManualAttendance ?? defaults.allowManualAttendance,
    autoUnlockOnManualCheckin:
      settings.autoUnlockOnManualCheckin ?? defaults.autoUnlockOnManualCheckin,
    alertOnDeniedAttempts:
      settings.alertOnDeniedAttempts ?? defaults.alertOnDeniedAttempts,
  };
};

export interface InvoiceSettingsFormValues {
  invoicePrefix: string;
  invoiceStartNumber: string;
  taxRate: string;
  companyRegNumber: string;
  paymentTerms: string;
  invoiceTemplate: string;
}

const invoiceSettingsFormDefaults: InvoiceSettingsFormValues = {
  invoicePrefix: 'INV',
  invoiceStartNumber: '1001',
  taxRate: '',
  companyRegNumber: '',
  paymentTerms: 'Payment due within 30 days',
  invoiceTemplate: 'modern',
};

export const getDefaultInvoiceSettingsFormValues =
  (): InvoiceSettingsFormValues => ({
    ...invoiceSettingsFormDefaults,
  });

export const getInvoiceSettingsFormValues = (
  settings?: InvoiceSettings | null
): InvoiceSettingsFormValues => {
  const defaults = getDefaultInvoiceSettingsFormValues();

  if (!settings) {
    return defaults;
  }

  return {
    invoicePrefix: settings.invoicePrefix ?? defaults.invoicePrefix,
    invoiceStartNumber: String(
      settings.invoiceStartingNumber ?? defaults.invoiceStartNumber
    ),
    taxRate:
      settings.taxRate === 0 || settings.taxRate
        ? String(settings.taxRate)
        : defaults.taxRate,
    companyRegNumber:
      settings.taxRegistrationNumber ?? defaults.companyRegNumber,
    paymentTerms: settings.paymentTerms ?? defaults.paymentTerms,
    invoiceTemplate: settings.invoiceTemplate ?? defaults.invoiceTemplate,
  };
};
