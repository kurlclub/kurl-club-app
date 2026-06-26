'use client';

import React from 'react';

import { useSubscriptionAccess } from '@/hooks/use-subscription-access';
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

const UPSELL_FEATURES = [
  'Unlimited members',
  'Exclusive Access to Class & Trainer Scheduling',
  'Automated Payment & Renewal',
  'Member app for the ultimate P.T experience.',
];

type DecorationVariant = 'default' | 'upsell' | 'expired';

/** Subtle diagonal chevron from Figma, stretched into the top-right corner. */
function UnionDecoration({ variant }: { variant: DecorationVariant }) {
  const position =
    variant === 'upsell'
      ? { top: '-12.05%', right: '-25.14%', bottom: '-7.23%', left: '42.94%' }
      : { top: '-20.55%', right: '-9.5%', bottom: '-5.48%', left: '58.58%' };

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute"
      style={{
        ...position,
        backgroundImage: `url(/assets/svg/subscription-card-union-${variant}.svg)`,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
      }}
    />
  );
}

function PrimaryButton({
  onClick,
  tone,
  children,
}: {
  onClick?: () => void;
  tone: 'lime' | 'white';
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className={cn(
        'h-[46px] rounded-lg bg-primary-blue-500 px-5 text-[13px] font-semibold hover:bg-primary-blue-600',
        tone === 'lime' ? 'text-primary-green-500' : 'text-white'
      )}
    >
      {children}
    </Button>
  );
}

function TextButton({
  onClick,
  tone,
  children,
}: {
  onClick?: () => void;
  tone: 'dark' | 'white';
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      className={cn(
        'h-[46px] rounded-lg px-5 text-[13px] font-semibold',
        tone === 'white'
          ? 'text-white hover:bg-white/10'
          : 'text-primary-blue-500 hover:bg-black/5'
      )}
    >
      {children}
    </Button>
  );
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  variant,
  onSubmit,
}) => {
  const { subscription, status, daysRemaining } = useSubscriptionAccess();
  const planName = subscription?.name || 'No Active Plan';
  const endDateLabel = safeFormatDate(subscription?.endDate, 'en-GB', 'N/A');
  const nextBillingDateLabel = safeFormatDate(
    subscription?.nextBillingDate,
    'en-GB',
    'N/A'
  );
  const billingCycle = subscription?.billingCycle || 'monthly';
  const billingCycleLabel =
    billingCycle === 'sixMonths'
      ? '6 months'
      : billingCycle === 'yearly'
        ? 'Yearly'
        : 'Monthly';

  const effectiveVariant: SubscriptionVariant =
    variant ||
    (status === 'expired'
      ? 'expired'
      : status === 'expiring'
        ? 'expiring'
        : status === 'none'
          ? 'none'
          : 'premium');

  const daysLeftSuffix =
    typeof daysRemaining === 'number' && daysRemaining >= 0
      ? ` • ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left`
      : '';

  // ---- Upsell (no active subscription) -------------------------------------
  if (effectiveVariant === 'none') {
    return (
      <div className="relative w-full overflow-hidden rounded-lg border border-white bg-primary-green-100 p-5">
        <UnionDecoration variant="upsell" />
        <div className="relative">
          <h2 className="text-2xl font-medium leading-[1.1] text-secondary-blue-900">
            Level up your business, unlock{' '}
            <span className="font-bold text-primary-green-900">
              Kurlclub premium !
            </span>
          </h2>
          <p className="mt-2 text-[13px] text-secondary-blue-900">
            Per account, per month billed annually.
          </p>

          <ul className="mt-5 space-y-2.5">
            {UPSELL_FEATURES.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2.5 text-[13px] font-semibold text-secondary-blue-900"
              >
                <KPremiumListIcon />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // ---- Expired -------------------------------------------------------------
  if (effectiveVariant === 'expired') {
    return (
      <div className="relative w-full overflow-hidden rounded-lg bg-alert-red-500 p-5">
        <UnionDecoration variant="expired" />
        <div className="relative">
          <h2 className="text-2xl font-medium text-white">Plan expired ⚠️</h2>
          <p className="mt-1 text-[13px] text-white">
            Plan expired at {endDateLabel}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-1">
            <PrimaryButton onClick={onSubmit} tone="white">
              Reactivate plan
            </PrimaryButton>
            <TextButton onClick={onSubmit} tone="white">
              Payment details
            </TextButton>
          </div>
        </div>
      </div>
    );
  }

  // ---- Active (standard / premium / expiring) ------------------------------
  // Active subscriptions don't need a "see all plans" CTA — the plans list is
  // already rendered right below this card.
  const primaryLabel =
    effectiveVariant === 'expiring'
      ? 'Renew plan'
      : effectiveVariant === 'standard'
        ? 'Upgrade'
        : null;

  const subtitle =
    effectiveVariant === 'expiring'
      ? `Next billing on ${nextBillingDateLabel}${daysLeftSuffix}. Renew now to avoid interruption.`
      : `Billing cycle: ${billingCycleLabel} • Next billing on ${nextBillingDateLabel}${daysLeftSuffix}`;

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-white bg-primary-green-50 p-5">
      <UnionDecoration variant="default" />
      <div className="relative">
        <h2 className="text-2xl font-medium text-secondary-blue-900">
          {planName}
        </h2>
        <p className="mt-1 text-[13px] text-secondary-blue-900">{subtitle}</p>
        <div className="mt-5 flex flex-wrap items-center gap-1">
          {primaryLabel ? (
            <>
              <PrimaryButton onClick={onSubmit} tone="lime">
                {primaryLabel}
              </PrimaryButton>
              <TextButton onClick={onSubmit} tone="dark">
                Payment details
              </TextButton>
            </>
          ) : (
            // Sole action — render as a solid button so it reads as one.
            <PrimaryButton onClick={onSubmit} tone="lime">
              Payment details
            </PrimaryButton>
          )}
        </div>
      </div>
    </div>
  );
};
