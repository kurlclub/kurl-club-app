'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { useSettingsGymId } from '@/components/pages/account-settings/tabs/settings-gym';
import {
  KFormField,
  KFormFieldType,
} from '@/components/shared/form/k-formfield';
import SocialLinkInput from '@/components/shared/form/social-link-input';
import ProfilePictureUploader from '@/components/shared/uploaders/profile-uploader';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FormControl } from '@/components/ui/form';
import { useAppDialog } from '@/hooks/use-app-dialog';
import { useGymDetails, useGymManagement } from '@/hooks/use-gym-management';
import { useAuth } from '@/providers/auth-provider';
import { GymDataDetailsSchema } from '@/schemas';

import DangerZone from './danger-zone';
import {
  type BusinessProfileFormValues,
  buildGymUpdateFormData,
  extractSocialLinks,
  getDefaultBusinessProfileFormValues,
  mapClubToGymDetails,
  mapGymDetailsToBusinessProfileForm,
} from './form-utils';
import RegionalSettings from './regional-settings';

export function BusinessProfileTab() {
  const { showConfirm } = useAppDialog();
  const { updateGym, isUpdating } = useGymManagement();
  const { user } = useAuth();

  const settingsGymId = useSettingsGymId();
  const { data: globalGymDetails } = useGymDetails();

  // Get gym details based on the resolved settings gym or fallback to global
  const gymDetails = useMemo(() => {
    if (settingsGymId && user?.clubs) {
      const selectedClub = user.clubs.find(
        (club) => club.gymId === settingsGymId
      );
      if (selectedClub) {
        return mapClubToGymDetails(selectedClub);
      }
    }
    return globalGymDetails;
  }, [settingsGymId, user?.clubs, globalGymDetails]);
  const [loadedGymId, setLoadedGymId] = useState<number | null>(null);
  const [savedSocialLinks, setSavedSocialLinks] = useState<string[]>([]);

  const profilePictureUrl = gymDetails?.photoPath || null;

  const form = useForm<BusinessProfileFormValues>({
    resolver: zodResolver(GymDataDetailsSchema),
    defaultValues: getDefaultBusinessProfileFormValues(),
    mode: 'onSubmit',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'socialLinks',
  });

  const dirtyFields = form.formState.dirtyFields;
  const watchedSocialLinks = form.watch('socialLinks');
  const isDirty =
    loadedGymId === gymDetails?.id &&
    form.formState.isDirty &&
    Boolean(
      dirtyFields.GymName ||
      dirtyFields.Phone ||
      dirtyFields.Email ||
      dirtyFields.Address ||
      dirtyFields.ProfilePicture
    );

  const isSocialLinkDirty = (index: number) => {
    const currentValue = watchedSocialLinks?.[index]?.url ?? '';
    return savedSocialLinks[index] !== currentValue;
  };

  const isNewSocialLink = (index: number) => {
    return index >= savedSocialLinks.length;
  };

  const resetFormFromGym = (nextGymDetails: typeof gymDetails) => {
    const nextFormValues = mapGymDetailsToBusinessProfileForm(nextGymDetails);
    form.reset(nextFormValues, { keepDefaultValues: false });
    setSavedSocialLinks(extractSocialLinks(nextGymDetails?.socialLinks));
    setLoadedGymId(nextGymDetails?.id ?? null);
  };

  const commitSavedBusinessProfile = (data: BusinessProfileFormValues) => {
    form.reset(data);
    setSavedSocialLinks(extractSocialLinks(data.socialLinks));
    setLoadedGymId(gymDetails?.id ?? null);
  };

  const saveBusinessProfile = async (data: BusinessProfileFormValues) => {
    if (!gymDetails?.id) {
      toast.error('No gym selected');
      return false;
    }

    const formData = buildGymUpdateFormData({
      data,
      gymId: gymDetails.id,
      existingPhoto: profilePictureUrl,
    });

    await updateGym({ gymId: gymDetails.id, data: formData });
    return true;
  };

  useEffect(() => {
    resetFormFromGym(gymDetails);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, gymDetails]);

  // Ensure at least one social link field exists
  useEffect(() => {
    if (fields.length === 0) {
      append({ url: '' });
    }
  }, [fields.length, append]);

  // Form submission handler
  const handleSubmit = async (data: BusinessProfileFormValues) => {
    try {
      const didSave = await saveBusinessProfile(data);
      if (!didSave) return;
      commitSavedBusinessProfile(data);
    } catch {
      // Error handled by hook
    }
  };

  // Social link handlers
  const handleSaveSocialLink = async () => {
    try {
      const currentData = form.getValues();
      const didSave = await saveBusinessProfile(currentData);
      if (!didSave) return;
      commitSavedBusinessProfile(currentData);
    } catch {
      toast.error('Failed to update social links');
    }
  };

  const handleDeleteSocialLink = (index: number) => {
    if (isNewSocialLink(index)) {
      remove(index);
      return;
    }

    showConfirm({
      title: 'Delete Social Link',
      description:
        'Are you sure you want to delete this social link? This action cannot be undone.',
      variant: 'destructive',
      onConfirm: async () => {
        const currentData = form.getValues();
        const nextSocialLinks =
          currentData.socialLinks?.filter((_, currentIndex) => {
            return currentIndex !== index;
          }) || [];
        const nextData = {
          ...currentData,
          socialLinks:
            nextSocialLinks.length > 0 ? nextSocialLinks : [{ url: '' }],
        };

        try {
          const didSave = await saveBusinessProfile(nextData);
          if (!didSave) return;
          commitSavedBusinessProfile(nextData);
        } catch {
          toast.error('Failed to remove social link');
        }
      },
    });
  };

  const handleDiscard = () => {
    resetFormFromGym(gymDetails);
  };

  return (
    <div className="space-y-6">
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Basic Details Card */}
          <Card className="bg-white dark:bg-secondary-blue-500 border-gray-200 dark:border-secondary-blue-400 py-2">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-gray-900 dark:text-white">
                    Basic details - {gymDetails?.gymName}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-secondary-blue-200 text-[15px]">
                    Manage your gym&apos;s basic information and contact details
                  </CardDescription>
                </div>
                {isDirty && (
                  <div
                    className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200"
                    aria-live="polite"
                  >
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleDiscard}
                      disabled={isUpdating}
                    >
                      Discard
                    </Button>
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <KFormField
                fieldType={KFormFieldType.SKELETON}
                control={form.control}
                name="ProfilePicture"
                renderSkeleton={(field) => (
                  <FormControl>
                    <ProfilePictureUploader
                      files={field.value as File | null}
                      onChange={field.onChange}
                      existingImageUrl={profilePictureUrl}
                    />
                  </FormControl>
                )}
              />

              <KFormField
                fieldType={KFormFieldType.INPUT}
                control={form.control}
                name="GymName"
                label="Gym name"
                className="bg-primary-blue-400"
                mandetory
                key={`gymname-${gymDetails?.id}`}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <KFormField
                  fieldType={KFormFieldType.PHONE_INPUT}
                  control={form.control}
                  name="Phone"
                  label="Contact number"
                  placeholder="(555) 123-4567"
                  className="input-phone-primary"
                  mandetory
                />
                <KFormField
                  fieldType={KFormFieldType.INPUT}
                  control={form.control}
                  name="Email"
                  label="Enter email"
                  className="bg-primary-blue-400"
                  mandetory
                />
              </div>

              <KFormField
                fieldType={KFormFieldType.INPUT}
                control={form.control}
                name="Address"
                label="Address"
                className="bg-primary-blue-400"
                mandetory
              />
            </CardContent>
          </Card>

          {/* Social Links Card */}
          <Card className="bg-white dark:bg-secondary-blue-500 border-gray-200 dark:border-secondary-blue-400 py-2">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                Social Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-3">
                  <div className="w-full">
                    <Controller
                      control={form.control}
                      name={`socialLinks.${index}.url`}
                      render={({ field }) => (
                        <SocialLinkInput
                          value={field.value}
                          onChange={field.onChange}
                          label="Social Link"
                          placeholder="https://www.google.com"
                          className="bg-primary-blue-400"
                        />
                      )}
                    />
                  </div>
                  {(isSocialLinkDirty(index) || isNewSocialLink(index)) && (
                    <Button
                      type="button"
                      onClick={handleSaveSocialLink}
                      className="h-13 w-13 border border-secondary-blue-400"
                      variant="secondary"
                      disabled={isUpdating}
                    >
                      <Check className="h-5 w-5" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={() => handleDeleteSocialLink(index)}
                    className="h-13 w-13 border border-secondary-blue-400"
                    variant="secondary"
                    disabled={isUpdating}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="secondary"
                className="hover:bg-primary-blue-500"
                onClick={() => append({ url: '' })}
                disabled={isUpdating}
              >
                Add Social Link
              </Button>
            </CardContent>
          </Card>
        </form>
      </FormProvider>

      <RegionalSettings />
      <DangerZone />
    </div>
  );
}
