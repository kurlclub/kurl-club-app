import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Activity } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { MemberActivitySkeleton } from '@/components/pages/account-settings/account-settings-skeletons';
import {
  type MemberActivityFormValues,
  getDefaultMemberActivityFormValues,
  getMemberActivityFormValues,
  useSettingsGymId,
  useSyncSettingsFormWithGym,
} from '@/components/pages/account-settings/tabs/settings-gym';
import {
  KFormField,
  KFormFieldType,
} from '@/components/shared/form/k-formfield';
import { memberActivityQueryKey } from '@/hooks/use-member-activity';
import {
  type MemberActivitySettings,
  getMemberActivitySettings,
  updateInactiveDays,
  updateSkipperDays,
} from '@/services/gym';

import { SettingsDirtyActions } from './components/settings-dirty-actions';
import { SettingsGroup } from './components/settings-group';
import { SettingsRow } from './components/settings-row';
import { SettingsSection } from './components/settings-section';

const memberActivitySchema = z.object({
  inactiveAfterDays: z.number().min(1).max(365),
  skipperDays: z.number().min(1).max(365),
});

type MemberActivityForm = MemberActivityFormValues;

export default function MemberActivity() {
  const [isSaving, setIsSaving] = useState(false);
  const settingsGymId = useSettingsGymId();
  const queryClient = useQueryClient();

  const form = useForm<MemberActivityForm>({
    resolver: zodResolver(memberActivitySchema),
    defaultValues: getDefaultMemberActivityFormValues(),
  });

  const isSyncingSettingsForm = useSyncSettingsFormWithGym<
    MemberActivityForm,
    MemberActivitySettings
  >({
    gymId: settingsGymId,
    getDefaultValues: getDefaultMemberActivityFormValues,
    fetchSettings: getMemberActivitySettings,
    mapSettingsToValues: getMemberActivityFormValues,
    errorMessage: 'Failed to load member activity settings',
    form,
  });

  const onSubmit = async (data: MemberActivityForm) => {
    if (!settingsGymId) {
      toast.error('No gym selected');
      return;
    }

    // Only persist the thresholds the user actually changed.
    const dirty = form.formState.dirtyFields;
    const requests: Array<Promise<{ success?: string; error?: string }>> = [];
    if (dirty.inactiveAfterDays) {
      requests.push(updateInactiveDays(settingsGymId, data.inactiveAfterDays));
    }
    if (dirty.skipperDays) {
      requests.push(updateSkipperDays(settingsGymId, data.skipperDays));
    }

    if (requests.length === 0) {
      form.reset(data);
      return;
    }

    setIsSaving(true);
    try {
      const results = await Promise.all(requests);
      const failed = results.find((result) => result.error);

      if (failed) {
        toast.error(failed.error);
        return;
      }

      toast.success('Member activity settings updated.');
      form.reset(data); // Mark form as not dirty
      // Keep the members-list status button in sync with the new threshold.
      void queryClient.invalidateQueries({
        queryKey: memberActivityQueryKey(settingsGymId),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isDirty = form.formState.isDirty;
  const isSectionLoading = isSyncingSettingsForm && !isDirty;
  const isBusy = isSyncingSettingsForm || isSaving;

  if (isSectionLoading) {
    return <MemberActivitySkeleton />;
  }

  return (
    <SettingsSection
      icon={Activity}
      title="Member Activity"
      description="Define when members are flagged as inactive or skipping classes"
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
            <SettingsRow
              label="Mark members inactive"
              description="Flag a member as inactive after this many days without a visit"
              control={
                <KFormField
                  fieldType={KFormFieldType.INPUT}
                  control={form.control}
                  name="inactiveAfterDays"
                  type="number"
                  valueAsNumber
                  placeholder="30"
                  label="days"
                  className="w-24"
                  size="sm"
                />
              }
            />

            <SettingsRow
              divider={false}
              label="Skipper threshold"
              description="Count members as skippers after this many missed days"
              control={
                <KFormField
                  fieldType={KFormFieldType.INPUT}
                  control={form.control}
                  name="skipperDays"
                  type="number"
                  valueAsNumber
                  placeholder="4"
                  label="days"
                  className="w-24"
                  size="sm"
                />
              }
            />
          </SettingsGroup>
        </form>
      </FormProvider>
    </SettingsSection>
  );
}
