import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  KFormField,
  KFormFieldType,
} from '@/components/shared/form/k-formfield';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { updateStaff } from '@/services/staff';
import { StaffDetails } from '@/types/staff';

const setCredentialsSchema = z.object({
  username: z.string().email('Please enter a valid username email').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SetCredentialsData = z.infer<typeof setCredentialsSchema>;

interface StaffCredentialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  id: number;
  details: StaffDetails | null;
  currentUsername?: string | null;
  onSuccess?: (username: string) => void;
}

export function StaffCredentialsDialog({
  open,
  onOpenChange,
  id,
  details,
  currentUsername,
  onSuccess,
}: StaffCredentialsDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasUsername = Boolean(currentUsername?.trim());

  const form = useForm<SetCredentialsData>({
    resolver: zodResolver(setCredentialsSchema),
    defaultValues: {
      username: currentUsername || '',
      password: '',
    },
  });

  const title = useMemo(
    () => (hasUsername ? 'Reset Password' : 'Set Username & Password'),
    [hasUsername]
  );

  const onSubmit = async (data: SetCredentialsData) => {
    if (!details) {
      toast.error('Staff details not available');
      return;
    }

    const usernameToSend = hasUsername
      ? currentUsername || ''
      : data.username || '';

    if (!usernameToSend.trim()) {
      form.setError('username', { message: 'Username is required' });
      return;
    }

    setIsSubmitting(true);
    try {
      const detailsToSave: StaffDetails = {
        ...details,
        username: usernameToSend,
      };

      const formData = new FormData();
      for (const key in detailsToSave) {
        const formKey = key;
        const value = detailsToSave[key as keyof StaffDetails];

        if (['hasProfilePicture', 'status', 'gymId'].includes(formKey)) {
          continue;
        }

        if (value !== undefined && value !== null) {
          if (formKey === 'profilePicture' && value instanceof File) {
            formData.append(formKey, value);
          } else if (formKey === 'profilePicture' && value === null) {
            formData.append(formKey, 'null');
          } else {
            formData.append(formKey, String(value));
          }
        }
      }

      formData.append('Password', data.password);

      const response = await updateStaff(id, formData, 'staff');

      if (response.status === 'Success') {
        toast.success(
          response.message || 'Staff credentials updated successfully.'
        );
        onSuccess?.(usernameToSend);
        form.reset({
          username: usernameToSend,
          password: '',
        });
        onOpenChange(false);
      } else {
        toast.error(response.message || 'Failed to update staff credentials');
      }
    } catch {
      toast.error('Failed to update staff credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-secondary-blue-800 border-primary-blue-400">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!hasUsername && (
              <KFormField
                fieldType={KFormFieldType.INPUT}
                control={form.control}
                name="username"
                label="Username (Email)"
                placeholder="staff@example.com"
                disabled={isSubmitting}
                type="email"
              />
            )}

            <KFormField
              fieldType={KFormFieldType.PASSWORD}
              control={form.control}
              name="password"
              label={hasUsername ? 'New Password' : 'Password'}
              placeholder="Enter password"
              disabled={isSubmitting}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? 'Saving...'
                  : hasUsername
                    ? 'Reset Password'
                    : 'Save Credentials'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
