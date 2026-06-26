import NumberFlow from '@number-flow/react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PricingPlan } from '@/services/pricing';

type BillingCycle = 'monthly' | '6months' | 'yearly';

interface PanCardProps {
  plan: PricingPlan;
  index: number;
  billingCycle: BillingCycle;
  onChoosePlan: (plan: PricingPlan) => void;
  disabled?: boolean;
}

const getPrice = (plan: PricingPlan, cycle: BillingCycle): number => {
  switch (cycle) {
    case 'monthly':
      return plan.pricing.monthly;
    case '6months':
      return plan.pricing.sixMonths;
    case 'yearly':
      return plan.pricing.yearly;
  }
};

const getCycleDurationInMonths = (cycle: BillingCycle): number => {
  switch (cycle) {
    case 'monthly':
      return 1;
    case '6months':
      return 6;
    case 'yearly':
      return 12;
  }
};

const getPriceSuffix = (cycle: BillingCycle) => {
  switch (cycle) {
    case 'monthly':
      return '/mo';
    case '6months':
      return '/6 mo';
    case 'yearly':
      return '/yr';
  }
};

const getSavings = (plan: PricingPlan, cycle: BillingCycle): number => {
  const monthly = plan.pricing.monthly;
  const current = getPrice(plan, cycle);
  const fullPrice = monthly * getCycleDurationInMonths(cycle);

  if (monthly === 0 || fullPrice === 0) return 0;

  return Math.round(((fullPrice - current) / fullPrice) * 100);
};

export function PlanCard({
  plan,
  index,
  billingCycle,
  onChoosePlan,
  disabled = false,
}: PanCardProps) {
  const currentPrice = getPrice(plan, billingCycle);
  const savings = getSavings(plan, billingCycle);
  const priceSuffix = getPriceSuffix(billingCycle);
  const isFreePlan = currentPrice === 0;
  const previewFeatures = plan.features.slice(0, 4);
  const extraFeatures = plan.features.length - previewFeatures.length;

  return (
    <motion.div
      initial={{ y: 8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className={cn(
        'flex h-full min-w-0 flex-1 flex-col rounded-xl border bg-secondary-blue-600 p-5',
        plan.popular
          ? 'border-primary-green-500/70'
          : 'border-secondary-blue-400'
      )}
    >
      {/* Header: name + popular marker */}
      <div className="mb-1 flex items-center justify-between gap-2">
        <h3 className="truncate text-base font-semibold text-white">
          {plan.name}
        </h3>
        {plan.popular && (
          <span className="shrink-0 rounded-full bg-primary-green-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-green-300 ring-1 ring-primary-green-500/30">
            {plan.badge || 'Popular'}
          </span>
        )}
      </div>
      {plan.subtitle && (
        <p className="text-xs font-medium uppercase tracking-[0.1em] text-secondary-blue-300">
          {plan.subtitle}
        </p>
      )}

      {/* Price */}
      <div className="mt-4 flex items-end gap-1">
        {isFreePlan ? (
          <span className="text-2xl font-bold leading-none text-primary-green-300">
            Free
          </span>
        ) : (
          <>
            <span className="pb-1 text-sm text-secondary-blue-300">₹</span>
            <NumberFlow
              value={currentPrice}
              className="text-3xl font-bold leading-none text-white tabular-nums"
              transformTiming={{ duration: 300, easing: 'ease-out' }}
              willChange
            />
            <span className="pb-1 text-xs text-secondary-blue-300">
              {priceSuffix}
            </span>
          </>
        )}
        {!isFreePlan && billingCycle !== 'monthly' && savings > 0 && (
          <span className="mb-1 ml-1 rounded-full bg-primary-green-500/15 px-2 py-0.5 text-[10px] font-semibold text-primary-green-300">
            Save {savings}%
          </span>
        )}
      </div>
      <p className="mt-1 text-[11px] text-secondary-blue-300">
        {isFreePlan ? 'No payment during trial' : 'GST (18%) included'}
      </p>

      {/* Features */}
      <ul className="mt-5 space-y-2.5 border-t border-secondary-blue-400/50 pt-5">
        {previewFeatures.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2.5">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-green-500" />
            <span className="text-xs leading-snug text-secondary-blue-100">
              {feature}
            </span>
          </li>
        ))}
        {extraFeatures > 0 && (
          <li className="pl-[26px] text-xs text-secondary-blue-300">
            +{extraFeatures} more in details
          </li>
        )}
      </ul>

      {/* CTA */}
      <Button
        variant={plan.popular ? 'default' : 'outline'}
        disabled={disabled}
        onClick={() => onChoosePlan(plan)}
        className="mt-6 w-full"
      >
        Choose Plan
      </Button>
    </motion.div>
  );
}
