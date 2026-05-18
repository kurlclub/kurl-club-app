import { useMemo } from 'react';

export type PaymentCalculation = {
  packageAmount: number;
  discount: number;
  effectiveTotal: number;
  amountPaid: number;
  pendingAmount: number;
};

export type PaymentValidation = {
  showPaidWarning: boolean;
  showPartialWarning: boolean;
  showOverpaymentError: boolean;
  showDiscountError: boolean;
  hasAnyWarning: boolean;
};

type UsePaymentDiscountParams = {
  packageAmount: number;
  discountAmount?: string;
  amountPaid?: string;
  feeStatus?: string;
};

const parseAmount = (value: string | undefined): number => {
  if (!value || value.trim() === '') return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

const roundToCurrency = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export const usePaymentDiscount = ({
  packageAmount,
  discountAmount,
  amountPaid,
  feeStatus = '',
}: UsePaymentDiscountParams) => {
  const calculation = useMemo<PaymentCalculation>(() => {
    const discount = roundToCurrency(parseAmount(discountAmount));
    const paid = roundToCurrency(parseAmount(amountPaid));
    const effectiveTotal = roundToCurrency(
      Math.max(0, packageAmount - discount)
    );
    const pending = roundToCurrency(Math.max(0, effectiveTotal - paid));

    return {
      packageAmount: roundToCurrency(packageAmount),
      discount,
      effectiveTotal,
      amountPaid: paid,
      pendingAmount: pending,
    };
  }, [packageAmount, discountAmount, amountPaid]);

  const validation = useMemo<PaymentValidation>(() => {
    const { discount, effectiveTotal, amountPaid: paid } = calculation;

    // Discount validation (applies to all statuses)
    const showDiscountError = discount >= packageAmount;

    // Skip payment validation for unpaid status
    if (feeStatus === 'unpaid') {
      return {
        showPaidWarning: false,
        showPartialWarning: false,
        showOverpaymentError: false,
        showDiscountError,
        hasAnyWarning: showDiscountError,
      };
    }

    const hasPaidAmount = paid > 0;

    // Paid status: amount must equal effectiveTotal
    const showPaidWarning =
      feeStatus === 'paid' && hasPaidAmount && paid !== effectiveTotal;

    // Partially paid: amount must be between 1 and (effectiveTotal - 1)
    const showPartialWarning =
      feeStatus === 'partially_paid' && (paid === 0 || paid >= effectiveTotal);

    // Overpayment: amount exceeds effectiveTotal
    const showOverpaymentError = hasPaidAmount && paid > effectiveTotal;

    return {
      showPaidWarning,
      showPartialWarning,
      showOverpaymentError,
      showDiscountError,
      hasAnyWarning:
        showPaidWarning ||
        showPartialWarning ||
        showOverpaymentError ||
        showDiscountError,
    };
  }, [calculation, feeStatus, packageAmount]);

  return {
    calculation,
    validation,
  };
};
