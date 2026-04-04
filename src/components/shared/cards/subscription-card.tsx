'use client';

import React from 'react';

import { useSubscriptionAccess } from '@/hooks/use-subscription-access';
import { SUBSCRIPTION_ACCESS_LABELS } from '@/lib/subscription/feature-labels';
import { safeFormatDate } from '@/lib/utils';

import { Button } from '../../ui/button';
import { KPremiumListIcon } from '../icons';

type SubscriptionVariant = 'standard' | 'premium' | 'expired';

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
  const planName = subscription?.name || 'No active plan';
  const endDateLabel = safeFormatDate(subscription?.endDate, 'en-GB', 'N/A');
  const billingCycle = subscription?.billingCycle || 'monthly';
  const effectiveVariant =
    variant || (status === 'expired' ? 'expired' : 'premium');

  const bgClass = {
    standard: 'bg-primary-green-50',
    premium: 'bg-primary-green-100',
    expired: 'bg-alert-red-500 bg-none',
  }[effectiveVariant];

  const title = {
    standard: planName,
    premium: (
      <>
        Current plan:{' '}
        <span className="text-primary-green-900 font-bold">{planName}</span>
      </>
    ),
    expired: 'Plan expired',
  }[effectiveVariant];

  const description =
    effectiveVariant === 'expired'
      ? `Plan expired on ${endDateLabel}.`
      : `Billing cycle: ${billingCycle} • Ends on ${endDateLabel}${
          typeof daysRemaining === 'number' && daysRemaining >= 0
            ? ` • ${daysRemaining} days left`
            : ''
        }`;

  const enabledFeatures = enabledCapabilities
    .map((capability) => SUBSCRIPTION_ACCESS_LABELS[capability])
    .filter(Boolean)
    .slice(0, 4);

  const renderButtons = () => {
    if (effectiveVariant === 'expired') {
      return (
        <>
          <Button
            onClick={onSubmit}
            variant="secondary"
            className="h-[46px] text-white bg-secondary-blue-500 hover:bg-secondary-blue-900 rounded-lg"
          >
            Reactivate plan
          </Button>
          <Button className="h-[46px] bg-transparent! shadow-none text-white border border-transparent hover:border-white rounded-lg">
            Payment details
          </Button>
        </>
      );
    }

    return (
      <Button
        onClick={onSubmit}
        variant="secondary"
        className="h-[46px] bg-secondary-blue-500 hover:bg-secondary-blue-900 rounded-lg"
      >
        See all plans
      </Button>
    );
  };

  return (
    <div
      className={`rounded-lg w-full p-5 border border-transparent ${bgClass} bg-[url("/assets/svg/subscription-bg.svg")] bg-no-repeat bg-right bg-contain`}
    >
      <h1
        className={`text-secondary-blue-900 text-2xl font-medium leading-normal ${effectiveVariant === 'expired' && 'text-white!'}`}
      >
        {title}
      </h1>
      <p
        className={`text-secondary-blue-900 text-sm leading-normal mt-2 ${effectiveVariant === 'expired' && 'text-white!'}`}
      >
        {description}
      </p>

      {enabledFeatures.length > 0 && effectiveVariant !== 'expired' && (
        <ul className="mt-4 flex flex-col gap-2">
          {enabledFeatures.map((feature, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 text-sm font-semibold leading-normal text-secondary-blue-900"
            >
              <KPremiumListIcon />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex items-center gap-2">{renderButtons()}</div>
    </div>
  );
};
