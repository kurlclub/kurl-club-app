'use client';

import Link from 'next/link';
import { useState } from 'react';

import {
  ArrowRight,
  Check,
  CreditCard,
  Dumbbell,
  Sparkles,
  Users,
  UsersRound,
  X,
} from 'lucide-react';

import { useGymFormOptions } from '@/hooks/use-gymform-options';
import { useAuth } from '@/providers/auth-provider';
import { useGymBranch } from '@/providers/gym-branch-provider';
import { useDashboardData } from '@/services/dashboard';

const DISMISS_KEY = 'kc_dashboard_setup_dismissed';

const readDismissedIds = (): number[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

type StepGroup = 'required' | 'optional';

interface SetupStep {
  id: string;
  group: StepGroup;
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  done: boolean;
}

function SetupChecklist() {
  const { user } = useAuth();
  const { gymBranch } = useGymBranch();
  const gymId = gymBranch?.gymId || 0;

  const { formOptions } = useGymFormOptions(gymId || undefined);
  const { data: dashboardData } = useDashboardData(gymId);

  // Per-gym dismissal so the checklist can reappear for a newly added gym.
  const [dismissedIds, setDismissedIds] = useState<number[]>(readDismissedIds);
  const dismissed = dismissedIds.includes(gymId);

  const handleDismiss = () => {
    if (dismissedIds.includes(gymId)) return;
    const next = [...dismissedIds, gymId];
    setDismissedIds(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(DISMISS_KEY, JSON.stringify(next));
    }
  };

  const steps: SetupStep[] = [
    {
      id: 'membership',
      group: 'required',
      title: 'Create a membership plan',
      description:
        'Required before you can add members and start billing them.',
      href: '/plans-and-workouts',
      icon: <CreditCard size={18} strokeWidth={1.75} />,
      done: (formOptions?.membershipPlans?.length ?? 0) > 0,
    },
    {
      id: 'members',
      group: 'required',
      title: 'Add your first member',
      description: 'Start building your member list and assign a plan.',
      href: '/members',
      icon: <Users size={18} strokeWidth={1.75} />,
      done: (dashboardData?.totalMembers ?? 0) > 0,
    },
    {
      id: 'team',
      group: 'optional',
      title: 'Add your team',
      description: 'Invite trainers and staff to help run your gym.',
      href: '/staff-management',
      icon: <UsersRound size={18} strokeWidth={1.75} />,
      done: (formOptions?.trainers?.length ?? 0) > 0,
    },
    {
      id: 'workout',
      group: 'optional',
      title: 'Add a workout plan',
      description: 'Build workout routines you can assign to members.',
      href: '/plans-and-workouts?tab=workout-plans',
      icon: <Dumbbell size={18} strokeWidth={1.75} />,
      done: (formOptions?.workoutPlans?.length ?? 0) > 0,
    },
  ];

  const requiredSteps = steps.filter((s) => s.group === 'required');
  const optionalSteps = steps.filter((s) => s.group === 'optional');
  const requiredDone = requiredSteps.every((s) => s.done);
  const completedCount = steps.filter((s) => s.done).length;
  const allDone = completedCount === steps.length;
  const nextStep = steps.find((s) => !s.done);

  // Hide once everything is done, the user dismissed it, or there's no gym yet.
  if (!gymId || dismissed || allDone) return null;

  const firstName = user?.userName?.split(' ')[0];

  const renderStep = (step: SetupStep) => {
    const isNext = step.id === nextStep?.id;
    return (
      <Link
        key={step.id}
        href={step.href}
        className={`group flex items-start gap-3 rounded-lg border p-3.5 transition-colors ${
          step.done
            ? 'border-white/5 bg-white/[0.02]'
            : isNext
              ? 'border-primary-green-500/40 bg-primary-green-500/[0.06] hover:bg-primary-green-500/[0.1]'
              : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
        }`}
      >
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
            step.done
              ? 'bg-primary-green-500 text-primary-blue-500'
              : 'bg-secondary-blue-500 text-primary-green-500'
          }`}
        >
          {step.done ? <Check size={18} strokeWidth={3} /> : step.icon}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p
              className={`truncate text-sm font-medium ${
                step.done ? 'text-white/50 line-through' : 'text-white'
              }`}
            >
              {step.title}
            </p>
            {isNext && (
              <span className="shrink-0 rounded-full bg-primary-green-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-green-500">
                Next
              </span>
            )}
          </div>
          {!step.done && (
            <p className="mt-0.5 text-xs leading-relaxed text-white/50">
              {step.description}
            </p>
          )}
        </div>

        {!step.done && (
          <ArrowRight
            size={16}
            className="mt-1 shrink-0 text-white/30 transition-transform group-hover:translate-x-0.5 group-hover:text-primary-green-500"
          />
        )}
      </Link>
    );
  };

  return (
    <div className="relative mb-5 overflow-hidden rounded-xl border border-primary-green-500/20 bg-secondary-blue-600/40 p-5 md:p-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(60%_100%_at_15%_0%,rgba(211,247,2,0.12),transparent)]" />

      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss setup guide"
        className="absolute right-4 top-4 rounded-md p-1 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
      >
        <X size={16} />
      </button>

      <div className="relative flex flex-col gap-1">
        <div className="flex items-center gap-2 text-primary-green-500">
          <Sparkles size={18} />
          <span className="text-sm font-medium">Getting started</span>
        </div>
        <h3 className="text-lg font-semibold text-white">
          {firstName ? `Welcome, ${firstName}!` : 'Welcome to KurlClub!'} Let’s
          set up {gymBranch?.gymName || 'your gym'}.
        </h3>
        <p className="text-sm text-white/60">
          {requiredDone
            ? 'Your gym is ready. Finish the optional steps whenever you like.'
            : 'Add a membership plan to get started — the rest is optional.'}{' '}
          <span className="font-medium text-white/80">
            {completedCount} of {steps.length} done
          </span>
        </p>
      </div>

      {/* Progress bar */}
      <div className="relative mt-4 h-1.5 w-full overflow-hidden rounded-full bg-secondary-blue-500">
        <div
          className="h-full rounded-full bg-primary-green-500 transition-all duration-500"
          style={{ width: `${(completedCount / steps.length) * 100}%` }}
        />
      </div>

      <div className="relative mt-5 flex flex-col gap-5">
        {/* Required */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-white/70">
              Required
            </span>
            <span className="rounded-full bg-alert-red-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-alert-red-400">
              Must do
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {requiredSteps.map(renderStep)}
          </div>
        </div>

        {/* Optional */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-white/70">
            Optional
          </span>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {optionalSteps.map(renderStep)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SetupChecklist;
