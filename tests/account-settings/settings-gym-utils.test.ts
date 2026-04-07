import { describe, expect, it } from 'vitest';

import {
  getDefaultInvoiceSettingsFormValues,
  getDefaultNotificationFormValues,
  getInvoiceSettingsFormValues,
  getNotificationFormValues,
  resolveSettingsGymId,
  syncSelectedSettingsGymId,
} from '@/components/pages/account-settings/tabs/settings-gym';

describe('settings gym scope helpers', () => {
  it('prefers the local settings selection over global and fallback clubs', () => {
    expect(
      resolveSettingsGymId({
        localSettingsGymId: 33,
        globalGymId: 22,
        clubGymIds: [11],
      })
    ).toBe(33);
  });

  it('falls back to the global gym before the first club', () => {
    expect(
      resolveSettingsGymId({
        globalGymId: 22,
        clubGymIds: [11],
      })
    ).toBe(22);
  });

  it('falls back to the first club when there is no local or global gym', () => {
    expect(
      resolveSettingsGymId({
        clubGymIds: [11, 22],
      })
    ).toBe(11);
  });

  it('resyncs the selected settings gym when the global branch changes', () => {
    expect(
      syncSelectedSettingsGymId({
        currentSelectedGymId: 11,
        previousGlobalGymId: 11,
        nextGlobalGymId: 22,
        availableGymIds: [11, 22],
      })
    ).toBe(22);
  });
});

describe('settings form defaults', () => {
  it('resets notification values to defaults when no settings exist', () => {
    expect(getNotificationFormValues(null)).toEqual(
      getDefaultNotificationFormValues()
    );
  });

  it('maps existing notification settings into form values', () => {
    expect(
      getNotificationFormValues({
        paymentReminder: {
          enabled: false,
          daysBefore: 5,
        },
        membershipExpiryAlert: {
          enabled: true,
          daysBefore: 10,
          notifyOnExpiryDay: false,
        },
        lowAttendanceAlert: {
          enabled: true,
        },
        channels: {
          email: false,
          whatsApp: true,
        },
      })
    ).toEqual({
      paymentReminders: false,
      paymentReminderDays: 5,
      memberExpiry: true,
      memberExpiryDays: 10,
      notifyOnExpiryDay: false,
      lowAttendance: true,
      emailNotifications: false,
      whatsappNotifications: true,
    });
  });

  it('resets invoice values to defaults when no settings exist', () => {
    expect(getInvoiceSettingsFormValues(null)).toEqual(
      getDefaultInvoiceSettingsFormValues()
    );
  });

  it('maps existing invoice settings into form values', () => {
    expect(
      getInvoiceSettingsFormValues({
        gymId: 9,
        invoicePrefix: 'KC',
        invoiceStartingNumber: 4001,
        taxRate: 18,
        taxRegistrationNumber: 'GST123',
        paymentTerms: 'Due on receipt',
        invoiceTemplate: 'classic',
      })
    ).toEqual({
      invoicePrefix: 'KC',
      invoiceStartNumber: '4001',
      taxRate: '18',
      companyRegNumber: 'GST123',
      paymentTerms: 'Due on receipt',
      invoiceTemplate: 'classic',
    });
  });
});
