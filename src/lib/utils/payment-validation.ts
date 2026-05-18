type PaymentValidationResult = {
  showPaidWarning: boolean;
  showPartialWarning: boolean;
  showUnpaidWarning: boolean;
  showOverpaymentError: boolean;
  showDiscountError: boolean;
  hasAnyWarning: boolean;
};

const CURRENCY_SCALE = 100;

const roundToCurrency = (value: number): number =>
  Math.round((value + Number.EPSILON) * CURRENCY_SCALE) / CURRENCY_SCALE;

const hasValue = (value: string | undefined): boolean =>
  Boolean(value && value.trim() !== '');

const parseAmount = (value: string | undefined): number => {
  if (!hasValue(value)) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

export const validatePaymentAmount = (
  amountPaid: string | undefined,
  feeStatus: string,
  totalFee: number,
  discountAmount?: string | undefined
): PaymentValidationResult => {
  const paidAmount = roundToCurrency(parseAmount(amountPaid));
  const discount = roundToCurrency(parseAmount(discountAmount));
  const totalAmount = roundToCurrency(totalFee);
  const hasAmount = hasValue(amountPaid);
  const effectiveTotal = roundToCurrency(Math.max(0, totalAmount - discount));

  // Discount validation (applies to all statuses)
  const showDiscountError = discount >= totalAmount;

  // If fee status is unpaid, skip payment-related validation
  if (feeStatus === 'unpaid') {
    return {
      showPaidWarning: false,
      showPartialWarning: false,
      showUnpaidWarning: false,
      showOverpaymentError: false,
      showDiscountError,
      hasAnyWarning: showDiscountError,
    };
  }

  // Paid status: amount must equal effectiveTotal
  const showPaidWarning =
    feeStatus === 'paid' && hasAmount && paidAmount !== effectiveTotal;

  // Partially paid: amount must be between 1 and (effectiveTotal - 1)
  const showPartialWarning =
    feeStatus === 'partially_paid' &&
    (paidAmount === 0 || paidAmount >= effectiveTotal);

  // Overpayment: amount exceeds effectiveTotal
  const showOverpaymentError = hasAmount && paidAmount > effectiveTotal;

  return {
    showPaidWarning,
    showPartialWarning,
    showUnpaidWarning: false,
    showOverpaymentError,
    showDiscountError,
    hasAnyWarning:
      showPaidWarning ||
      showPartialWarning ||
      showOverpaymentError ||
      showDiscountError,
  };
};

export const calculateSessionTotal = (
  numberOfSessions: string | undefined,
  customRate: string | undefined,
  defaultRate: number
): number => {
  const sessionsNum = parseAmount(numberOfSessions);
  const sessionRate = hasValue(customRate)
    ? parseAmount(customRate)
    : defaultRate;
  return sessionsNum > 0 ? roundToCurrency(sessionRate * sessionsNum) : 0;
};

export const calculatePlanFee = (
  isPerSession: boolean,
  numberOfSessions: string | undefined,
  customSessionRate: string | undefined,
  planFee: number
): number => {
  if (!isPerSession) return planFee;

  return calculateSessionTotal(numberOfSessions, customSessionRate, planFee);
};
