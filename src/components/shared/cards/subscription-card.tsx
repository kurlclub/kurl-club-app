'use client';

import React from 'react';

import { Button } from '../../ui/button';
import { KPremiumListIcon } from '../icons';

type SubscriptionVariant = 'standard' | 'premium' | 'expired';

interface SubscriptionCardProps {
  variant?: SubscriptionVariant;
  onSubmit?: () => void;
}

const descriptions: Record<SubscriptionVariant, string> = {
  standard: 'Plan expires 15 Mar, 2025, subscribed since 15 Mar, 2024',
  premium: 'Per account, per month billed annually.',
  expired: 'Plan expired at 15 Mar, 2025',
};

const premiumFeatures = [
  'Unlimited members',
  'Exclusive Access to Class & Trainer Scheduling',
  'Automated Payment & Renewal',
  'Member app for the ultimate P.T experience.',
];

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  variant = 'standard',
  onSubmit,
}) => {
  const bgClass = {
    standard: 'bg-primary-green-50',
    premium: 'bg-primary-green-100',
    expired: 'bg-alert-red-500 bg-none',
  }[variant];

  const title = {
    standard: 'Standard',
    premium: (
      <>
        Level up your business, unlock{' '}
        <span className="text-primary-green-900 font-bold">
          Kurlclub premium!
        </span>
      </>
    ),
    expired: 'Plan expired ⚠️',
  }[variant];

  const renderButtons = () => {
    switch (variant) {
      case 'standard':
        return (
          <>
            <Button
              onClick={onSubmit}
              variant="secondary"
              className="h-[46px] bg-secondary-blue-500 hover:bg-secondary-blue-900 rounded-lg"
            >
              Upgrade
            </Button>
            <Button className="h-[46px] bg-transparent! shadow-none border border-transparent hover:border-secondary-blue-900 rounded-lg">
              Payment details
            </Button>
          </>
        );
      case 'premium':
        return (
          <Button
            onClick={onSubmit}
            variant="secondary"
            className="h-[46px] bg-secondary-blue-500 hover:bg-secondary-blue-900 rounded-lg"
          >
            See all plans
          </Button>
        );
      case 'expired':
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
  };

  return (
    <div
      className={`rounded-lg w-full p-5 border border-transparent ${bgClass} bg-[url("/assets/svg/subscription-bg.svg")] bg-no-repeat bg-right bg-contain`}
    >
      <h1
        className={`text-secondary-blue-900 text-2xl font-medium leading-normal ${variant === 'expired' && 'text-white!'}`}
      >
        {title}
      </h1>
      <p
        className={`text-secondary-blue-900 text-sm leading-normal mt-2 ${variant === 'expired' && 'text-white!'}`}
      >
        {descriptions[variant]}
      </p>

      {variant === 'premium' && (
        <ul className="mt-4 flex flex-col gap-2">
          {premiumFeatures.map((feature, idx) => (
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
