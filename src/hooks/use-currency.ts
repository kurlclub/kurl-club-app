'use client';

import { useCallback } from 'react';

import { useQuery } from '@tanstack/react-query';

import { getCurrencySymbol } from '@/lib/constants/regional-options';
import { useGymBranch } from '@/providers/gym-branch-provider';
import { getGymCurrencyRegion } from '@/services/gym';
import {
  formatCompactCurrencyAmount,
  formatCurrencyAmount,
} from '@/utils/format-currency';

const FALLBACK_CURRENCY_CODE = 'INR';
const FALLBACK_CURRENCY_SYMBOL = '₹';

/**
 * Resolves the gym's selected currency and exposes symbol-aware formatters.
 *
 * Mirrors the mobile app's `useCurrency` hook. The selected currency is fetched
 * from the gym's regional settings via React Query (keyed by `gymId`), so any
 * update made in Regional Settings — which invalidates `['gymCurrency', gymId]`
 * — propagates to every consumer instantly.
 */
export function useCurrency() {
  const { gymBranch } = useGymBranch();

  const { data } = useQuery({
    queryKey: ['gymCurrency', gymBranch?.gymId],
    queryFn: () => getGymCurrencyRegion(gymBranch!.gymId),
    enabled: !!gymBranch?.gymId,
    staleTime: 5 * 60 * 1000,
  });

  const currencyCode = data?.currency || FALLBACK_CURRENCY_CODE;
  const currencySymbol =
    getCurrencySymbol(currencyCode) || FALLBACK_CURRENCY_SYMBOL;

  const formatAmount = useCallback(
    (amount: number) =>
      formatCurrencyAmount(amount, {
        currencySymbol,
        maximumFractionDigits: 0,
      }),
    [currencySymbol]
  );

  const formatCompactAmount = useCallback(
    (
      amount: number,
      options?: {
        minimumFractionDigits?: number;
        maximumFractionDigits?: number;
      }
    ) =>
      formatCompactCurrencyAmount(amount, {
        currencySymbol,
        minimumFractionDigits: options?.minimumFractionDigits,
        maximumFractionDigits: options?.maximumFractionDigits,
      }),
    [currencySymbol]
  );

  return { currencySymbol, currencyCode, formatAmount, formatCompactAmount };
}
