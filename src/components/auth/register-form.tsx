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

function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

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
  });

  const onSubmit = (data: RegisterFormData) => {
    startTransition(async () => {
      try {
        const response = await submitSelfOnboarding({
          contactName: data.name,
          email: data.email,
          phoneNumber: data.phoneNumber,
          gymName: data.gymName,
          gymLocation: data.location,
          region: data.region,
        });

        toast.success(
          response.message || 'Registration submitted successfully'
        );
        setIsSuccessOpen(true);
        form.reset();
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
          description: 'Tell us a bit about yourself',
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
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4 sm:gap-6"
          >
            <KFormField
              fieldType={KFormFieldType.INPUT}
              control={form.control}
              disabled={isPending}
              name="name"
              label="Enter name"
            />
            <div className="flex items-center gap-2">
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
            </div>
            <KFormField
              fieldType={KFormFieldType.SELECT}
              control={form.control}
              disabled={isPending}
              name="region"
              label="Region"
              options={regionOptions}
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

            <Button
              type="submit"
              disabled={isPending}
              className="px-3 py-4 h-11.5"
            >
              {isPending ? 'Submitting...' : 'Submit'}
            </Button>
          </form>
        </Form>
      </AuthWrapper>

      <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent className="max-w-md bg-secondary-blue-500 border border-secondary-blue-200/20 text-white p-4">
          {/* Centered Content */}
          <div className="flex flex-col items-center text-center gap-2">
            <Image
              src={'/assets/svg/success.svg'}
              alt="Success"
              width={28}
              height={28}
              className="w-auto max-h-[100px]"
            />

            {/* Title */}
            <DialogTitle className="text-xl font-semibold">
              Thanks for reaching out!
            </DialogTitle>

            {/* Description */}
            <DialogDescription className="text-sm text-primary-blue-100 max-w-sm leading-relaxed">
              Our team will contact you shortly to help set up your KurlClub
              account.
            </DialogDescription>
          </div>

          {/* Help Card */}
          <div className="mt-1 rounded-lg border border-white/10 bg-secondary-blue-400/30 p-3">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-secondary-yellow-150 mt-0.5" />
              <p className="text-sm text-primary-blue-50 leading-relaxed">
                Need help sooner? We can fast-track your setup.
              </p>
            </div>

            <Link
              href="mailto:support@kurlclub.com"
              className="mt-2 inline-flex items-center gap-2 text-primary-green-400 hover:text-primary-green-300 transition"
            >
              <Mail className="h-4 w-4" />
              Contact Support
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default RegisterForm;
