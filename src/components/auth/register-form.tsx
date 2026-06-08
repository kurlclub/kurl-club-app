'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { AuthWrapper } from '@/components/auth/auth-wrapper';
import {
  KFormField,
  KFormFieldType,
} from '@/components/shared/form/k-formfield';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import {
  completeSelfOnboarding,
  sendSelfOnboardingOtp,
  verifySelfOnboardingOtp,
} from '@/services/auth/auth';

const OTP_EXPIRY_SECONDS = 300;
const RESEND_COOLDOWN_SECONDS = 40;

const phoneSchema = z.object({
  phoneNumber: z
    .string()
    .trim()
    .min(8, 'Enter a valid phone number')
    .regex(/^[0-9+()\-\s]+$/, 'Phone number contains invalid characters'),
});

const otpSchema = z.object({
  otpCode: z
    .string()
    .min(6, 'Enter the 6-digit code')
    .max(6, 'Enter the 6-digit code'),
});

const accountSchema = z
  .object({
    contactName: z.string().trim().min(2, 'Enter your full name'),
    email: z.email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type PhoneFormData = z.infer<typeof phoneSchema>;
type OtpFormData = z.infer<typeof otpSchema>;
type AccountFormData = z.infer<typeof accountSchema>;

type Step = 'phone' | 'otp' | 'account';

const formatTime = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

const StepProgress = ({ current }: { current: number }) => (
  <div className="flex items-center gap-3">
    {[1, 2, 3].map((segment) => (
      <div
        key={segment}
        className={`h-1 flex-1 rounded-full transition-colors ${
          segment <= current ? 'bg-primary-green-500' : 'bg-secondary-blue-500'
        }`}
      />
    ))}
  </div>
);

function RegisterForm() {
  const [step, setStep] = useState<Step>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [expirySeconds, setExpirySeconds] = useState(0);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phoneNumber: '' },
  });

  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otpCode: '' },
  });

  const accountForm = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      contactName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Countdown for OTP expiry and resend cooldown while on the OTP step
  useEffect(() => {
    if (step !== 'otp') return;
    if (expirySeconds <= 0 && resendSeconds <= 0) return;

    const id = setInterval(() => {
      setExpirySeconds((s) => (s > 0 ? s - 1 : 0));
      setResendSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);

    return () => clearInterval(id);
  }, [step, expirySeconds, resendSeconds]);

  const startTimers = () => {
    setExpirySeconds(OTP_EXPIRY_SECONDS);
    setResendSeconds(RESEND_COOLDOWN_SECONDS);
  };

  const handleSendOtp = phoneForm.handleSubmit(async (data) => {
    setIsSendingOtp(true);
    try {
      const response = await sendSelfOnboardingOtp(data.phoneNumber);
      toast.success(response?.message || 'OTP sent via WhatsApp');
      setPhoneNumber(data.phoneNumber);
      otpForm.reset({ otpCode: '' });
      startTimers();
      setStep('otp');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to send OTP'
      );
    } finally {
      setIsSendingOtp(false);
    }
  });

  const handleResend = async () => {
    if (resendSeconds > 0 || isSendingOtp) return;
    setIsSendingOtp(true);
    try {
      const response = await sendSelfOnboardingOtp(phoneNumber);
      toast.success(response?.message || 'OTP resent');
      otpForm.reset({ otpCode: '' });
      startTimers();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to resend OTP'
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerify = otpForm.handleSubmit(async (data) => {
    setIsVerifying(true);
    try {
      const response = await verifySelfOnboardingOtp(phoneNumber, data.otpCode);
      toast.success(response?.message || 'Phone number verified');
      setStep('account');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Invalid or expired OTP'
      );
    } finally {
      setIsVerifying(false);
    }
  });

  const handleChangeNumber = () => {
    otpForm.reset({ otpCode: '' });
    setExpirySeconds(0);
    setResendSeconds(0);
    setStep('phone');
  };

  const handleCreateAccount = accountForm.handleSubmit(async (data) => {
    setIsCreating(true);
    try {
      const response = await completeSelfOnboarding({
        contactName: data.contactName,
        email: data.email,
        phoneNumber,
        password: data.password,
      });
      toast.success(response?.message || 'Account created successfully');
      setIsSuccessOpen(true);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create account'
      );
    } finally {
      setIsCreating(false);
    }
  });

  return (
    <>
      {step === 'phone' && (
        <AuthWrapper
          header={{
            title: 'Sign up',
            description: 'Step 1 of 3: Phone number',
          }}
          footer={{
            linkUrl: '/auth/login',
            linkText: 'Already have an account?',
            isLogin: true,
            linkBtnText: 'Login',
          }}
        >
          <StepProgress current={1} />
          <Form {...phoneForm}>
            <form
              onSubmit={handleSendOtp}
              className="mt-6 flex flex-col gap-4 sm:gap-6"
            >
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-white">
                  Phone number <span className="text-alert-red-400">*</span>
                </span>
                <KFormField
                  fieldType={KFormFieldType.PHONE_INPUT}
                  control={phoneForm.control}
                  disabled={isSendingOtp}
                  name="phoneNumber"
                  type="tel"
                />
                <p className="text-sm text-white/70">
                  We&apos;ll send an OTP to this number via WhatsApp.
                </p>
              </div>
              <Button
                type="submit"
                disabled={isSendingOtp}
                className="h-11.5 px-3 py-4"
              >
                {isSendingOtp ? 'Sending...' : 'Send OTP'}
              </Button>
            </form>
          </Form>
        </AuthWrapper>
      )}

      {step === 'otp' && (
        <AuthWrapper
          header={{
            title: 'Sign up',
            description: 'Step 2 of 3: Verify OTP',
          }}
        >
          <StepProgress current={2} />
          <div className="mt-6">
            <p className="text-sm text-white/70">
              Enter the 6-digit code sent to
            </p>
            <p className="text-base font-semibold text-white">{phoneNumber}</p>
          </div>
          <Form {...otpForm}>
            <form onSubmit={handleVerify} className="mt-5 flex flex-col">
              <KFormField
                fieldType={KFormFieldType.OTP}
                control={otpForm.control}
                name="otpCode"
              />

              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-primary-blue-50">
                  OTP expires in{' '}
                  <span className="font-semibold text-primary-green-500">
                    {formatTime(expirySeconds)}
                  </span>
                </span>
                <Button
                  type="button"
                  variant="link"
                  onClick={handleResend}
                  disabled={resendSeconds > 0 || isSendingOtp}
                  className="h-auto p-0 font-normal text-primary-green-100 disabled:opacity-50"
                >
                  {isSendingOtp
                    ? 'Sending...'
                    : resendSeconds > 0
                      ? `Resend in ${resendSeconds}s`
                      : 'Resend'}
                </Button>
              </div>

              <Button
                type="submit"
                disabled={isVerifying || expirySeconds <= 0}
                className="mt-6 h-11.5 px-3 py-4"
              >
                {isVerifying ? 'Verifying...' : 'Continue'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleChangeNumber}
                disabled={isVerifying}
                className="mt-3 h-11.5"
              >
                Change number
              </Button>
            </form>
          </Form>
        </AuthWrapper>
      )}

      {step === 'account' && (
        <AuthWrapper
          header={{
            title: 'Sign up',
            description: 'Step 3 of 3: Account details',
          }}
        >
          <StepProgress current={3} />
          <p className="mt-6 text-sm text-white/70">
            Signing up with{' '}
            <span className="font-semibold text-white">{phoneNumber}</span>{' '}
            <button
              type="button"
              onClick={handleChangeNumber}
              className="font-medium text-primary-green-500 hover:underline"
            >
              Change
            </button>
          </p>
          <Form {...accountForm}>
            <form
              onSubmit={handleCreateAccount}
              className="mt-5 flex flex-col gap-4 sm:gap-6"
            >
              <KFormField
                fieldType={KFormFieldType.INPUT}
                control={accountForm.control}
                disabled={isCreating}
                name="contactName"
                label="Full name"
              />
              <KFormField
                fieldType={KFormFieldType.INPUT}
                control={accountForm.control}
                disabled={isCreating}
                name="email"
                label="Email"
                type="email"
              />
              <KFormField
                fieldType={KFormFieldType.PASSWORD}
                control={accountForm.control}
                disabled={isCreating}
                name="password"
                label="Password"
              />
              <KFormField
                fieldType={KFormFieldType.PASSWORD}
                control={accountForm.control}
                disabled={isCreating}
                name="confirmPassword"
                label="Confirm password"
              />
              <Button
                type="submit"
                disabled={isCreating}
                className="h-11.5 px-3 py-4"
              >
                {isCreating ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
          </Form>
        </AuthWrapper>
      )}

      <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent className="max-w-sm overflow-hidden border border-white/10 bg-secondary-blue-700 p-0 text-white">
          <div className="relative flex flex-col items-center px-6 pt-10 text-center">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(211,247,2,0.16),transparent)]" />

            <div className="relative mb-5">
              <span className="absolute inset-0 animate-ping rounded-full bg-primary-green-500/20" />
              <div className="relative flex size-16 items-center justify-center rounded-full bg-primary-green-500 shadow-[0_0_30px_-4px_rgba(211,247,2,0.6)]">
                <Check
                  className="size-8 text-primary-blue-500"
                  strokeWidth={3}
                />
              </div>
            </div>

            <DialogTitle className="text-xl font-bold tracking-tight">
              Account Created!
            </DialogTitle>
            <DialogDescription className="mt-2 max-w-xs text-sm leading-relaxed text-white/60">
              Your KurlClub account is ready. Log in to start setting up your
              gym.
            </DialogDescription>
          </div>

          <div className="mt-4 space-y-2.5 px-6">
            <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-3">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-green-500/15 text-primary-green-500">
                <Check className="size-4" strokeWidth={3} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  Account created
                </p>
                <p className="text-xs text-white/50">
                  You can log in right away
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-3">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-green-500/15 text-primary-green-500">
                <Mail className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  Confirmation email sent
                </p>
                <p className="text-xs text-white/50">
                  Check your inbox for the details
                </p>
              </div>
            </div>
          </div>

          <div className="mt-2 flex flex-col gap-3 border-t border-white/10 px-6 py-5">
            <Button
              type="button"
              className="h-11 w-full"
              onClick={() => {
                setIsSuccessOpen(false);
                window.location.href = '/auth/login';
              }}
            >
              Go to Login
            </Button>
            <p className="text-center text-xs text-white/40">
              Need help?{' '}
              <Link
                href="mailto:support@kurlclub.com"
                className="inline-flex items-center gap-1 font-medium text-primary-green-500 hover:underline"
              >
                Contact support
              </Link>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default RegisterForm;
