import { useState } from 'react';
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
import { updateTrainerPassword } from '@/services/staff';

const updatePasswordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

type UpdatePasswordData = z.infer<typeof updatePasswordSchema>;

interface UpdatePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  id: number | number;
}

export function UpdatePasswordDialog({
  open,
  onOpenChange,
  id,
}: UpdatePasswordDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdatePasswordData>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      newPassword: '',
    },
  });

  const onSubmit = async (data: UpdatePasswordData) => {
    setIsSubmitting(true);
    try {
      const result = await updateTrainerPassword(id, data.newPassword);
      if (result.success) {
        toast.success(result.success);
        form.reset();
        onOpenChange(false);
      } else {
        toast.error(result.error || 'Failed to update password');
      }
    } catch {
      toast.error('Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-secondary-blue-800 border-primary-blue-400">
        <DialogHeader>
          <DialogTitle>Update Password</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <KFormField
              fieldType={KFormFieldType.PASSWORD}
              control={form.control}
              name="newPassword"
              label="New Password"
              placeholder="Enter new password"
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
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
