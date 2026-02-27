type PaymentValidationResult = {
  showPaidWarning: boolean;
  showUnpaidWarning: boolean;
  showOverpaymentError: boolean;
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
  return Number.isFinite(parsed) ? parsed : 0;
};

export const validatePaymentAmount = (
  amountPaid: string | undefined,
  feeStatus: string,
  totalFee: number
): PaymentValidationResult => {
  // If fee status is unpaid, skip all payment-related validation
  if (feeStatus === 'unpaid') {
    return {
      showPaidWarning: false,
      showUnpaidWarning: false,
      showOverpaymentError: false,
      hasAnyWarning: false,
    };
  }

  const paidAmount = roundToCurrency(parseAmount(amountPaid));
  const totalAmount = roundToCurrency(totalFee);
  const hasAmount = hasValue(amountPaid);

  const showPaidWarning =
    feeStatus === 'paid' && hasAmount && paidAmount < totalAmount;
  const showUnpaidWarning = false; // not applicable when feeStatus isn't 'unpaid'
  const showOverpaymentError = hasAmount && paidAmount > totalAmount;

  return {
    showPaidWarning,
    showUnpaidWarning,
    showOverpaymentError,
    hasAnyWarning: showPaidWarning || showOverpaymentError,
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
