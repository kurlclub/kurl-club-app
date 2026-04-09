'use client';

import { useState } from 'react';
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod/v4';

import {
  KFormField,
  KFormFieldType,
} from '@/components/shared/form/k-formfield';
import { KSheet } from '@/components/shared/form/k-sheet';
import SocialLinkInput from '@/components/shared/form/social-link-input';
import ProfilePictureUploader from '@/components/shared/uploaders/profile-uploader';
import { Button } from '@/components/ui/button';
import { FormControl, FormLabel } from '@/components/ui/form';
import { useSubscriptionAccess } from '@/hooks/use-subscription-access';
import { useAuth } from '@/providers/auth-provider';
import { addGymSchema } from '@/schemas';
import { createGym } from '@/services/gym';

type AddGymFormValues = z.infer<typeof addGymSchema>;

type AddGymProps = {
  isOpen: boolean;
  closeSheet: () => void;
  onGymAdded?: (gymId?: number) => void;
};

const DEFAULT_VALUES: AddGymFormValues = {
  GymName: '',
  Location: '',
  ContactNumber1: '',
  ContactNumber2: '',
  Email: '',
  socialLinks: [{ url: '' }],
  ProfilePicture: null,
};

function AddGym({ isOpen, closeSheet, onGymAdded }: AddGymProps) {
  const { user, refreshUser } = useAuth();
  const { requireLimitAccess } = useSubscriptionAccess();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddGymFormValues>({
    resolver: zodResolver(addGymSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onSubmit',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'socialLinks',
  });

  const handleReset = () => {
    form.reset(DEFAULT_VALUES);
  };

  const handleSubmit = async (data: AddGymFormValues) => {
    const clubCount = user?.clubs?.length ?? 0;
    const allowed = requireLimitAccess('maxClubs', clubCount, {
      title: 'Club limit reached',
      message: 'Upgrade your plan to add more clubs.',
    });

    if (!allowed) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      const gymAdminId = user?.userId;

      formData.append('GymName', data.GymName.trim());
      formData.append('Location', data.Location.trim());
      formData.append('ContactNumber1', data.ContactNumber1.trim());
      formData.append('ContactNumber2', data.ContactNumber2?.trim() || '');
      formData.append('Email', data.Email.trim());

      const socialLinksArray =
        data.socialLinks
          ?.map((link) => link.url.trim())
          .filter((url) => url.length > 0) || [];
      formData.append('SocialLinks', JSON.stringify(socialLinksArray));
      if (data.ProfilePicture instanceof File) {
        formData.append('ProfilePicture', data.ProfilePicture);
      }
      if (typeof gymAdminId === 'number') {
        formData.append('GymAdminId', String(gymAdminId));
      }

      const result = await createGym(formData);

      if (result.success) {
        toast.success(result.success);
        await refreshUser();
        form.reset(DEFAULT_VALUES);
        closeSheet();
        onGymAdded?.(result.data?.gymId ?? result.data?.id);
      } else {
        toast.error(result.error || 'Failed to add gym');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <div className="flex justify-between items-center w-full gap-3">
      <Button
        type="button"
        variant="secondary"
        className="h-11.5 min-w-18.25"
        onClick={handleReset}
        disabled={isSubmitting}
      >
        Reset
      </Button>
      <div className="flex justify-center gap-3">
        <Button
          onClick={() => {
            form.reset(DEFAULT_VALUES);
            closeSheet();
          }}
          type="button"
          variant="secondary"
          className="h-11.5 min-w-22.5"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          form="add-gym-form"
          type="submit"
          className="h-11.5 min-w-18.25"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add Gym'}
        </Button>
      </div>
    </div>
  );

  return (
    <KSheet
      className="w-112.5"
      isOpen={isOpen}
      onClose={closeSheet}
      title="Add New Gym"
      footer={footer}
    >
      <FormProvider {...form}>
        <form
          id="add-gym-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4"
        >
          <KFormField
            fieldType={KFormFieldType.SKELETON}
            control={form.control}
            name="ProfilePicture"
            renderSkeleton={(field) => (
              <FormControl>
                <ProfilePictureUploader
                  files={field.value as File | null}
                  onChange={field.onChange}
                />
              </FormControl>
            )}
          />

          <KFormField
            fieldType={KFormFieldType.INPUT}
            control={form.control}
            name="GymName"
            label="Gym Name"
            mandetory
          />

          <KFormField
            fieldType={KFormFieldType.INPUT}
            control={form.control}
            name="Location"
            label="Location"
            mandetory
          />
          <KFormField
            fieldType={KFormFieldType.INPUT}
            control={form.control}
            name="Email"
            label="Email"
            mandetory
          />
          <div className="flex flex-col gap-1.5">
            <FormLabel className="text-sm font-normal text-primary-blue-100 leading-normal">
              Primary Contact
              <span className="ml-1 text-alert-red-400">*</span>
            </FormLabel>
            <KFormField
              fieldType={KFormFieldType.PHONE_INPUT}
              control={form.control}
              name="ContactNumber1"
              label="Primary Contact"
              mandetory
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <FormLabel className="text-sm font-normal text-primary-blue-100 leading-normal">
              Secondary Contact
            </FormLabel>
            <KFormField
              fieldType={KFormFieldType.PHONE_INPUT}
              control={form.control}
              name="ContactNumber2"
              label="Secondary Contact"
            />
          </div>
          <div className="space-y-3">
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
                      />
                    )}
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => remove(index)}
                  className="h-13 w-13 border border-secondary-blue-400"
                  variant="secondary"
                  disabled={isSubmitting || fields.length === 1}
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
              disabled={isSubmitting}
            >
              Add Social Link
            </Button>
          </div>
        </form>
      </FormProvider>
    </KSheet>
  );
}

export default AddGym;
