'use client';

import { useRef, useState } from 'react';

import confetti from 'canvas-confetti';
import { Star } from 'lucide-react';

import {
  type CheckoutBillingFormValues,
  CheckoutDialog,
} from '@/components/pages/account-settings/tabs/subscription-tab/checkout-dialog';
import { PlanDetailsDialog } from '@/components/pages/account-settings/tabs/subscription-tab/plan-details-dialog';
import { useSubscriptionAccess } from '@/hooks/use-subscription-access';
import {
  type SubscriptionBillingCycle,
  useSubscriptionPayment,
} from '@/hooks/use-subscription-payment';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import type { PricingData, PricingPlan } from '@/services/pricing';

import {
  PaymentFailureDialog,
  PaymentSuccessDialog,
} from './payment-status-dialogs';
import { PlanCard } from './plan-card';

type BillingCycle = SubscriptionBillingCycle;

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

const triggerConfetti = (origin: { x: number; y: number }) => {
  confetti({
    particleCount: 30,
    spread: 50,
    origin,
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
  const { refreshUser } = useAuth();
  const { subscription } = useSubscriptionAccess();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly');
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const yearlyButtonRef = useRef<HTMLButtonElement>(null);

  const handleCycleChange = (cycle: BillingCycle) => {
    setBillingCycle(cycle);
    if (cycle !== 'yearly') return;

    // Burst from the 12-M button's actual on-screen position.
    const rect = yearlyButtonRef.current?.getBoundingClientRect();
    triggerConfetti(
      rect
        ? {
            x: (rect.left + rect.width / 2) / window.innerWidth,
            y: (rect.top + rect.height / 2) / window.innerHeight,
          }
        : { x: 0.5, y: 0.3 }
    );
  };

  const plans = pricingData?.plans || [];
  const offer = pricingData?.offer;
  const billingOptions = getBillingOptions(plans);
  const finalDescription =
    description ||
    offer?.description ||
    'Start with 2 months free trial • All plans include full access';
  const currentPlanId = subscription?.id;
  const {
    isPaying,
    paymentSuccess,
    paymentFailure,
    closePaymentSuccess,
    closePaymentFailure,
    startSubscriptionPayment,
  } = useSubscriptionPayment({
    currentPlanId,
    refreshUser,
  });
  const planChangeType =
    !!selectedPlan &&
    typeof currentPlanId === 'number' &&
    Number(selectedPlan.id) === currentPlanId
      ? 'same'
      : 'different';

  const handleChoosePlan = (plan: PricingPlan) => {
    if (isPaying) return;
    setSelectedPlan(plan);
    setIsDetailsOpen(true);
  };

  const handleOpenCheckout = async () => {
    setIsDetailsOpen(false);
    setIsCheckoutOpen(true);
  };

  const handlePayNow = async (
    plan: PricingPlan,
    cycle: BillingCycle,
    billingDetails: CheckoutBillingFormValues
  ) => {
    await startSubscriptionPayment({
      plan,
      billingCycle: cycle,
      billingDetails,
      onCheckoutReady: () => setIsCheckoutOpen(false),
    });
  };

  return (
    <div className="py-2">
      {/* Header: title + billing toggle */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1.5">
          {offer?.enabled && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-green-500/30 bg-primary-green-500/10 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-primary-green-200">
              <Star className="h-3 w-3" />
              {offer.durationMonths} Months Free Trial
            </span>
          )}
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="max-w-xl text-sm text-secondary-blue-200">
            {finalDescription}
          </p>
        </div>

        <div className="inline-flex shrink-0 self-start rounded-lg border border-secondary-blue-400 bg-secondary-blue-700 p-1 lg:self-end">
          {billingOptions.map(({ key, label, savings }) => (
            <button
              key={key}
              ref={key === 'yearly' ? yearlyButtonRef : undefined}
              type="button"
              disabled={isPaying}
              onClick={() => handleCycleChange(key)}
              className={cn(
                'rounded-md px-4 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60',
                billingCycle === key
                  ? 'bg-primary-green-300 text-primary-blue-700'
                  : 'text-secondary-blue-200 hover:text-white'
              )}
            >
              {label}
              {savings > 0 && (
                <span className="ml-1 opacity-80">{savings}% off</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Plans — single row on desktop, stacked on mobile */}
      <div className="flex flex-col gap-4 lg:flex-row">
        {plans.map((plan, index) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            index={index}
            billingCycle={billingCycle}
            onChoosePlan={handleChoosePlan}
            disabled={isPaying}
          />
        ))}
      </div>

      <PlanDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        selectedPlan={selectedPlan}
        billingCycle={billingCycle}
        planChangeType={planChangeType || null}
        onPayNow={handleOpenCheckout}
        isPaying={isPaying}
      />

      <CheckoutDialog
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        selectedPlan={selectedPlan}
        billingCycle={billingCycle}
        onConfirm={handlePayNow}
        isPaying={isPaying}
      />

      <PaymentSuccessDialog
        open={paymentSuccess.open}
        onOpenChange={(open) => {
          if (!open) closePaymentSuccess();
        }}
        title={paymentSuccess.title}
        message={paymentSuccess.message}
      />

      <PaymentFailureDialog
        open={paymentFailure.open}
        onOpenChange={(open) => {
          if (!open) closePaymentFailure();
        }}
        title={paymentFailure.title}
        message={paymentFailure.message}
      />
    </div>
  );
}
