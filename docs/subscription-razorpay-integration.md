# Subscription Razorpay Integration

This document explains how subscription payments are implemented with Razorpay in the web app after the KC-113 hardening pass. It is written for developers who need to maintain, review, or extend the flow.

## Goals

- Keep payment orchestration out of the UI component.
- Ensure the Razorpay script is loaded once per browser session.
- Prevent duplicate payment initialization.
- Treat checkout cancellation, checkout failure, and signature verification failure as separate states.
- Refresh the authenticated subscription state immediately after successful verification.

## Files And Responsibilities

- `src/components/pages/account-settings/tabs/subscription-tab/pricing.tsx`
  Renders the plans UI and delegates payment execution to the hook.
- `src/hooks/use-subscription-payment.ts`
  Owns the subscription payment state machine and end-to-end checkout flow.
- `src/lib/subscription/razorpay.ts`
  Loads the Razorpay SDK exactly once and exposes typed checkout helpers.
- `src/services/subscription/payment.ts`
  Calls backend APIs for order creation and signature verification.

## End-To-End Flow

### 1. User selects a paid subscription plan

The pricing screen only decides which plan and cycle the user wants. It does not directly manage script loading or verification anymore.

```tsx
const handlePayNow = async (plan: PricingPlan, cycle: BillingCycle) => {
  await startSubscriptionPayment({
    plan,
    billingCycle: cycle,
    onCheckoutReady: () => setIsDetailsOpen(false),
  });
};
```

### 2. The hook validates payment state and requests an order

`useSubscriptionPayment` blocks duplicate starts by tracking a local payment flow state.

```ts
if (paymentFlowStateRef.current !== 'idle') {
  return;
}

setFlowState('initializing');

const orderData = await createSubscriptionPaymentOrder({
  planId,
  billingCycle: toApiBillingCycle(billingCycle),
});
```

### 3. The Razorpay SDK is loaded exactly once

The checkout script is handled by `src/lib/subscription/razorpay.ts`. The loader:

- reuses a shared promise while the script is loading
- reuses an existing script tag if one is already in the DOM
- times out if the SDK never becomes available
- clears the shared promise on failure so retries still work

```ts
export const loadRazorpayCheckoutScript = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  if (window.Razorpay) return true;
  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise<boolean>((resolve) => {
    // attach to existing script or create a new one
  });

  const isLoaded = await razorpayScriptPromise;
  if (!isLoaded) {
    razorpayScriptPromise = null;
  }

  return isLoaded;
};
```

### 4. Checkout is created with typed success, failure, and dismiss handlers

The hook creates a checkout instance only after order creation and SDK readiness succeed.

```ts
const razorpay = createRazorpayCheckout({
  key: orderData.razorpayKeyId,
  name: `KurlClub - ${orderData.planName}`,
  order_id: orderData.orderId,
  prefill: {
    name: orderData.customer.name,
    email: orderData.customer.email,
    contact: orderData.customer.phone,
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
    void verifyPayment({ ... });
  },
});

razorpay.on('payment.failed', (response) => {
  if (!markCheckoutSettled()) return;
  const message = getRazorpayFailureMessage(response);
  setFlowState('idle');
  openPaymentFailure('Payment Failed', message);
  toast.error(message);
});
```

## Why `markCheckoutSettled()` exists

Razorpay can trigger multiple terminal-looking events around the same flow. For example, a checkout failure can be followed by modal dismissal. We intentionally guard terminal handlers so we do not:

- show duplicate toasts
- open multiple failure dialogs
- race payment states back and forth

```ts
let didSettleCheckout = false;
const markCheckoutSettled = () => {
  if (didSettleCheckout) return false;
  didSettleCheckout = true;
  return true;
};
```

## 5. Successful payment is always verified on the backend

Frontend success from Razorpay is not treated as final success. The app always calls the backend verification endpoint with the Razorpay order ID, payment ID, and signature.

