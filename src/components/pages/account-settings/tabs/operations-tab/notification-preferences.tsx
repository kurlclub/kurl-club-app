import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { NotificationPreferencesSkeleton } from '@/components/pages/account-settings/account-settings-skeletons';
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
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
    <Card className="bg-secondary-blue-500/80 backdrop-blur-sm border-secondary-blue-400 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuOSIgbnVtT2N0YXZlcz0iNCIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIiBvcGFjaXR5PSIwLjA1Ii8+PC9zdmc+')] opacity-30 pointer-events-none" />
      <CardHeader className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-primary-green-500 mt-1" />
            <div>
              <CardTitle className="text-white">
                Notification Preferences
              </CardTitle>
              <CardDescription className="text-secondary-blue-200">
                Configure automated alerts and reminders for payments and
                membership expiry
              </CardDescription>
            </div>
          </div>
          {isDirty && (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => form.reset()}
                disabled={isBusy}
              >
                Discard
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={form.handleSubmit(onSubmit)}
                disabled={isBusy}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <FormProvider {...form}>
          <form className="space-y-6">
            {/* Alert Types */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-white">Alert Types</h3>

              {/* Payment Reminders */}
              <div className="flex items-center gap-4 p-4 rounded-lg border border-secondary-blue-400 bg-secondary-blue-700">
                <Switch
                  checked={paymentRemindersEnabled}
                  onCheckedChange={(checked) =>
                    form.setValue('paymentReminders', checked, {
                      shouldDirty: true,
                    })
                  }
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">
                        Payment Reminders
                      </p>
                      <p className="text-xs text-gray-400">
                        Send reminders before payment due date
                      </p>
                    </div>
                    {paymentRemindersEnabled && (
                      <div className="flex items-center gap-2">
                        <KFormField
                          fieldType={KFormFieldType.INPUT}
                          control={form.control}
                          label="days before"
                          name="paymentReminderDays"
                          type="number"
                          placeholder="3"
                          className="w-24"
                          size="sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Member Expiry */}
              <div className="flex items-center gap-4 p-4 rounded-lg border border-secondary-blue-400 bg-secondary-blue-700">
                <Switch
                  checked={memberExpiryEnabled}
                  onCheckedChange={(checked) =>
                    form.setValue('memberExpiry', checked, {
                      shouldDirty: true,
                    })
                  }
                />
                <div className="flex-1">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">
                          Membership Expiry Alerts
                        </p>
                        <p className="text-xs text-gray-400">
                          Alert when memberships are about to expire
                        </p>
                      </div>
                      {memberExpiryEnabled && (
                        <div className="flex items-center gap-2">
                          <KFormField
                            fieldType={KFormFieldType.INPUT}
                            control={form.control}
                            name="memberExpiryDays"
                            type="number"
                            placeholder="7"
                            className="w-24"
                            size="sm"
                            label="days before"
                          />
                        </div>
                      )}
                    </div>
                    {memberExpiryEnabled && (
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="notifyOnExpiryDay"
                          checked={form.watch('notifyOnExpiryDay')}
                          onCheckedChange={(checked) =>
                            form.setValue(
                              'notifyOnExpiryDay',
                              checked as boolean,
                              {
                                shouldDirty: true,
                              }
                            )
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
                  </div>
                </div>
              </div>

              {/* Low Attendance */}
              <div className="flex items-center gap-4 p-4 rounded-lg border border-secondary-blue-400 bg-secondary-blue-700">
                <Switch
                  checked={lowAttendanceEnabled}
                  onCheckedChange={(checked) =>
                    form.setValue('lowAttendance', checked, {
                      shouldDirty: true,
                    })
                  }
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">
                        Low Attendance Alerts
                      </p>
                      <p className="text-xs text-gray-400">
                        Notify when members haven&apos;t visited recently
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Channels */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-white">
                Notification Channels
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg border border-secondary-blue-400 bg-secondary-blue-700">
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
                    <p className="text-xs text-gray-400">
                      Send alerts via email
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg border border-secondary-blue-400 bg-secondary-blue-700">
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
      </CardContent>
    </Card>
  );
}
