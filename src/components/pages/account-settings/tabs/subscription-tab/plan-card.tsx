import NumberFlow from '@number-flow/react';
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';

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

const getPlainText = (value?: string) => {
  if (!value) return '';
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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
  const planDescription = getPlainText(plan.description);
  const previewFeatures = plan.features.slice(0, 4);
  const billedAmount =
    billingCycle === 'monthly'
      ? plan.pricing.monthly
      : billingCycle === '6months'
        ? plan.pricing.sixMonths
        : plan.pricing.yearly;
  const billedLabel =
    billingCycle === 'monthly'
      ? 'Billed monthly'
      : billingCycle === '6months'
        ? 'Billed every 6 months'
        : 'Billed yearly';

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn(
        'group relative flex h-full flex-col overflow-visible rounded-lg border p-5 transition-all duration-300',
        plan.popular
          ? 'scale-[1.015] border-primary-green-400 bg-linear-to-br from-secondary-blue-500 via-secondary-blue-600 to-primary-blue-600 pt-7 shadow-[0_18px_50px_rgba(211,247,2,0.2)]'
          : 'border-secondary-blue-400 bg-linear-to-b from-secondary-blue-500 to-secondary-blue-650 hover:border-primary-green-300 hover:shadow-[0_14px_38px_rgba(0,0,0,0.35)]'
      )}
    >
      {plan.popular && (
        <div className="absolute left-1/2 top-0 z-30 -translate-x-1/2 -translate-y-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-linear-to-r from-primary-green-300 to-primary-green-600 px-3.5 py-1 text-xs font-bold text-secondary-blue-700 shadow-lg">
            <Star className="h-3 w-3 fill-current" />
            {plan.badge}
          </span>
        </div>
      )}

      <div className="relative z-10 mb-4">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold leading-tight text-white">
              {plan.name}
            </h3>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary-green-300">
              {plan.subtitle}
            </p>
            {planDescription && (
              <p className="mt-2 max-w-[24ch] line-clamp-2 text-xs leading-relaxed text-secondary-blue-200">
                {planDescription}
              </p>
            )}
          </div>
          <div className="text-right">
            {isFreePlan ? (
              <p className="text-3xl font-bold leading-none text-primary-green-300">
                Free
              </p>
            ) : (
              <div className="flex items-end gap-1">
                <span className="pb-1 text-sm text-secondary-blue-300">₹</span>
                <NumberFlow
                  value={currentPrice}
                  className="text-3xl font-bold leading-none text-white"
                  transformTiming={{ duration: 300, easing: 'ease-out' }}
                  willChange
                />
                <span className="pb-1 text-xs text-secondary-blue-200">
                  {priceSuffix}
                </span>
              </div>
            )}
            {billingCycle !== 'monthly' && !isFreePlan && savings > 0 && (
              <span className="mt-1 inline-block rounded-full border border-primary-green-400/30 bg-primary-green-500/15 px-2 py-0.5 text-[10px] font-semibold text-primary-green-200">
                Save {savings}%
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-secondary-blue-400/70 bg-secondary-blue-700/55 px-3 py-2 text-[11px] text-secondary-blue-200">
          <span>{billedLabel}</span>
          <span className="font-semibold text-white">
            {billedAmount === 0 ? 'Free' : `₹${billedAmount}`}
          </span>
        </div>
        <p className="mt-2 text-center text-[10px] text-secondary-blue-300">
          {isFreePlan
            ? 'No payment required during trial'
            : 'Starts after your trial period'}
        </p>
      </div>

      <ul className="relative z-10 mb-5 space-y-2">
        {previewFeatures.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-2.5">
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-green-500/15 ring-1 ring-primary-green-500/20">
              <Check className="h-2.5 w-2.5 text-primary-green-500" />
            </div>
            <span className="text-xs font-medium leading-tight text-secondary-blue-100">
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <p className="relative z-10 mb-5 text-xs text-secondary-blue-200">
        {plan.features.length > previewFeatures.length
          ? `+${plan.features.length - previewFeatures.length} more features in details`
          : 'View complete feature and limits in details'}
      </p>

      <Button
        variant={plan.popular ? 'default' : 'outline'}
        disabled={disabled}
        onClick={() => onChoosePlan(plan)}
        className={cn(
          'relative z-10 mt-auto flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold transition-all duration-300',
          disabled && 'cursor-not-allowed opacity-60',
          plan.popular
            ? 'bg-primary-green-400 text-primary-blue-800 shadow-[0_10px_24px_rgba(211,247,2,0.25)] hover:bg-primary-green-300'
            : 'border-2 border-primary-green-500/80 text-primary-green-300 hover:bg-primary-green-500 hover:text-primary-blue-800'
        )}
      >
        Choose Plan
      </Button>
    </motion.div>
  );
}