```ts
const verification = await verifyAndRenewSubscription({
  subscriptionPaymentId,
  razorpayOrderId: response.razorpay_order_id,
  razorpayPaymentId: response.razorpay_payment_id,
  razorpaySignature: response.razorpay_signature,
});
```

## 6. Auth state is refreshed immediately after a verified success

Once the backend confirms the payment, the hook refreshes the authenticated user so the subscription provider sees the new plan and lifecycle right away.

```ts
if (isSuccess) {
  await refreshUser();
  openPaymentSuccess('Subscription Updated', paymentMessage);
  toast.success('Payment verified and subscription updated.');
}
```

This keeps:

- current plan card
- subscription lifecycle
- feature gating
- plan limits

in sync without a full reload.

## 7. UI behavior after hardening

The pricing screen is intentionally thinner now:

- billing cycle toggles are disabled during an active payment flow
- plan cards are disabled during an active payment flow
- success and failure dialogs are driven by the hook
- plan details dialog only closes when checkout is actually ready to open

```tsx
<PlanCard
  key={plan.id}
  plan={plan}
  index={index}
  billingCycle={billingCycle}
  onChoosePlan={handleChoosePlan}
  disabled={isPaying}
/>
```

## 8. Service-layer guarantees

`src/services/subscription/payment.ts` now normalizes the API responses a bit more defensively.

### Order creation

- validates API `status === 'Success'` before continuing
- validates that the response includes `orderId`, `razorpayKeyId`, and `subscriptionPaymentId`
- throws a clear error when the response is incomplete

```ts
if (response.status !== 'Success' || !response.data) {
  throw new Error(
    response.message || 'Unable to initialize subscription payment.'
  );
}

if (!order?.orderId || !order.razorpayKeyId) {
  throw new Error('Subscription payment order response is incomplete.');
}
```

### Verification

- returns a normalized object with `status`, `message`, and `data`
- supplies fallback status/message so hook logic stays predictable even on partial backend payloads

```ts
return {
  status: response.status || 'Error',
  message:
    response.message || 'Unable to verify subscription payment at this time.',
  data: response.data ?? null,
};
```

### Why this matters

- the UI does not assume every `200 OK` response means business success
- partial backend payloads do not leak undefined values into checkout dialogs
- checkout and verification errors stay user-readable without adding branching noise in the component

## Enterprise-Level Decisions In This Implementation

### Separation of concerns

- Component renders UI
- Hook manages flow/state
- Lib manages third-party SDK lifecycle
- Service manages backend contracts

### Failure handling

We treat these as separate states:

- order initialization failure
- script load failure
- checkout failure
- checkout cancel
- signature verification failure

Each gets a dedicated user-facing outcome.

### Concurrency protection

The hook uses a `paymentFlowStateRef` so rapid repeated clicks do not create multiple Razorpay orders.

### No client-side key hardcoding

The Razorpay key comes from the backend order response, not from a frontend env variable, which is the correct contract for server-owned payment setup.

### Immediate subscription reconciliation

After verification, `refreshUser()` keeps the subscription provider and gated UI aligned with the backend.

## Implementation Checklist For Future Changes

If you extend this flow:

1. Keep all SDK loading changes in `src/lib/subscription/razorpay.ts`.
2. Keep order/verify API changes in `src/services/subscription/payment.ts`.
3. Keep orchestration changes in `src/hooks/use-subscription-payment.ts`.
4. Keep `pricing.tsx` focused on presentation and user intent only.
5. Never treat the Razorpay frontend handler as final payment success without backend verification.

## Recommended Manual Test Scenarios

1. Open subscription tab and start a payment for the current plan.
   Expected: success path says the plan was extended.
2. Open subscription tab and start a payment for a different plan.
   Expected: success path says the plan switched immediately.
3. Cancel the Razorpay modal.
   Expected: only a cancellation toast, no failure dialog.
4. Force a checkout failure.
   Expected: failure dialog and failure toast.
5. Force backend verification failure after successful checkout.
   Expected: failure dialog and no subscription refresh.
6. After a verified success, revisit gated areas.
   Expected: plan and access reflect backend state immediately.
