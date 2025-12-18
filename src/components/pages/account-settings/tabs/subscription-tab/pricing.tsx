'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';

import NumberFlow from '@number-flow/react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { PricingData, PricingPlan } from '@/services/pricing';

type BillingCycle = 'monthly' | '6months' | 'yearly';

interface PricingProps {
  title?: string;
  description?: string;
  pricingData?: PricingData;
}

const getBillingOptions = (plans: PricingPlan[]) => {
  if (plans.length === 0) return [];

  const firstPlan = plans[0];
  const monthlySavings = 0;
  const sixMonthsSavings = Math.round(
    ((firstPlan.pricing.monthly * 6 - firstPlan.pricing.sixMonths) /
      (firstPlan.pricing.monthly * 6)) *
      100
  );
  const yearlySavings = Math.round(
    ((firstPlan.pricing.monthly * 12 - firstPlan.pricing.yearly) /
      (firstPlan.pricing.monthly * 12)) *
      100
  );

  return [
    { key: 'monthly' as const, label: 'Monthly', savings: monthlySavings },
    { key: '6months' as const, label: '6-M', savings: sixMonthsSavings },
    { key: 'yearly' as const, label: '12-M', savings: yearlySavings },
  ];
};

const getPrice = (plan: PricingPlan, cycle: BillingCycle): number => {
  switch (cycle) {
    case 'monthly':
      return plan.pricing.monthly;
    case '6months':
      return Math.round(plan.pricing.sixMonths / 6);
    case 'yearly':
      return Math.round(plan.pricing.yearly / 12);
  }
};

const getSavings = (plan: PricingPlan, cycle: BillingCycle): number => {
  const monthly = plan.pricing.monthly;
  const current = getPrice(plan, cycle);
  return Math.round(((monthly - current) / monthly) * 100);
};

const triggerConfetti = () => {
  confetti({
    particleCount: 30,
    spread: 50,
    origin: { x: 0.5, y: 0.3 },
    colors: ['#FFD700', '#FFA500', '#FF8C00', '#d3f702', '#96af01', '#61a800'],
    ticks: 150,
    gravity: 1,
    decay: 0.9,
    startVelocity: 25,
  });
};

export function Pricing({
  title = 'Choose Your Plan',
  description,
  pricingData,
}: PricingProps) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly');
  const switchRef = useRef<HTMLButtonElement>(null);

  const handleCycleChange = (cycle: BillingCycle) => {
    setBillingCycle(cycle);
    if (cycle === 'yearly') {
      triggerConfetti();
    }
  };

  const plans = pricingData?.plans || [];
  const offer = pricingData?.offer;
  const billingOptions = getBillingOptions(plans);
  const finalDescription =
    description ||
    offer?.description ||
    'Start with 2 months free trial • All plans include full access';

  return (
    <div className="py-6 max-w-5xl mx-auto">
      {/* Compact Header */}
      <div className="text-center mb-6">
        {offer?.enabled && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-linear-to-r from-primary-green-500/20 to-primary-green-600/20 border border-primary-green-500/30 rounded-full mb-3">
            <Star className="h-3 w-3 text-primary-green-500" />
            <span className="text-xs font-semibold text-primary-green-500">
              {offer.durationMonths} Months Free Trial
            </span>
          </div>
        )}
        <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
        <p className="text-secondary-blue-200 text-sm">{finalDescription}</p>
      </div>

      {/* Billing Selector */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-secondary-blue-600 rounded-lg p-0.5 border border-secondary-blue-400">
          {billingOptions.map(({ key, label, savings }) => (
            <button
              key={key}
              ref={key === 'yearly' ? switchRef : null}
              onClick={() => handleCycleChange(key)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200',
                billingCycle === key
                  ? 'bg-primary-green-200 text-secondary-blue-600 shadow-lg'
                  : 'text-secondary-blue-100 hover:text-white'
              )}
            >
              {label}
              {savings > 0 && (
                <span className="ml-1 text-[10px]">
                  {billingCycle === key ? `${savings}%` : `(${savings}%)`}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {plans.map((plan, index) => {
          const currentPrice = getPrice(plan, billingCycle);
          const savings = getSavings(plan, billingCycle);

          return (
            <motion.div
              key={plan.id}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={cn(
                'relative p-5 rounded-xl border bg-secondary-blue-500 transition-all duration-300 hover:shadow-lg',
                plan.popular
                  ? 'border-primary-green-500 shadow-lg scale-[1.02] bg-linear-to-br from-secondary-blue-500 to-secondary-blue-600'
                  : 'border-secondary-blue-400 hover:border-primary-green-300'
              )}
            >
              {plan.popular && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-linear-to-r from-primary-green-300 to-primary-green-600 text-white text-xs font-bold rounded-full shadow-lg">
                    <Star className="h-3 w-3 fill-current" />
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight">
                      {plan.name}
                    </h3>
                    <p className="text-primary-green-500 text-xs font-medium">
                      {plan.subtitle}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-xs text-secondary-blue-300">₹</span>
                      <NumberFlow
                        value={currentPrice}
                        className="text-2xl font-bold text-white"
                        transformTiming={{ duration: 300, easing: 'ease-out' }}
                        willChange
                      />
                      <span className="text-xs text-secondary-blue-200">
                        /mo
                      </span>
                    </div>
                    {billingCycle !== 'monthly' && (
                      <span className="inline-block px-1.5 py-0.5 bg-primary-green-500/20 text-primary-green-500 text-[10px] font-semibold rounded-full mt-1">
                        Save {savings}%
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-secondary-blue-300 text-center">
                  Billed after trial
                </p>
              </div>

              <ul className="space-y-2 mb-5">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <div className="shrink-0 w-4 h-4 bg-primary-green-500/15 rounded-full flex items-center justify-center mt-0.5">
                      <Check className="h-2.5 w-2.5 text-primary-green-500" />
                    </div>
                    <span className="text-xs text-secondary-blue-100 font-medium leading-tight">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={cn(
                  'w-full h-10 font-semibold text-sm transition-all duration-300 rounded-lg flex items-center justify-center',
                  plan.popular
                    ? 'bg-primary-green-500 hover:bg-primary-green-600 text-white shadow-md hover:shadow-lg'
                    : 'border-2 border-primary-green-500 text-primary-green-500 hover:bg-primary-green-500 hover:text-white'
                )}
              >
                Start Free Trial
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Disclaimer */}
      {offer?.enabled && (
        <div className="text-center mt-4">
          <p className="text-sm text-secondary-blue-200 italic">
            Limited-time offer • Terms & conditions apply*
          </p>
        </div>
      )}
    </div>
  );
}
