'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
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
import { submitSelfOnboarding } from '@/services/auth/auth';

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name'),
  gymName: z.string().trim().min(2, 'Enter gym name'),
  email: z.email('Enter a valid email address'),
  phoneNumber: z
    .string()
    .trim()
    .min(10, 'Enter a valid phone number')
    .regex(/^[0-9+()\-\s]+$/, 'Phone number contains invalid characters'),
  location: z.string().trim().min(2, 'Enter gym location'),
  region: z.string().trim().min(1, 'Select your region'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const personalDetailsFields: Array<keyof RegisterFormData> = [
  'name',
  'email',
  'phoneNumber',
];

function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  const { data: countryOptions = [], isLoading: isLoadingCountries } = useQuery(
    {
      queryKey: ['countries'],
      queryFn: async () => {
        const res = await fetch(
          'https://restcountries.com/v3.1/all?fields=name'
        );
        if (!res.ok) throw new Error('Failed to fetch countries');
        const data: { name: { common: string } }[] = await res.json();
        return data
          .map((country) => ({
            label: country.name.common,
            value: country.name.common,
          }))
          .sort((a, b) => a.label.localeCompare(b.label));
      },
      staleTime: Infinity,
    }
  );

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      gymName: '',
      email: '',
      phoneNumber: '',
      location: '',
      region: '',
    },
    shouldUnregister: false,
  });

  const isPersonalDetailsStep = currentStep === 1;

  const handleNextStep = async () => {
    const isValid = await form.trigger(personalDetailsFields);

    if (!isValid) {
      return;
    }

    setCurrentStep(2);
  };

  const handleGymSubmit = async () => {
    const gymDetailsFields: Array<keyof RegisterFormData> = [
      'gymName',
      'location',
      'region',
    ];
    const isValid = await form.trigger(gymDetailsFields);

    if (!isValid) {
      console.log('Gym details validation failed');
      return;
    }

    const formData = form.getValues();
    onSubmit(formData);
  };

  const onSubmit = (data: RegisterFormData) => {
    startTransition(async () => {
      try {
        const payload = {
          contactName: data.name,
          email: data.email,
          phoneNumber: data.phoneNumber,
          gymName: data.gymName,
          gymLocation: data.location,
          region: data.region,
        };
        const response = await submitSelfOnboarding(payload);

        toast.success(
          response.message || 'Registration submitted successfully'
        );
        setIsSuccessOpen(true);
        form.reset();
        setCurrentStep(1);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to submit registration request'
        );
      }
    });
  };

  return (
    <>
      <AuthWrapper
        header={{
          title: 'Register',
          description: isPersonalDetailsStep
            ? 'Step 1 of 2: Personal details'
            : 'Step 2 of 2: Gym details',
        }}
        footer={{
          linkUrl: '/auth/login',
          linkText: 'Already have an account?',
          isLogin: true,
          linkBtnText: 'Login',
        }}
      >
        <Form {...form}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (isPersonalDetailsStep) {
                void handleNextStep();
                return;
              }

              void handleGymSubmit();
            }}
            className="flex flex-col gap-4 sm:gap-6"
          >
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-secondary-blue-500 p-2">
              <div
                className={`rounded-md px-3 py-2 text-center text-sm font-medium transition ${
                  isPersonalDetailsStep
                    ? 'bg-secondary-blue-500 text-white'
                    : 'text-muted-foreground'
                }`}
              >
                Personal details
              </div>
              <div
                className={`rounded-md px-3 py-2 text-center text-sm font-medium transition ${
                  isPersonalDetailsStep
                    ? 'text-muted-foreground'
                    : 'bg-secondary-blue-500 text-white'
                }`}
              >
                Gym details
              </div>
            </div>

            <div
              className={
                isPersonalDetailsStep
                  ? 'flex flex-col gap-4 sm:gap-6'
                  : 'hidden'
              }
            >
              <KFormField
                fieldType={KFormFieldType.INPUT}
                control={form.control}
                disabled={isPending}
                name="name"
                label="Enter name"
              />
              <KFormField
                fieldType={KFormFieldType.INPUT}
                control={form.control}
                disabled={isPending}
                name="email"
                label="Email"
                type="email"
              />
              <KFormField
                fieldType={KFormFieldType.PHONE_INPUT}
                control={form.control}
                disabled={isPending}
                name="phoneNumber"
                label="Phone number"
                type="tel"
              />
            </div>

            <div
              className={
                !isPersonalDetailsStep
                  ? 'flex flex-col gap-4 sm:gap-6'
                  : 'hidden'
              }
            >
              <KFormField
                fieldType={KFormFieldType.INPUT}
                control={form.control}
                disabled={isPending}
                name="gymName"
                label="Gym name"
              />
              <KFormField
                fieldType={KFormFieldType.INPUT}
                control={form.control}
                disabled={isPending}
                name="location"
                label="Location"
                type="text"
              />
              <KFormField
                fieldType={KFormFieldType.SELECT}
                control={form.control}
                disabled={isPending || isLoadingCountries}
                name="region"
                label="Region"
                options={countryOptions}
                enableSearch
              />
            </div>

            {isPersonalDetailsStep ? (
              <Button
                type="submit"
                disabled={isPending}
                className="px-3 py-4 h-11.5"
              >
                Continue
              </Button>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  className="h-11.5 flex-1"
                  onClick={() => setCurrentStep(1)}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="h-11.5 flex-1"
                >
                  {isPending ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </AuthWrapper>

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
              Registration Successful!
            </DialogTitle>
            <DialogDescription className="mt-2 max-w-xs text-sm leading-relaxed text-white/60">
              Thanks for registering! Our team will review your details and
              reach out shortly to help set up your KurlClub account.
            </DialogDescription>
          </div>

          <div className="mt-6 space-y-2.5 px-6">
            <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-3">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-green-500/15 text-primary-green-500">
                <Check className="size-4" strokeWidth={3} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  Account created
                </p>
                <p className="text-xs text-white/50">
                  You can log in once your account is approved
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

          <div className="mt-6 flex flex-col gap-3 border-t border-white/10 px-6 py-5">
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
