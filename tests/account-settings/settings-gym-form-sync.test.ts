import { describe, expect, it, vi } from 'vitest';

import {
  getDefaultInvoiceSettingsFormValues,
  getDefaultNotificationFormValues,
  getInvoiceSettingsFormValues,
  getNotificationFormValues,
  loadSettingsFormValuesForGym,
} from '@/components/pages/account-settings/tabs/settings-gym';

describe('loadSettingsFormValuesForGym', () => {
  it('returns notification defaults without fetching when no gym is selected', async () => {
    const fetchSettings = vi.fn();

    await expect(
      loadSettingsFormValuesForGym({
        gymId: null,
        getDefaultValues: getDefaultNotificationFormValues,
        fetchSettings,
        mapSettingsToValues: getNotificationFormValues,
      })
    ).resolves.toEqual(getDefaultNotificationFormValues());

    expect(fetchSettings).not.toHaveBeenCalled();
  });

  it('returns invoice defaults when the selected gym has no saved settings', async () => {
    const fetchSettings = vi.fn().mockResolvedValue(null);

    await expect(
      loadSettingsFormValuesForGym({
        gymId: 22,
        getDefaultValues: getDefaultInvoiceSettingsFormValues,
        fetchSettings,
        mapSettingsToValues: getInvoiceSettingsFormValues,
      })
    ).resolves.toEqual(getDefaultInvoiceSettingsFormValues());

    expect(fetchSettings).toHaveBeenCalledWith(22);
  });

  it('maps fetched notification settings into form values', async () => {
    const fetchSettings = vi.fn().mockResolvedValue({
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
    });

    await expect(
      loadSettingsFormValuesForGym({
        gymId: 18,
        getDefaultValues: getDefaultNotificationFormValues,
        fetchSettings,
        mapSettingsToValues: getNotificationFormValues,
      })
    ).resolves.toEqual({
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
});
