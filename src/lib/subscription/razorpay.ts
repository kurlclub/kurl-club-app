const RAZORPAY_SCRIPT_ID = 'razorpay-checkout-script';
const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';
const RAZORPAY_SCRIPT_TIMEOUT_MS = 10_000;

let razorpayScriptPromise: Promise<boolean> | null = null;

export type RazorpayCheckoutSuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

export type RazorpayCheckoutFailureResponse = {
  error?: {
    code?: string;
    description?: string;
    source?: string;
    step?: string;
    reason?: string;
    metadata?: {
      order_id?: string;
      payment_id?: string;
    };
  };
};

export type RazorpayCheckoutOptions = {
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
  handler?: (response: RazorpayCheckoutSuccessResponse) => void;
};

export type RazorpayCheckoutInstance = {
  open: () => void;
  on: (
    event: 'payment.failed',
    handler: (response: RazorpayCheckoutFailureResponse) => void
  ) => void;
};

declare global {
  interface Window {
    Razorpay?: new (
      options: RazorpayCheckoutOptions
    ) => RazorpayCheckoutInstance;
  }
}

const getExistingRazorpayScript = (): HTMLScriptElement | null => {
  if (typeof document === 'undefined') return null;

  return (
    (document.getElementById(RAZORPAY_SCRIPT_ID) as HTMLScriptElement | null) ??
    Array.from(document.scripts).find(
      (script) => script.src === RAZORPAY_SCRIPT_SRC
    ) ??
    null
  );
};

export const loadRazorpayCheckoutScript = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  if (window.Razorpay) return true;
  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise<boolean>((resolve) => {
    const existingScript = getExistingRazorpayScript();
    const script = existingScript ?? document.createElement('script');

    const cleanup = () => {
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
      window.clearTimeout(timeoutId);
    };

    const settle = (isLoaded: boolean) => {
      cleanup();
      if (!isLoaded && !existingScript) {
        script.remove();
      }
      resolve(isLoaded);
    };

    const handleLoad = () => {
      if (!existingScript) {
        script.dataset.loaded = 'true';
      }
      settle(Boolean(window.Razorpay));
    };

    const handleError = () => {
      settle(false);
    };

    const timeoutId = window.setTimeout(() => {
      settle(Boolean(window.Razorpay));
    }, RAZORPAY_SCRIPT_TIMEOUT_MS);

    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);

    if (!existingScript) {
      script.id = RAZORPAY_SCRIPT_ID;
      script.src = RAZORPAY_SCRIPT_SRC;
      script.async = true;
      document.head.appendChild(script);
      return;
    }

    if (existingScript.dataset.loaded === 'true') {
      settle(Boolean(window.Razorpay));
    }
  });

  const isLoaded = await razorpayScriptPromise;
  if (!isLoaded) {
    razorpayScriptPromise = null;
  }

  return isLoaded;
};

export const createRazorpayCheckout = (
  options: RazorpayCheckoutOptions
): RazorpayCheckoutInstance => {
  if (typeof window === 'undefined' || !window.Razorpay) {
    throw new Error('Razorpay checkout is unavailable.');
  }

  return new window.Razorpay(options);
};

export const getRazorpayFailureMessage = (
  response: RazorpayCheckoutFailureResponse
) => {
  const description = response.error?.description?.trim();
  const reason = response.error?.reason?.trim();
  const step = response.error?.step?.trim();

  if (description && reason) {
    return `${description} (${reason})`;
  }

  if (description) {
    return description;
  }

  if (reason) {
    return `Payment failed: ${reason}`;
  }

  if (step) {
    return `Payment failed during ${step}. Please try again.`;
  }

  return 'Payment failed. Please try again or contact support.';
};
