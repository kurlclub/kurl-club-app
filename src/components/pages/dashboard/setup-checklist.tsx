'use client';

import Image from 'next/image';
import Link from 'next/link';

import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import {
  ArrowRight,
  CircleCheck,
  Dumbbell,
  Store,
  Ticket,
  UserPlus,
} from 'lucide-react';
import { Dialog as DialogPrimitive } from 'radix-ui';

import { useGymFormOptions } from '@/hooks/use-gymform-options';
import { useGymBranch } from '@/providers/gym-branch-provider';
import { useDashboardData } from '@/services/dashboard';

interface SetupStep {
  id: string;
  title: string;
  href: string;
  icon: React.ReactNode;
  /** Accent classes for the icon badge. */
  accent: string;
  required: boolean;
  done: boolean;
}

function SetupChecklist() {
  const { gymBranch } = useGymBranch();
  const gymId = gymBranch?.gymId || 0;

  const { formOptions } = useGymFormOptions(gymId || undefined);
  const { data: dashboardData } = useDashboardData(gymId);

  const steps: SetupStep[] = [
    {
      id: 'gym',
      title: 'Add gym details',
      href: '/account-settings',
      icon: <Store size={20} strokeWidth={1.75} />,
      accent: 'bg-primary-green-500/15 text-primary-green-500',
      required: true,
      done: !!gymId,
    },
    {
      id: 'membership',
      title: 'Add membership plans',
      href: '/plans-and-workouts',
      icon: <Ticket size={20} strokeWidth={1.75} />,
      accent: 'bg-[#8b7cf6]/15 text-[#8b7cf6]',
      required: true,
      done: (formOptions?.membershipPlans?.length ?? 0) > 0,
    },
    {
      id: 'workout',
      title: 'Add workout plans',
      href: '/plans-and-workouts?tab=workout-plans',
      icon: <Dumbbell size={20} strokeWidth={1.75} />,
      accent: 'bg-semantic-blue-500/15 text-semantic-blue-500',
      required: false,
      done: (formOptions?.workoutPlans?.length ?? 0) > 0,
    },
    {
      id: 'members',
      title: 'Add members',
      href: '/members',
      icon: <UserPlus size={20} strokeWidth={1.75} />,
      accent: 'bg-neutral-ochre-500/15 text-neutral-ochre-500',
      required: false,
      done: (dashboardData?.totalMembers ?? 0) > 0,
    },
  ];

  const allDone = steps.every((s) => s.done);
  const nextStep = steps.find((s) => !s.done);

  // Show until every step is complete; there's no manual close.
  if (!gymId || allDone) return null;

  const renderStep = (step: SetupStep) => {
    const isNext = step.id === nextStep?.id;

    const content = (
      <>
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-full ${step.accent} ${step.done ? '' : 'opacity-60'}`}
        >
          {step.icon}
        </span>

        <p
          className={`flex-1 text-base font-medium ${step.done ? 'text-white' : 'text-white/45'}`}
        >
          {step.title}
          {step.required && <span className="ml-1 text-alert-red-400">*</span>}
        </p>

        {step.done ? (
          <CircleCheck
            size={22}
            strokeWidth={1.75}
            className="shrink-0 text-primary-green-500"
          />
        ) : (
          <ArrowRight
            size={20}
            className="shrink-0 text-white/30 transition-transform group-hover:translate-x-0.5 group-hover:text-primary-green-500"
          />
        )}
      </>
    );

    // The active step gets a gradient border; the rest get a flat hairline.
    if (isNext) {
      return (
        <div
          key={step.id}
          className="rounded-[10px] bg-[linear-gradient(135deg,#FFFFFF_0%,#D3F702_10%,#282b32_50%,#282b32_100%)] p-px"
        >
          <Link
            href={step.href}
            className="group flex items-center gap-2.5 rounded-[10px] bg-secondary-blue-500 p-3 pr-5 transition-colors hover:bg-secondary-blue-600"
          >
            {content}
          </Link>
        </div>
      );
    }

    return (
      <Link
        key={step.id}
        href={step.href}
        className={`group flex items-center gap-2.5 rounded-[10px] border border-white/5 p-3 pr-5 transition-colors ${
          step.done
            ? 'bg-secondary-blue-600'
            : 'bg-secondary-blue-600/40 hover:bg-secondary-blue-600/60'
        }`}
      >
        {content}
      </Link>
    );
  };

  return (
    <DialogPrimitive.Root open>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          onEscapeKeyDown={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-[808px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[10px] border border-white/10 bg-primary-blue-500 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/5 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <VisuallyHidden>
            <DialogPrimitive.Title>
              Get started with KurlClub
            </DialogPrimitive.Title>
          </VisuallyHidden>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left: banner image */}
            <div className="relative hidden min-h-full md:block">
              <Image
                src="/assets/png/setup-banner.png"
                alt="Get started with KurlClub"
                fill
                sizes="(min-width: 768px) 50vw, 0px"
                className="object-cover"
                priority
              />
            </div>

            {/* Right: title, description and step cards */}
            <div className="flex flex-col gap-[32px] px-6 py-[50px]">
              <div className="flex flex-col gap-2.5">
                <h2 className="text-2xl font-bold uppercase tracking-tight text-white">
                  Get started with{' '}
                  <span className="text-primary-green-500">Kurl</span>
                </h2>
                <p className="text-[15px] leading-relaxed text-secondary-pink-50">
                  Add your first member and KurlClub will start filling this
                  screen with revenue, payments, attendance &amp; member
                  activity
                </p>
              </div>

              <div className="flex flex-col gap-3">{steps.map(renderStep)}</div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export default SetupChecklist;
