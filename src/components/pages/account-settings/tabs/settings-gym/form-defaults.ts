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
