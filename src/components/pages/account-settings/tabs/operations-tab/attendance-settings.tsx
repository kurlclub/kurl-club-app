import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Fingerprint } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { AttendanceSettingsSkeleton } from '@/components/pages/account-settings/account-settings-skeletons';
import {
  SettingsDirtyActions,
  SettingsGroup,
  SettingsRow,
  SettingsSection,
} from '@/components/pages/account-settings/components';
import {
  type AttendanceSettingsFormValues,
  getAttendanceSettingsFormValues,
  getDefaultAttendanceSettingsFormValues,
  useSettingsGymId,
  useSyncSettingsFormWithGym,
} from '@/components/pages/account-settings/tabs/settings-gym';
import { Switch } from '@/components/ui/switch';
import {
  type AttendanceSettings,
  getAttendanceSettings,
  updateAttendanceSettings,
} from '@/services/attendance';

const attendanceSettingsSchema = z.object({
  deviceProvider: z.string(),
  serialNumber: z.string(),
  doorControllerId: z.string().optional(),
  unlockDuration: z.number().optional(),
  liveSync: z.boolean(),
  allowManualAttendance: z.boolean(),
  autoUnlockOnManualCheckin: z.boolean(),
  alertOnDeniedAttempts: z.boolean(),
});

type AttendanceForm = AttendanceSettingsFormValues;

type ToggleKey =
  | 'liveSync'
  | 'allowManualAttendance'
  | 'autoUnlockOnManualCheckin'
  | 'alertOnDeniedAttempts';

const TOGGLES: Array<{ name: ToggleKey; label: string; description: string }> =
  [
    {
      name: 'liveSync',
      label: 'Live device sync',
      description: 'Keep the attendance feed updating in real time',
    },
    {
      name: 'allowManualAttendance',
      label: 'Allow manual attendance',
      description: 'Let admins check members in and out manually',
    },
    {
      name: 'autoUnlockOnManualCheckin',
      label: 'Auto-unlock on manual check-in',
      description: 'Unlock the gym door right after a manual check-in',
    },
    {
      name: 'alertOnDeniedAttempts',
      label: 'Denied attempt alerts',
      description: 'Show immediate alerts for denied entries',
    },
  ];

export default function AttendanceSettingsSection() {
  const [isSaving, setIsSaving] = useState(false);
  const settingsGymId = useSettingsGymId();

  const form = useForm<AttendanceForm>({
    resolver: zodResolver(attendanceSettingsSchema),
    defaultValues: getDefaultAttendanceSettingsFormValues(),
  });

  const isSyncingSettingsForm = useSyncSettingsFormWithGym<
    AttendanceForm,
    AttendanceSettings
  >({
    gymId: settingsGymId,
    getDefaultValues: getDefaultAttendanceSettingsFormValues,
    fetchSettings: getAttendanceSettings,
    mapSettingsToValues: getAttendanceSettingsFormValues,
    errorMessage: 'Failed to load attendance settings',
    form,
  });

  const onSubmit = async (data: AttendanceForm) => {
    if (!settingsGymId) {
      toast.error('No gym selected');
      return;
    }

    setIsSaving(true);
    try {
      // Send the full object — the device fields round-trip unchanged.
      const result = await updateAttendanceSettings(settingsGymId, data);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(result.success);
      form.reset(data); // Mark form as not dirty
    } finally {
      setIsSaving(false);
    }
  };

  const isDirty = form.formState.isDirty;
  const isSectionLoading = isSyncingSettingsForm && !isDirty;
  const isBusy = isSyncingSettingsForm || isSaving;

  if (isSectionLoading) {
    return <AttendanceSettingsSkeleton />;
  }

  return (
    <SettingsSection
      icon={Fingerprint}
      title="Attendance & Access"
      description="Control how attendance is captured and how gym access behaves"
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
        <form>
          <SettingsGroup>
            {TOGGLES.map((toggle, index) => (
              <SettingsRow
                key={toggle.name}
                divider={index < TOGGLES.length - 1}
                leading={
                  <Switch
                    checked={form.watch(toggle.name)}
                    onCheckedChange={(checked) =>
                      form.setValue(toggle.name, checked, {
                        shouldDirty: true,
                      })
                    }
                  />
                }
                label={toggle.label}
                description={toggle.description}
              />
            ))}
          </SettingsGroup>
        </form>
      </FormProvider>
    </SettingsSection>
  );
}
