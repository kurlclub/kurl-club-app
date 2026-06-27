import {
  formatCompactNumber,
  formatGroupedNumber,
  toFiniteNumber,
} from '@/lib/utils';

type CurrencyFormatOptions = {
  currencySymbol: string;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
};

/**
 * Formats a raw numeric amount with the active currency symbol.
 *
 * Callers pass an unformatted number so they never stitch together symbols and
 * grouped values by hand. Negative values keep the sign in front of the symbol.
 */
export const formatCurrencyAmount = (
  amount: number,
  options: CurrencyFormatOptions
): string => {
  const numericValue = toFiniteNumber(amount);
  const absoluteValue = Math.abs(numericValue);
  const sign = numericValue < 0 ? '-' : '';

  return `${sign}${options.currencySymbol}${formatGroupedNumber(absoluteValue, {
    locale: options.locale ?? 'en-IN',
    minimumFractionDigits: options.minimumFractionDigits,
    maximumFractionDigits: options.maximumFractionDigits,
  })}`;
};

/**
 * Formats a raw numeric amount using compact notation.
 *
 * Use this for charts, badges, and summary cards where the full grouped amount
 * would be too wide for the available space.
 */
export const formatCompactCurrencyAmount = (
  amount: number,
  options: CurrencyFormatOptions
): string => {
  const numericValue = toFiniteNumber(amount);
  const absoluteValue = Math.abs(numericValue);
  const sign = numericValue < 0 ? '-' : '';

  return `${sign}${options.currencySymbol}${formatCompactNumber(absoluteValue, {
    locale: options.locale ?? 'en-IN',
    minimumFractionDigits: options.minimumFractionDigits,
    maximumFractionDigits: options.maximumFractionDigits,
  })}`;
};

/**
 * Formats a subscription or pricing amount and returns `Free` for zero.
 *
 * Keeps price labels consistent across subscription surfaces while preserving
 * the app's existing zero-price copy.
 */
export const formatPrice = (
  amount: number,
  options: CurrencyFormatOptions & { freeLabel?: string }
): string =>
  toFiniteNumber(amount) === 0
    ? (options.freeLabel ?? 'Free')
    : formatCurrencyAmount(amount, options);

/**
 * Backward-compatible helper. Formats a value with the given currency symbol,
 * defaulting to the rupee symbol so existing call sites keep working until they
 * are migrated to pass the gym's selected symbol via `useCurrency`.
 */
export const formatCurrency = (
  value: number | string,
  currencySymbol = '₹'
): string => {
  if (!value) return `${currencySymbol}0`;

  return formatCurrencyAmount(Number(value), { currencySymbol });
};
