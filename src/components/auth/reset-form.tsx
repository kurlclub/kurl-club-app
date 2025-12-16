'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';

import { AuthWrapper } from '@/components/auth/auth-wrapper';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import {
  useForgotPassword,
  useResetPassword,
  useVerifyResetOtp,
} from '@/hooks/use-password-reset';
import {
  forgotPasswordEmailSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from '@/schemas';

import { KFormField, KFormFieldType } from '../shared/form/k-formfield';

type EmailFormData = z.infer<typeof forgotPasswordEmailSchema>;
type OtpFormData = z.infer<typeof verifyOtpSchema>;
type PasswordFormData = z.infer<typeof resetPasswordSchema>;

type Step = 'email' | 'otp' | 'password';

export function ResetForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [savedEmail, setSavedEmail] = useState('');
  const [savedOtp, setSavedOtp] = useState('');
  const [canResend, setCanResend] = useState(true);

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(forgotPasswordEmailSchema),
    defaultValues: { email: '' },
  });

  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { otp: '' },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const sendOtpMutation = useForgotPassword();
  const verifyOtpMutation = useVerifyResetOtp();
  const resetPasswordMutation = useResetPassword();

  const onEmailSubmit = (data: EmailFormData) => {
    setSavedEmail(data.email);
    sendOtpMutation.mutate(data.email, {
      onSuccess: () => {
        toast.success('OTP sent to your email!');
        setStep('otp');
        setCanResend(false);
        setTimeout(() => setCanResend(true), 60000); // 60 seconds cooldown
      },
    });
  };

  const onOtpSubmit = (data: OtpFormData) => {
    if (!savedEmail) {
      toast.error('Email not found. Please start over.');
      setStep('email');
      return;
    }
    setSavedOtp(data.otp);
    verifyOtpMutation.mutate(
      { email: savedEmail, otp: data.otp },
      {
        onSuccess: () => {
          toast.success('OTP verified!');
          setStep('password');
        },
      }
    );
  };

  const onPasswordSubmit = (data: PasswordFormData) => {
    if (!savedEmail || !savedOtp) {
      toast.error('Session expired. Please start over.');
      setStep('email');
      return;
    }
    resetPasswordMutation.mutate(
      { email: savedEmail, otp: savedOtp, newPassword: data.password },
      {
        onSuccess: () => {
          toast.success('Password reset successfully!');
          router.push('/auth/login');
        },
      }
    );
  };

  if (step === 'otp') {
    return (
      <AuthWrapper
        header={{
          title: 'Enter OTP',
          description: savedEmail
            ? `Enter the 6-digit code sent to ${savedEmail}`
            : 'Enter the 6-digit code sent to your email',
        }}
      >
        <Form {...otpForm}>
          <form
            onSubmit={otpForm.handleSubmit(onOtpSubmit)}
            className="flex flex-col"
          >
            <FormField
              control={otpForm.control}
              name="otp"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-4">
                  <FormLabel className="sr-only">OTP Code</FormLabel>
                  <FormControl>
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup className="gap-2 sm:gap-2.5 w-full">
                        <InputOTPSlot
                          index={0}
                          className="rounded-md border border-secondary-blue-400 bg-secondary-blue-500 flex-1 h-12 sm:h-14"
                        />
                        <InputOTPSlot
                          index={1}
                          className="rounded-md border border-secondary-blue-400 bg-secondary-blue-500 flex-1 h-12 sm:h-14"
                        />
                        <InputOTPSlot
                          index={2}
                          className="rounded-md border border-secondary-blue-400 bg-secondary-blue-500 flex-1 h-12 sm:h-14"
                        />
                        <InputOTPSlot
                          index={3}
                          className="rounded-md border border-secondary-blue-400 bg-secondary-blue-500 flex-1 h-12 sm:h-14"
                        />
                        <InputOTPSlot
                          index={4}
                          className="rounded-md border border-secondary-blue-400 bg-secondary-blue-500 flex-1 h-12 sm:h-14"
                        />
                        <InputOTPSlot
                          index={5}
                          className="rounded-md border border-secondary-blue-400 bg-secondary-blue-500 flex-1 h-12 sm:h-14"
                        />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={verifyOtpMutation.isPending}
              className="px-3 py-4 h-[46px] mt-6"
            >
              {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify'}
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Didn&apos;t receive the code?{' '}
              <Button
                type="button"
                variant="link"
                onClick={() => {
                  if (savedEmail) {
                    sendOtpMutation.mutate(savedEmail, {
                      onSuccess: () => {
                        toast.success('OTP resent!');
                        setCanResend(false);
                        setTimeout(() => setCanResend(true), 60000);
                      },
                    });
                  }
                }}
                disabled={sendOtpMutation.isPending || !canResend}
                className="p-0 h-auto font-normal text-primary-green-100 disabled:opacity-50"
              >
                {sendOtpMutation.isPending
                  ? 'Sending...'
                  : !canResend
                    ? 'Wait 60s'
                    : 'Resend'}
              </Button>
            </p>
          </form>
        </Form>
      </AuthWrapper>
    );
  }

  if (step === 'password') {
    return (
      <AuthWrapper
        header={{
          title: 'Set New Password',
          description: 'Enter your new password',
        }}
        footer={{
          linkUrl: '/auth/login',
          linkText: 'Back to Login',
        }}
      >
        <Form {...passwordForm}>
          <form
            onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
            className="flex flex-col"
          >
            <div className="flex flex-col gap-6 sm:gap-8">
              <KFormField
                fieldType={KFormFieldType.PASSWORD}
                control={passwordForm.control}
                name="password"
                label="New Password"
              />
              <KFormField
                fieldType={KFormFieldType.PASSWORD}
                control={passwordForm.control}
                name="confirmPassword"
                label="Confirm Password"
              />
            </div>
            <Button
              type="submit"
              disabled={resetPasswordMutation.isPending}
              className="px-3 py-4 h-[46px] mt-6"
            >
              {resetPasswordMutation.isPending
                ? 'Resetting...'
                : 'Reset Password'}
            </Button>
          </form>
        </Form>
      </AuthWrapper>
    );
  }

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
      <Form {...emailForm}>
        <form
          onSubmit={emailForm.handleSubmit(onEmailSubmit)}
          className="flex flex-col"
        >
          <div className="flex flex-col gap-6 sm:gap-8">
            <KFormField
              fieldType={KFormFieldType.INPUT}
              control={emailForm.control}
              name="email"
              label="Email address"
            />
          </div>
          <Button
            type="submit"
            disabled={sendOtpMutation.isPending}
            className="px-3 py-4 h-[46px] mt-6"
          >
            {sendOtpMutation.isPending ? 'Sending...' : 'Send Reset OTP'}
          </Button>
        </form>
      </Form>
    </AuthWrapper>
  );
}
