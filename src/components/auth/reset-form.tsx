'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';

import { AuthWrapper } from '@/components/auth/auth-wrapper';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';

import { KFormField, KFormFieldType } from '../shared/form/k-formfield';

const resetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ResetFormData = z.infer<typeof resetSchema>;

export function ResetForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (data: ResetFormData) => {
    startTransition(async () => {
      // TODO: Implement password reset API call when backend is ready
      // const result = await forgotPassword(data.email);

      toast.success('Password reset link sent to your email!');
      form.reset();
    });
  };

  return (
    <AuthWrapper
      header={{
        title: 'Reset Password',
        description: 'Enter your email to receive reset instructions',
      }}
      footer={{
        linkUrl: '/auth/login',
        linkText: 'Back to Login',
      }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
          <div className="flex flex-col gap-6 sm:gap-8">
            <KFormField
              fieldType={KFormFieldType.INPUT}
              control={form.control}
              disabled={isPending}
              name="email"
              label="Email address"
            />
          </div>
          <Button
            type="submit"
            disabled={isPending}
            className="px-3 py-4 h-[46px] mt-6"
          >
            {isPending ? 'Sending...' : 'Send Reset OTP'}
          </Button>
        </form>
      </Form>
    </AuthWrapper>
  );
}
