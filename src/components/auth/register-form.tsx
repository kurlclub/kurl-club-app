'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Sparkles } from 'lucide-react';
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

const regionOptions = [
  { label: 'India', value: 'India' },
  { label: 'Middle East', value: 'Middle East' },
  { label: 'Southeast Asia', value: 'Southeast Asia' },
  { label: 'Europe', value: 'Europe' },
  { label: 'North America', value: 'North America' },
  { label: 'South America', value: 'South America' },
  { label: 'Africa', value: 'Africa' },
  { label: 'Australia & New Zealand', value: 'Australia & New Zealand' },
  { label: 'Other', value: 'Other' },
];

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
                disabled={isPending}
                name="region"
                label="Region"
                options={regionOptions}
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
        <DialogContent className="max-w-md border-0 bg-linear-to-br from-primary-blue-500 via-secondary-blue-500 to-primary-blue-600 text-white p-0 overflow-hidden">
          <div className="relative px-6 pt-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center animate-bounce">
                <Image
                  src={'/assets/svg/success.svg'}
                  alt="Success"
                  width={32}
                  height={32}
                  className="w-auto"
                />
              </div>
            </div>

            <DialogTitle className="text-2xl font-bold">
              Registration Successful!
            </DialogTitle>
            <p className="text-sm text-white/80 mt-1">
              Your account has been created
            </p>
          </div>

          <div className="px-6 py-3 space-y-5">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3">
              <DialogDescription className="text-[14px] text-white leading-relaxed">
                Thanks for registering! Our team will review your details and
                contact you shortly to help set up your KurlClub account.
              </DialogDescription>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-primary-green-400/20 border border-primary-green-400 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary-green-300 text-xs font-bold">
                    ✓
                  </span>
                </div>
                <div>
                  <p className="font-medium text-white">Account Created</p>
                  <p className="text-white/70 text-xs">
                    You can now log in once approved
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-primary-green-400/20 border border-primary-green-400 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary-green-300 text-xs font-bold">
                    ✓
                  </span>
                </div>
                <div>
                  <p className="font-medium text-white">Email Sent</p>
                  <p className="text-white/70 text-xs">
                    Check your inbox for confirmation
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-secondary-yellow-150/10 border border-secondary-yellow-150/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-secondary-yellow-150" />
                <p className="text-sm font-semibold text-secondary-yellow-150">
                  Need Help?
                </p>
              </div>
              <p className="text-xs text-white/70 mb-3">
                Our support team is ready to help you get started.
              </p>
              <Link
                href="mailto:support@kurlclub.com"
                className="inline-flex items-center gap-2 px-3 py-2 bg-primary-green-500 text-primary-blue-500 hover:bg-primary-green-600 text-sm font-medium rounded-md transition-colors"
              >
                <Mail className="h-3.5 w-3.5" />
                Contact Support
              </Link>
            </div>
          </div>

          <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSuccessOpen(false)}
              className="flex-1 h-10"
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={() => {
                setIsSuccessOpen(false);
                window.location.href = '/auth/login';
              }}
              className="flex-1 h-10"
            >
              Go to Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default RegisterForm;
