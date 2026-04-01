'use client';

import { useRef, useState } from 'react';

import confetti from 'canvas-confetti';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

import { PlanDetailsDialog } from '@/components/pages/account-settings/tabs/subscription-tab/plan-details-dialog';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import type { PricingData, PricingPlan } from '@/services/pricing';
import {
  createSubscriptionPaymentOrder,
  verifyAndRenewSubscription,
} from '@/services/subscription';

import {
  PaymentFailureDialog,
  PaymentSuccessDialog,
} from './payment-status-dialogs';
import { PlanCard } from './plan-card';

type BillingCycle = 'monthly' | '6months' | 'yearly';

type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayCheckoutOptions = {
  key: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
  handler?: (response: RazorpaySuccessResponse) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => { open: () => void };
  }
}

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

const loadRazorpayScript = async () => {
  if (typeof window === 'undefined') return false;
  if (window.Razorpay) return true;

  return new Promise<boolean>((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const toApiBillingCycle = (cycle: BillingCycle) => {
  if (cycle === '6months') return 'sixMonths' as const;
  return cycle;
};

const formatBillingCycleLabel = (cycle: string) => {
  switch (cycle) {
    case 'monthly':
      return 'Monthly';
    case 'sixMonths':
    case '6months':
      return '6 Months';
    case 'yearly':
      return 'Yearly';
    default:
      return cycle;
  }
};

export function Pricing({
  title = 'Choose Your Plan',
  description,
  pricingData,
}: PricingProps) {
  const { refreshUser } = useAuth();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly');
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState({
    open: false,
    title: 'title',
    message: 'message',
  });
  const [paymentFailure, setPaymentFailure] = useState({
    open: false,
    title: 'title',
    message: 'message',
  });
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

  const handleChoosePlan = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setIsDetailsOpen(true);
  };

  const handlePayNow = async (plan: PricingPlan, cycle: BillingCycle) => {
    try {
      setIsPaying(true);

      const orderData = await createSubscriptionPaymentOrder({
        planId: Number(plan.id),
        billingCycle: toApiBillingCycle(cycle),
      });

      const isRazorpayLoaded = await loadRazorpayScript();
      if (!isRazorpayLoaded || !window.Razorpay) {
        toast.error('Unable to load Razorpay. Please try again.');
        return;
      }

      const razorpay = new window.Razorpay({
        key: orderData.razorpayKeyId,
        name: `KurlClub - ${orderData.planName}`,
        description: `Billing Cycle: ${formatBillingCycleLabel(orderData.billingCycle)}`,
        order_id: orderData.orderId,
        prefill: {
          name: orderData.customer.name,
          email: orderData.customer.email,
          contact: orderData.customer.phone,
        },
        notes: {
          subscriptionPaymentId: String(orderData.subscriptionPaymentId),
          planId: String(orderData.planId),
          planName: orderData.planName,
          billingCycle: orderData.billingCycle,
        },
        theme: {
          color: '#1c1f24',
        },
        modal: {
          ondismiss: () => {
            toast.message('Payment cancelled.');
          },
        },
        handler: (response) => {
          void (async () => {
            try {
              const verifyResponse = await verifyAndRenewSubscription({
                subscriptionPaymentId: orderData.subscriptionPaymentId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });

              const isSuccess =
                verifyResponse.status?.toLowerCase() === 'success';

              const paymentMessage =
                verifyResponse.message ||
                (isSuccess
                  ? 'Subscription has been renewed successfully.'
                  : 'Payment was received but verification failed.');

              if (isSuccess) {
                // Sync latest subscription from backend for immediate UI updates.
                try {
                  await refreshUser();
                } catch (refreshError) {
                  console.warn(
                    'Failed to refresh user after payment:',
                    refreshError
                  );
                }
              }

              if (isSuccess) {
                setPaymentSuccess({
                  open: true,
                  title: 'Subscription Updated',
                  message: paymentMessage,
                });
              } else {
                setPaymentFailure({
                  open: true,
                  title: 'Payment Verification Failed',
                  message: paymentMessage,
                });
              }

              if (isSuccess) {
                toast.success('Payment verified and subscription updated.');
              } else {
                toast.error('Payment verification failed.');
              }
            } catch (error) {
              const errorMessage =
                error instanceof Error
                  ? error.message
                  : 'Failed to verify payment. Please contact support.';

              setPaymentFailure({
                open: true,
                title: 'Payment Verification Failed',
                message: errorMessage,
              });
              toast.error(errorMessage);
            }
          })();
        },
      });

      setIsDetailsOpen(false);
      window.setTimeout(() => {
        razorpay.open();
      }, 60);
    } catch (error) {
      console.error('Failed to initialize payment:', error);
      toast.error(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="relative mx-auto max-w-6xl py-6">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-3xl">
        <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-primary-green-500/10 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-semantic-blue-500/15 blur-3xl" />
      </div>

      <div className="mb-8 text-center">
        {offer?.enabled && (
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-green-500/30 bg-linear-to-r from-primary-green-500/20 to-secondary-green-600/20 px-4 py-1.5 shadow-[0_0_0_1px_rgba(211,247,2,0.08)]">
            <Star className="h-3.5 w-3.5 text-primary-green-300" />
            <span className="text-xs font-semibold tracking-wide text-primary-green-200">
              {offer.durationMonths} Months Free Trial
            </span>
          </div>
        )}
        <h2 className="mb-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
          {title}
        </h2>
        <p className="mx-auto max-w-2xl text-sm text-secondary-blue-200 md:text-base">
          {finalDescription}
        </p>
      </div>

      <div className="mb-8 flex justify-center">
        <div className="inline-flex rounded-xl border border-secondary-blue-400 bg-secondary-blue-650 p-1 shadow-inner shadow-black/25">
          {billingOptions.map(({ key, label, savings }) => (
            <button
              key={key}
              ref={key === 'yearly' ? switchRef : null}
              onClick={() => handleCycleChange(key)}
              className={cn(
                'relative rounded-lg px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-250 sm:px-5',
                billingCycle === key
                  ? 'bg-primary-green-300 text-primary-blue-700 shadow-lg shadow-primary-green-500/30'
                  : 'text-secondary-blue-100 hover:bg-secondary-blue-600 hover:text-white'
              )}
            >
              {label}
              {savings > 0 && (
                <span className="ml-1 text-[10px] opacity-90">
                  {billingCycle === key
                    ? `Save ${savings}%`
                    : `(${savings}% off)`}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 lg:grid-cols-2">
        {plans.map((plan, index) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            index={index}
            billingCycle={billingCycle}
            onChoosePlan={handleChoosePlan}
          />
        ))}
      </div>

      <PlanDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        selectedPlan={selectedPlan}
        billingCycle={billingCycle}
        onPayNow={handlePayNow}
        isPaying={isPaying}
      />

      <PaymentSuccessDialog
        open={paymentSuccess.open}
        onOpenChange={(open) =>
          setPaymentSuccess((prev) => ({
            ...prev,
            open,
          }))
        }
        title={paymentSuccess.title}
        message={paymentSuccess.message}
      />

      <PaymentFailureDialog
        open={paymentFailure.open}
        onOpenChange={(open) =>
          setPaymentFailure((prev) => ({
            ...prev,
            open,
          }))
        }
        title={paymentFailure.title}
        message={paymentFailure.message}
      />

      {offer?.enabled && (
        <div className="mt-5 text-center">
          <p className="text-sm italic text-secondary-blue-200">
            Limited-time offer • Terms & conditions apply*
          </p>
        </div>
      )}
    </div>
  );
}
