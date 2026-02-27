import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

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
import { useGymBranch } from '@/providers/gym-branch-provider';
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

type NotificationForm = z.infer<typeof notificationSchema>;

export default function NotificationPreferences() {
  const [isLoading, setIsLoading] = useState(false);
  const { gymBranch } = useGymBranch();

  const form = useForm<NotificationForm>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      paymentReminders: true,
      paymentReminderDays: 3,
      memberExpiry: true,
      memberExpiryDays: 7,
      notifyOnExpiryDay: true,
      lowAttendance: false,
      emailNotifications: true,
      whatsappNotifications: false,
    },
  });

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      if (!gymBranch?.gymId) return;

      setIsLoading(true);
      try {
        const settings = await getNotificationSettings(gymBranch.gymId);

        // If settings exist, populate the form
        if (settings) {
          form.reset({
            paymentReminders: settings.paymentReminder?.enabled ?? true,
            paymentReminderDays: settings.paymentReminder?.daysBefore ?? 3,
            memberExpiry: settings.membershipExpiryAlert?.enabled ?? true,
            memberExpiryDays: settings.membershipExpiryAlert?.daysBefore ?? 7,
            notifyOnExpiryDay:
              settings.membershipExpiryAlert?.notifyOnExpiryDay ?? true,
            lowAttendance: settings.lowAttendanceAlert?.enabled ?? false,
            emailNotifications: settings.channels?.email ?? true,
            whatsappNotifications: settings.channels?.whatsApp ?? false,
          });
        }
        // If settings is null (doesn't exist), keep default values
      } catch (error) {
        console.error('Error loading notification settings:', error);
        toast.error('Failed to load notification settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [gymBranch?.gymId, form]);

  const onSubmit = async (data: NotificationForm) => {
    if (!gymBranch?.gymId) {
      toast.error('No gym selected');
      return;
    }

    setIsLoading(true);
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

      const result = await updateNotificationSettings(
        gymBranch.gymId,
        settings
      );
      toast.success(result.success);
      form.reset(data); // Reset form state to mark as not dirty
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error('Failed to save notification settings');
    } finally {
      setIsLoading(false);
    }
  };

  const isDirty = form.formState.isDirty;

  const paymentRemindersEnabled = form.watch('paymentReminders');
  const memberExpiryEnabled = form.watch('memberExpiry');
  const lowAttendanceEnabled = form.watch('lowAttendance');

  if (isLoading && !form.formState.isDirty) {
    return (
      <Card className="bg-secondary-blue-500/80 backdrop-blur-sm border-secondary-blue-400 relative overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <p className="text-gray-400">Loading notification settings...</p>
          </div>
        </CardContent>
      </Card>
    );
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
                Configure automated alerts and reminders for buffer periods and
                payments
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
                disabled={isLoading}
              >
                Discard
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={form.handleSubmit(onSubmit)}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
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
