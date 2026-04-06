'use client';

import React from 'react';

import {
  AlertTriangle,
  CalendarClock,
  Crown,
  Rocket,
  ShieldCheck,
} from 'lucide-react';

import { useSubscriptionAccess } from '@/hooks/use-subscription-access';
import { SUBSCRIPTION_ACCESS_LABELS } from '@/lib/subscription/feature-labels';
import { cn, safeFormatDate } from '@/lib/utils';

import { Button } from '../../ui/button';
import { KPremiumListIcon } from '../icons';

type SubscriptionVariant =
  | 'standard'
  | 'premium'
  | 'expiring'
  | 'expired'
  | 'none';

interface SubscriptionCardProps {
  variant?: SubscriptionVariant;
  onSubmit?: () => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  variant,
  onSubmit,
}) => {
  const { subscription, status, daysRemaining, enabledCapabilities } =
    useSubscriptionAccess();
  const planName = subscription?.name || 'No Active Plan';
  const planBadge = subscription?.badge;
  const endDateLabel = safeFormatDate(subscription?.endDate, 'en-GB', 'N/A');
  const billingCycle = subscription?.billingCycle || 'monthly';

  const effectiveVariant: SubscriptionVariant =
    variant ||
    (status === 'expired'
      ? 'expired'
      : status === 'expiring'
        ? 'expiring'
        : status === 'none'
          ? 'none'
          : 'premium');

  const billingCycleLabel =
    billingCycle === 'sixMonths'
      ? '6 months'
      : billingCycle === 'yearly'
        ? 'Yearly'
        : 'Monthly';

  const contentByVariant: Record<
    SubscriptionVariant,
    {
      title: React.ReactNode;
      description: string;
      badge: string;
      icon: React.ReactNode;
      cardClass: string;
      badgeClass: string;
      titleClass: string;
      descriptionClass: string;
      showFeatures: boolean;
      primaryCtaLabel: string;
      secondaryCtaLabel?: string;
    }
  > = {
    standard: {
      title: planName,
      description: `Billing cycle: ${billingCycleLabel} • Ends on ${endDateLabel}`,
      badge: 'Standard',
      icon: <ShieldCheck className="h-4 w-4" />,
      cardClass:
        'border-primary-green-500/35 bg-gradient-to-br from-primary-green-500/15 via-primary-green-500/5 to-secondary-blue-500',
      badgeClass:
        'border-primary-green-400/40 bg-primary-green-500/20 text-primary-green-100',
      titleClass: 'text-white',
      descriptionClass: 'text-secondary-blue-100',
      showFeatures: true,
      primaryCtaLabel: 'See all plans',
    },
    premium: {
      title: (
        <>
          Current plan:{' '}
          <span className="font-bold text-primary-green-200">{planName}</span>
        </>
      ),
      description: `Billing cycle: ${billingCycleLabel} • Ends on ${endDateLabel}${
        typeof daysRemaining === 'number' && daysRemaining >= 0
          ? ` • ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left`
          : ''
      }`,
      badge: planBadge || 'Premium Active',
      icon: <Crown className="h-4 w-4" />,
      cardClass:
        'border-primary-green-400/45 bg-gradient-to-r from-secondary-blue-500 via-secondary-blue-600 to-primary-blue-600',
      badgeClass:
        'border-primary-green-300/40 bg-primary-green-500/20 text-primary-green-100',
      titleClass: 'text-white',
      descriptionClass: 'text-secondary-blue-100',
      showFeatures: true,
      primaryCtaLabel: 'See all plans',
    },
    expiring: {
      title: (
        <>
          Plan expiring soon:{' '}
          <span className="font-bold text-amber-200">{planName}</span>
        </>
      ),
      description: `Renews on ${endDateLabel}${
        typeof daysRemaining === 'number' && daysRemaining >= 0
          ? ` • ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining`
          : ''
      }. Renew now to avoid interruption.`,
      badge: 'Action Needed',
      icon: <CalendarClock className="h-4 w-4" />,
      cardClass:
        'border-amber-400/55 bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-secondary-blue-500',
      badgeClass: 'border-amber-300/40 bg-amber-500/20 text-amber-100',
      titleClass: 'text-amber-100',
      descriptionClass: 'text-amber-100/90',
      showFeatures: true,
      primaryCtaLabel: 'Renew plan',
    },
    expired: {
      title: 'Subscription expired',
      description: `Your plan ended on ${endDateLabel}. Reactivate a plan to restore premium access and capabilities.`,
      badge: 'Expired',
      icon: <AlertTriangle className="h-4 w-4" />,
      cardClass:
        'border-alert-red-400/70 bg-gradient-to-br from-alert-red-500 via-alert-red-600 to-[#8F1420]',
      badgeClass: 'border-white/45 bg-black/20 text-white',
      titleClass: 'text-white',
      descriptionClass: 'text-white/95',
      showFeatures: false,
      primaryCtaLabel: 'Reactivate plan',
    },
    none: {
      title: 'No active subscription',
      description:
        'Pick a plan to unlock attendance automation, payment insights, and advanced reports.',
      badge: 'Get Started',
      icon: <Rocket className="h-4 w-4" />,
      cardClass:
        'border-secondary-blue-300/45 bg-gradient-to-r from-secondary-blue-500 via-secondary-blue-600 to-primary-blue-600',
      badgeClass:
        'border-secondary-blue-200/40 bg-secondary-blue-400/20 text-secondary-blue-100',
      titleClass: 'text-white',
      descriptionClass: 'text-secondary-blue-100',
      showFeatures: false,
      primaryCtaLabel: 'Explore plans',
    },
  };

  const activeContent = contentByVariant[effectiveVariant];

  const enabledFeatures = enabledCapabilities
    .map((capability) => SUBSCRIPTION_ACCESS_LABELS[capability])
    .filter(Boolean)
    .slice(0, 4);

  const renderButtons = () => {
    return (
      <>
        <Button
          onClick={onSubmit}
          variant="secondary"
          className={cn(
            'h-11 rounded-lg',
            effectiveVariant === 'expired' || effectiveVariant === 'expiring'
              ? 'bg-white text-secondary-blue-900 hover:bg-secondary-blue-100'
              : 'bg-primary-green-400 text-primary-blue-800 hover:bg-primary-green-300'
          )}
        >
          {activeContent.primaryCtaLabel}
        </Button>
        {activeContent.secondaryCtaLabel && (
          <Button
            onClick={onSubmit}
            variant="outline"
            className={cn(
              'h-11 rounded-lg border',
              effectiveVariant === 'expired' || effectiveVariant === 'expiring'
                ? 'border-white/60 bg-transparent text-white hover:bg-white/10'
                : 'border-secondary-blue-300/60 bg-transparent text-secondary-blue-100 hover:bg-secondary-blue-400/20'
            )}
          >
            {activeContent.secondaryCtaLabel}
          </Button>
        )}
      </>
    );
  };

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-2xl border p-5 md:p-6',
        activeContent.cardClass
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[url('/assets/svg/subscription-bg.svg')] bg-no-repeat bg-right bg-contain opacity-45" />
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/5 blur-3xl" />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div
          className={cn(
            'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide',
            activeContent.badgeClass
          )}
        >
          {activeContent.icon}
          <span>{activeContent.badge}</span>
        </div>
      </div>

      <h1
        className={cn(
          'relative z-10 mt-3 text-2xl font-semibold leading-snug',
          activeContent.titleClass
        )}
      >
        {activeContent.title}
      </h1>
      <p
        className={cn(
          'relative z-10 mt-2 text-sm leading-relaxed',
          activeContent.descriptionClass
        )}
      >
        {activeContent.description}
      </p>

      {effectiveVariant === 'expired' && (
        <div className="relative z-10 mt-4 rounded-xl border border-white/25 bg-black/15 p-3.5 backdrop-blur-[1px]">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/90">
            Access paused
          </p>
          <ul className="mt-2 space-y-1.5 text-xs text-white/90">
            <li>Premium modules are locked until renewal</li>
            <li>Historical data remains safe and available</li>
            <li>Renew now to continue without setup changes</li>
          </ul>
        </div>
      )}

      {enabledFeatures.length > 0 && activeContent.showFeatures && (
        <ul className="relative z-10 mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
          {enabledFeatures.map((feature, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 rounded-lg bg-white/5 px-2.5 py-2 text-sm font-semibold leading-normal text-secondary-blue-100"
            >
              <KPremiumListIcon />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="relative z-10 mt-5 flex flex-wrap items-center gap-2">
        {renderButtons()}
      </div>
    </div>
  );
};
