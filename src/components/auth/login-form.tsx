'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { sendEmailVerification } from 'firebase/auth';
import { toast } from 'sonner';
import { z } from 'zod/v4';

import { AuthWrapper } from '@/components/auth/auth-wrapper';
import { EmailSendSuccess } from '@/components/auth/email-send-success';
import {
  KFormField,
  KFormFieldType,
} from '@/components/shared/form/k-formfield';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/providers/auth-provider';
import { LoginSchema } from '@/schemas';
import { extractUserDetails, updateUser } from '@/services/auth/helpers';
import { createSession, deleteSession } from '@/services/auth/session';

export const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [isEmailSend, setIsEmailSend] = useState(false);

  useEffect(() => {
    const emailSend = searchParams.get('emailSend') === 'true';
    setIsEmailSend(emailSend);
  }, [searchParams]);

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    startTransition(async () => {
      try {
        await signIn({
          method: 'login',
          email: values.email,
          password: values.password,
        });
        const user = auth.currentUser;
        if (!user) throw new Error('User not found.');
        if (!user.emailVerified) {
          await sendEmailVerification(user);
          toast.success('Verification email sent. Check your inbox.');
          await auth.signOut();
          await deleteSession();
          router.push('/auth/login?emailSend=true');
          return;
        }
        const userDetails = extractUserDetails(user);
        const token = await user.getIdToken();
        await createSession(token);
        router.push('/dashboard');
        toast.success('Welcome back!');

        // Update user in background (non-blocking)
        updateUser(userDetails).catch(console.error);
      } catch {
        toast.error('Login failed. Check your credentials.');
      }
    });
  };

  if (isEmailSend) return <EmailSendSuccess />;

  return (
    <AuthWrapper
      header={{
        title: 'Login',
        description: 'Welcome back! Let’s get started.',
      }}
      footer={{
        linkUrl: '/auth/register',
        linkText: 'Don’t have an account?',
        isLogin: true,
      }}
      socials
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
            <KFormField
              fieldType={KFormFieldType.PASSWORD}
              control={form.control}
              disabled={isPending}
              name="password"
              label="Password"
            />
          </div>
          <Button
            size="sm"
            variant="link"
            asChild
            className="px-1 font-normal flex justify-start my-3"
          >
            <Link href="/auth/reset">Forgot password?</Link>
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="px-3 py-4 h-[46px]"
          >
            {isPending ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </Form>
    </AuthWrapper>
  );
};
