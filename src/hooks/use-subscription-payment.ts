'use client';

import { useRef, useState } from 'react';

import { toast } from 'sonner';

import {
  createRazorpayCheckout,
  getRazorpayFailureMessage,
  loadRazorpayCheckoutScript,
  type RazorpayCheckoutSuccessResponse,
} from '@/lib/subscription/razorpay';
import type { PricingPlan } from '@/services/pricing';
import {
  createSubscriptionPaymentOrder,
  type SubscriptionPaymentBillingCycle,
  verifyAndRenewSubscription,
} from '@/services/subscription';

export type SubscriptionBillingCycle = 'monthly' | '6months' | 'yearly';

type PaymentDialogState = {
  open: boolean;
  title: string;
  message: string;
};

type PaymentFlowState =
  | 'idle'
  | 'initializing'
  | 'checkout_open'
  | 'verifying';

type StartSubscriptionPaymentParams = {
  plan: PricingPlan;
  billingCycle: SubscriptionBillingCycle;
  onCheckoutReady?: () => void;
};

type UseSubscriptionPaymentParams = {
  currentPlanId?: number | null;
  refreshUser: () => Promise<void>;
};

const CLOSED_DIALOG: PaymentDialogState = {
  open: false,
  title: '',
  message: '',
};

const toApiBillingCycle = (
  cycle: SubscriptionBillingCycle
): SubscriptionPaymentBillingCycle => {
  if (cycle === '6months') return 'sixMonths';
  return cycle;
};

const formatBillingCycleLabel = (
  cycle: SubscriptionPaymentBillingCycle | SubscriptionBillingCycle
) => {
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

const buildSuccessMessage = (
  isSamePlanRenewal: boolean,
  verificationMessage?: string
) => {
  const fallbackMessage = isSamePlanRenewal
    ? 'Your current plan has been extended. Remaining time is stacked on your existing plan.'
    : 'Plan switched successfully. Your new plan starts immediately, and previous remaining time is forfeited.';

  return verificationMessage
    ? `${verificationMessage} ${fallbackMessage}`.trim()
    : fallbackMessage;
};

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export function useSubscriptionPayment({
  currentPlanId,
  refreshUser,
}: UseSubscriptionPaymentParams) {
  const [paymentFlowState, setPaymentFlowState] =
    useState<PaymentFlowState>('idle');
  const paymentFlowStateRef = useRef<PaymentFlowState>('idle');
  const [paymentSuccess, setPaymentSuccess] =
    useState<PaymentDialogState>(CLOSED_DIALOG);
  const [paymentFailure, setPaymentFailure] =
    useState<PaymentDialogState>(CLOSED_DIALOG);

  const setFlowState = (nextState: PaymentFlowState) => {
    paymentFlowStateRef.current = nextState;
    setPaymentFlowState(nextState);
  };

  const closePaymentSuccess = () => {
    setPaymentSuccess(CLOSED_DIALOG);
  };

  const closePaymentFailure = () => {
    setPaymentFailure(CLOSED_DIALOG);
  };

  const openPaymentSuccess = (title: string, message: string) => {
    setPaymentSuccess({
      open: true,
      title,
      message,
    });
  };

  const openPaymentFailure = (title: string, message: string) => {
    setPaymentFailure({
      open: true,
      title,
      message,
    });
  };

  const verifyPayment = async ({
    subscriptionPaymentId,
    response,
    isSamePlanRenewal,
  }: {
    subscriptionPaymentId: number;
    response: RazorpayCheckoutSuccessResponse;
    isSamePlanRenewal: boolean;
  }) => {
    setFlowState('verifying');

    try {
      const verification = await verifyAndRenewSubscription({
        subscriptionPaymentId,
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
      });

      const isSuccess = verification.status?.toLowerCase() === 'success';
      const paymentMessage = isSuccess
        ? buildSuccessMessage(isSamePlanRenewal, verification.message)
        : verification.message ||
          'Payment was received but verification failed.';

      if (isSuccess) {
        try {
          await refreshUser();
        } catch (refreshError) {
          console.warn(
            'Failed to refresh user after subscription payment:',
            refreshError
          );
        }

        openPaymentSuccess('Subscription Updated', paymentMessage);
        toast.success('Payment verified and subscription updated.');
      } else {
        openPaymentFailure('Payment Verification Failed', paymentMessage);
        toast.error('Payment verification failed.');
      }
    } catch (error) {
      const errorMessage = getErrorMessage(
        error,
        'Failed to verify payment. Please contact support.'
      );

      openPaymentFailure('Payment Verification Failed', errorMessage);
      toast.error(errorMessage);
    } finally {
      setFlowState('idle');
    }
  };

  const startSubscriptionPayment = async ({
    plan,
    billingCycle,
    onCheckoutReady,
  }: StartSubscriptionPaymentParams) => {
    if (paymentFlowStateRef.current !== 'idle') {
      return;
    }

    setFlowState('initializing');

    try {
      const planId = Number(plan.id);
      if (!Number.isFinite(planId)) {
        throw new Error('Invalid subscription plan selected.');
      }

      const isSamePlanRenewal =
        typeof currentPlanId === 'number' && planId === currentPlanId;

      const orderData = await createSubscriptionPaymentOrder({
        planId,
        billingCycle: toApiBillingCycle(billingCycle),
      });

      const isRazorpayLoaded = await loadRazorpayCheckoutScript();
      if (!isRazorpayLoaded) {
        throw new Error('Unable to load Razorpay. Please try again.');
      }

      let didSettleCheckout = false;
      const markCheckoutSettled = () => {
        if (didSettleCheckout) return false;
        didSettleCheckout = true;
        return true;
      };

      const razorpay = createRazorpayCheckout({
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
            if (!markCheckoutSettled()) return;
            setFlowState('idle');
            toast.message('Payment cancelled.');
          },
        },
        handler: (response) => {
          if (!markCheckoutSettled()) return;

          void verifyPayment({
            subscriptionPaymentId: orderData.subscriptionPaymentId,
            response,
            isSamePlanRenewal,
          });
        },
      });

      razorpay.on('payment.failed', (response) => {
        if (!markCheckoutSettled()) return;

        const message = getRazorpayFailureMessage(response);
        setFlowState('idle');
        openPaymentFailure('Payment Failed', message);
        toast.error(message);
      });

      onCheckoutReady?.();
      setFlowState('checkout_open');

      window.setTimeout(() => {
        try {
          razorpay.open();
        } catch (error) {
          if (!markCheckoutSettled()) return;

          const message = getErrorMessage(
            error,
            'Unable to open Razorpay checkout. Please try again.'
          );
          setFlowState('idle');
          openPaymentFailure('Unable to Start Payment', message);
          toast.error(message);
        }
      }, 60);
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Payment failed');
      setFlowState('idle');
      openPaymentFailure('Unable to Start Payment', errorMessage);
      toast.error(errorMessage);
    }
  };

  return {
    isPaying: paymentFlowState !== 'idle',
    paymentFlowState,
    paymentSuccess,
    paymentFailure,
    closePaymentSuccess,
    closePaymentFailure,
    startSubscriptionPayment,
  };
}
