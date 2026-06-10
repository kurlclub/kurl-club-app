'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { BarChart3, CreditCard, ScanLine, Users } from 'lucide-react';

import AddGym from '@/components/pages/account-settings/tabs/profile-and-gyms-tab/add-gym';
import { Button } from '@/components/ui/button';
import { useSheet } from '@/hooks/use-sheet';
import { useAuth } from '@/providers/auth-provider';

const FEATURES = [
  { icon: Users, label: 'Manage members & memberships' },
  { icon: ScanLine, label: 'Track attendance in real time' },
  { icon: CreditCard, label: 'Collect & monitor payments' },
  { icon: BarChart3, label: 'View reports & analytics' },
] as const;

export default function WelcomeOnboarding() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const { isOpen, openSheet, closeSheet } = useSheet();

  const hasGym = (user?.clubs?.length ?? 0) > 0;

  // Send the user where they belong: login if signed out, dashboard once a gym exists
  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/auth/login');
      return;
    }
    if (hasGym) {
      router.replace('/dashboard');
    }
  }, [isLoading, user, hasGym, router]);

  if (!user || hasGym) return null;

  const firstName = user.userName?.trim().split(' ')[0] || 'there';

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-background-dark md:flex-row">
      {/* Hero image — top banner on mobile, full-height side panel on web */}
      <div className="relative h-[44vh] w-full shrink-0 overflow-hidden md:h-screen md:w-1/2">
        <Image
          src="/assets/png/setup-gym.png"
          alt=""
          fill
          priority
          className="object-cover object-[center_top]"
        />
        {/* Fade into the background: downward on mobile, rightward on web */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background-dark/20 to-background-dark md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-background-dark" />
        <div className="absolute left-8 top-8 sm:left-10 sm:top-10">
          <Image
            src="/assets/svg/logo.svg"
            alt="KurlClub"
            width={150}
            height={34}
            priority
          />
        </div>
      </div>

      {/* Content — over the faded image on mobile, centered beside it on web */}
      <div className="relative z-10 -mt-16 flex flex-1 items-end pb-10 md:mt-0 md:items-center md:pb-0">
        <div className="mx-auto w-full max-w-xl px-6 sm:px-8 md:px-12">
          <div className="flex items-center gap-3">
            <span className="h-0.5 w-4 rounded-full bg-primary-green-500" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-green-500">
              Get Started
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
            Welcome, {firstName}!
          </h1>
          <p className="mt-3 text-base leading-relaxed text-white/60">
            Let&apos;s get started. Add your first gym and unlock everything
            KurlClub has to offer.
          </p>

          <div className="mt-7 flex flex-col gap-3">
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary-blue-600">
                  <Icon className="size-5 text-primary-green-500" />
                </div>
                <span className="text-base font-semibold text-white">
                  {label}
                </span>
              </div>
            ))}
          </div>

          <Button
            className="mt-8 h-12 w-full text-base font-bold"
            onClick={openSheet}
          >
            Add your first gym
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={logout}
            className="mt-3 h-12 w-full text-base"
          >
            Logout
          </Button>
        </div>
      </div>

      <AddGym isOpen={isOpen} closeSheet={closeSheet} />
    </div>
  );
}
