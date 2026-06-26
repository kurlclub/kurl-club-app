import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { NotificationPreferencesSkeleton } from '@/components/pages/account-settings/account-settings-skeletons';
import {
  SettingsDirtyActions,
  SettingsGroup,
  SettingsRow,
  SettingsSection,
} from '@/components/pages/account-settings/components';
import {
  type NotificationFormValues,
  getDefaultNotificationFormValues,
  getNotificationFormValues,
  useSettingsGymId,
  useSyncSettingsFormWithGym,
} from '@/components/pages/account-settings/tabs/settings-gym';
import {
  KFormField,
  KFormFieldType,
} from '@/components/shared/form/k-formfield';
import { Switch } from '@/components/ui/switch';
import {
  type NotificationSettings,
  getNotificationSettings,
  updateNotificationSettings,
} from '@/services/notification';

const notificationSchema = z.object({
  paymentReminders: z.boolean(),
  paymentReminderDays: z.number().min(1),
  memberExpiry: z.boolean(),
  memberExpiryDays: z.number().min(1),
  notifyOnExpiryDay: z.boolean(),
  lowAttendance: z.boolean(),
  emailNotifications: z.boolean(),
  whatsappNotifications: z.boolean(),
});

type NotificationForm = NotificationFormValues;

export default function NotificationPreferences() {
  const [isSaving, setIsSaving] = useState(false);
  const settingsGymId = useSettingsGymId();

  const form = useForm<NotificationForm>({
    resolver: zodResolver(notificationSchema),
    defaultValues: getDefaultNotificationFormValues(),
  });

  const isSyncingSettingsForm = useSyncSettingsFormWithGym<
    NotificationForm,
    NotificationSettings
  >({
    gymId: settingsGymId,
    getDefaultValues: getDefaultNotificationFormValues,
    fetchSettings: getNotificationSettings,
    mapSettingsToValues: getNotificationFormValues,
    errorMessage: 'Failed to load notification settings',
    form,
  });

  const onSubmit = async (data: NotificationForm) => {
    if (!settingsGymId) {
      toast.error('No gym selected');
      return;
    }

    setIsSaving(true);
    try {
      // Transform form data to API format
      const settings: NotificationSettings = {
        paymentReminder: {
          enabled: data.paymentReminders,
          daysBefore: data.paymentReminderDays,
        },
        membershipExpiryAlert: {
          enabled: data.memberExpiry,
          daysBefore: data.memberExpiryDays,
          notifyOnExpiryDay: data.notifyOnExpiryDay,
        },
        lowAttendanceAlert: {
          enabled: data.lowAttendance,
        },
        channels: {
          email: data.emailNotifications,
          whatsApp: data.whatsappNotifications,
        },
      };

      const result = await updateNotificationSettings(settingsGymId, settings);
      toast.success(result.success);
      form.reset(data); // Reset form state to mark as not dirty
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error('Failed to save notification settings');
    } finally {
      setIsSaving(false);
    }
  };

  const isDirty = form.formState.isDirty;
  const isSectionLoading = isSyncingSettingsForm && !isDirty;
  const isBusy = isSyncingSettingsForm || isSaving;

  const paymentRemindersEnabled = form.watch('paymentReminders');
  const memberExpiryEnabled = form.watch('memberExpiry');
  const lowAttendanceEnabled = form.watch('lowAttendance');

  if (isSectionLoading) {
    return <NotificationPreferencesSkeleton />;
  }

  return (
    <SettingsSection
      icon={Bell}
      title="Notification Preferences"
      description="Configure automated alerts and reminders for payments and membership expiry"
      headerAction={
        isDirty ? (
          <SettingsDirtyActions
            onDiscard={() => form.reset()}
            onSave={form.handleSubmit(onSubmit)}
            isSaving={isSaving}
            isBusy={isBusy}
          />
        ) : undefined
      }
    >
      <FormProvider {...form}>
        <form className="space-y-6">
          {/* Alert Types */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-secondary-blue-200 mb-3">
              Alert Types
            </h3>

            <SettingsGroup>
              {/* Payment Reminders */}
              <SettingsRow
                leading={
                  <Switch
                    checked={paymentRemindersEnabled}
                    onCheckedChange={(checked) =>
                      form.setValue('paymentReminders', checked, {
                        shouldDirty: true,
                      })
                    }
                  />
                }
                label="Payment Reminders"
                description="Send reminders before payment due date"
                control={
                  paymentRemindersEnabled ? (
                    <KFormField
                      fieldType={KFormFieldType.INPUT}
                      control={form.control}
                      label="days before"
                      name="paymentReminderDays"
                      type="number"
                      valueAsNumber
                      placeholder="3"
                      className="w-24"
                      size="sm"
                    />
                  ) : undefined
                }
              />

              {/* Member Expiry */}
              <SettingsRow
                leading={
                  <Switch
                    checked={memberExpiryEnabled}
                    onCheckedChange={(checked) =>
                      form.setValue('memberExpiry', checked, {
                        shouldDirty: true,
                      })
                    }
                  />
                }
                label="Membership Expiry Alerts"
                description="Alert when memberships are about to expire"
                control={
                  memberExpiryEnabled ? (
                    <KFormField
                      fieldType={KFormFieldType.INPUT}
                      control={form.control}
                      name="memberExpiryDays"
                      type="number"
                      valueAsNumber
                      placeholder="7"
                      className="w-24"
                      size="sm"
                      label="days before"
                    />
                  ) : undefined
                }
              >
                {memberExpiryEnabled && (
                  <div className="flex items-center gap-3 pl-[3.25rem]">
                    <Switch
                      id="notifyOnExpiryDay"
                      className="scale-90"
                      checked={form.watch('notifyOnExpiryDay')}
                      onCheckedChange={(checked) =>
                        form.setValue('notifyOnExpiryDay', checked, {
                          shouldDirty: true,
                        })
                      }
                    />
                    <label
                      htmlFor="notifyOnExpiryDay"
                      className="text-xs text-gray-300 cursor-pointer"
                    >
                      Also notify on expiry day
                    </label>
                  </div>
                )}
              </SettingsRow>

              {/* Low Attendance */}
              <SettingsRow
                divider={false}
                leading={
                  <Switch
                    checked={lowAttendanceEnabled}
                    onCheckedChange={(checked) =>
                      form.setValue('lowAttendance', checked, {
                        shouldDirty: true,
                      })
                    }
                  />
                }
                label="Low Attendance Alerts"
                description="Notify when members haven't visited recently"
              />
            </SettingsGroup>
          </div>

          {/* Notification Channels */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-secondary-blue-200">
              Notification Channels
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg border border-secondary-blue-400 bg-secondary-blue-700">
                <Switch
                  checked={form.watch('emailNotifications')}
                  onCheckedChange={(checked) =>
                    form.setValue('emailNotifications', checked, {
                      shouldDirty: true,
                    })
                  }
                />
                <div>
                  <p className="text-sm font-medium text-white">
                    Email Notifications
                  </p>
                  <p className="text-xs text-gray-400">Send alerts via email</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-secondary-blue-400 bg-secondary-blue-700">
                <Switch
                  checked={form.watch('whatsappNotifications')}
                  onCheckedChange={(checked) =>
                    form.setValue('whatsappNotifications', checked, {
                      shouldDirty: true,
                    })
                  }
                />
                <div>
                  <p className="text-sm font-medium text-white">
                    WhatsApp Notifications
                  </p>
                  <p className="text-xs text-gray-400">
                    Send alerts via WhatsApp
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
    </SettingsSection>
  );
}
