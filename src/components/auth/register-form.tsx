'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import {  Mail, Sparkles } from 'lucide-react';
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

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name'),
  gymName: z.string().trim().min(2, 'Enter gym name'),
  email: z.email('Enter a valid email address'),
  phoneNumber: z
    .string()
    .trim()
    .min(10, 'Enter a valid phone number')
    .regex(/^[0-9+()\-\s]+$/, 'Phone number contains invalid characters'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

function RegisterForm() {
  const [isSuccessOpen, setIsSuccessOpen] = useState(true);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      gymName: '',
      email: '',
      phoneNumber: '',
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    void data;
    setIsSuccessOpen(true);
    form.reset();
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
              name="name"
              label="Enter name"
            />
            <KFormField
              fieldType={KFormFieldType.INPUT}
              control={form.control}
              name="gymName"
              label="Gym name"
            />
            <KFormField
              fieldType={KFormFieldType.INPUT}
              control={form.control}
              name="email"
              label="Email"
              type="email"
            />
            <KFormField
              fieldType={KFormFieldType.PHONE_INPUT}
              control={form.control}
              name="phoneNumber"
              label="Phone number"
              type="tel"
            />

            <Button type="submit" className="px-3 py-4 h-11.5">
              Submit
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
