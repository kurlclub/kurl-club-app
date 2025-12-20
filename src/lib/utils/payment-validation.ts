type PaymentValidationResult = {
  showPaidWarning: boolean;
  showUnpaidWarning: boolean;
  showOverpaymentError: boolean;
  hasAnyWarning: boolean;
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

  const paidAmount = amountPaid ? Number(amountPaid) : 0;

  const showPaidWarning =
    feeStatus === 'paid' && !!amountPaid && paidAmount < totalFee;
  const showUnpaidWarning = false; // not applicable when feeStatus isn't 'unpaid'
  const showOverpaymentError = !!amountPaid && paidAmount > totalFee;

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
  const sessionsNum = numberOfSessions ? Number(numberOfSessions) : 0;
  const sessionRate = customRate ? Number(customRate) : defaultRate;
  return sessionsNum > 0 ? sessionRate * sessionsNum : 0;
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
