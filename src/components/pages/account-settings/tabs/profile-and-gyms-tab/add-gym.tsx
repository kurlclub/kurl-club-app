'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod/v4';

import {
  KFormField,
  KFormFieldType,
} from '@/components/shared/form/k-formfield';
import ProfilePictureUploader from '@/components/shared/uploaders/profile-uploader';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FormControl, FormLabel } from '@/components/ui/form';
import { useSubscriptionAccess } from '@/hooks/use-subscription-access';
import { useAuth } from '@/providers/auth-provider';
import { useGymBranch } from '@/providers/gym-branch-provider';
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
  ProfilePicture: null,
};

const POST_GYM_REDIRECT_URL = '/dashboard';

function AddGym({ isOpen, closeSheet, onGymAdded }: AddGymProps) {
  const router = useRouter();
  const { user, refreshUser, switchClub } = useAuth();
  const { setGymBranch } = useGymBranch();
  const { requireLimitAccess } = useSubscriptionAccess();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddGymFormValues>({
    resolver: zodResolver(addGymSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onSubmit',
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

      if (data.ProfilePicture instanceof File) {
        formData.append('ProfilePicture', data.ProfilePicture);
      }
      if (typeof gymAdminId === 'number') {
        formData.append('GymAdminId', String(gymAdminId));
      }

      const result = await createGym(formData);

      if (result.success) {
        const gymId = result.data?.gymId ?? result.data?.id;

        toast.success(result.success);

        if (gymId) {
          setGymBranch({
            gymId,
            gymName: data.GymName.trim(),
            gymLocation: data.Location.trim(),
          });

          const switchResult = await switchClub(gymId);
          if (!switchResult.success) {
            await refreshUser();
          }
        } else {
          await refreshUser();
        }

        form.reset(DEFAULT_VALUES);
        closeSheet();
        onGymAdded?.(gymId);
        router.replace(POST_GYM_REDIRECT_URL);
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
        className="h-10 min-w-18.25"
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
          className="h-10 min-w-22.5"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          form="add-gym-form"
          type="submit"
          className="h-10 min-w-18.25"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add Gym'}
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeSheet();
      }}
    >
      <DialogContent className="flex max-h-[90vh] w-[calc(100vw-32px)] max-w-[520px] flex-col gap-0 overflow-hidden border-primary-blue-400 bg-secondary-blue-700 p-0 text-white">
        <DialogHeader className="shrink-0 border-b border-primary-blue-400 px-5 py-5">
          <DialogTitle className="text-xl font-medium text-white">
            Add New Gym
          </DialogTitle>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
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
            </form>
          </FormProvider>
        </div>
        <DialogFooter className="shrink-0 border-t border-primary-blue-400 bg-secondary-blue-700 px-5 py-4">
          {footer}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddGym;
