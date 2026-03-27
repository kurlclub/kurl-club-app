import { api } from '@/lib/api';

export type SubscriptionPaymentBillingCycle =
  | 'monthly'
  | 'sixMonths'
  | 'yearly';

export type CreateSubscriptionPaymentOrderPayload = {
  planId: number;
  billingCycle: SubscriptionPaymentBillingCycle;
};

export type CreateSubscriptionPaymentOrderResponse = {
  status: string;
  message: string;
  data: {
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

export const createSubscriptionPaymentOrder = async (
  payload: CreateSubscriptionPaymentOrderPayload
) => {
  const response = await api.post<CreateSubscriptionPaymentOrderResponse>(
    '/SubscriptionPayment/create-order',
    payload
  );
  return response.data;
};

export const verifyAndRenewSubscription = async (
  payload: VerifyAndRenewSubscriptionPayload
) => {
  const response = await api.post<VerifyAndRenewSubscriptionResponse>(
    '/SubscriptionPayment/verify-and-renew',
    payload
  );
  return response;
};
