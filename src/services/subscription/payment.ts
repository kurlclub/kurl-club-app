import { api } from '@/lib/api';

export type SubscriptionPaymentBillingCycle =
  | 'monthly'
  | 'sixMonths'
  | 'yearly';

export type SubscriptionPaymentOrder = {
  subscriptionPaymentId: number;
  planId: number;
  planName: string;
  billingCycle: SubscriptionPaymentBillingCycle;
  amount: number;
  currency: string;
  razorpayKeyId: string;
  orderId: string;
  receipt: string;
  effectiveFrom: string;
  expiresAt: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
};

export type CreateSubscriptionPaymentOrderPayload = {
  planId: number;
  billingCycle: SubscriptionPaymentBillingCycle;
};

export type CreateSubscriptionPaymentOrderResponse = {
  status: string;
  message: string;
  data: SubscriptionPaymentOrder;
};

export type VerifyAndRenewSubscriptionPayload = {
  subscriptionPaymentId: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};

export type VerifyAndRenewSubscriptionResponse = {
  status: string;
  message: string;
  data?: unknown;
};

const assertSubscriptionPaymentOrder = (
  order: SubscriptionPaymentOrder | undefined
) => {
  if (!order) {
    throw new Error('Subscription payment order response is empty.');
  }

  if (
    !order.orderId ||
    !order.razorpayKeyId ||
    !Number.isFinite(order.subscriptionPaymentId) ||
    !Number.isFinite(order.planId) ||
    !order.planName ||
    !order.currency ||
    !Number.isFinite(order.amount) ||
    !order.customer?.email
  ) {
    throw new Error('Subscription payment order response is incomplete.');
  }
};

export const createSubscriptionPaymentOrder = async (
  payload: CreateSubscriptionPaymentOrderPayload
) => {
  const response = await api.post<CreateSubscriptionPaymentOrderResponse>(
    '/SubscriptionPayment/create-order',
    payload
  );

  if (response.status !== 'Success' || !response.data) {
    throw new Error(
      response.message || 'Unable to initialize subscription payment.'
    );
  }

  assertSubscriptionPaymentOrder(response.data);
  return response.data;
};

export const verifyAndRenewSubscription = async (
  payload: VerifyAndRenewSubscriptionPayload
) => {
  const response = await api.post<VerifyAndRenewSubscriptionResponse>(
    '/SubscriptionPayment/verify-and-renew',
    payload
  );

  return {
    status: response.status || 'Error',
    message:
      response.message || 'Unable to verify subscription payment at this time.',
    data: response.data ?? null,
  };
};
