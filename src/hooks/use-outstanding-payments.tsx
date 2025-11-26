import { useState } from 'react';

import { useSearch } from '@/hooks/use-search';
import { searchItems } from '@/lib/utils';
import { OutstandingPayments } from '@/types';

export function useOutstandingPayment(initialData: OutstandingPayments[]) {
  const [outstanding, addOutstanding] =
    useState<OutstandingPayments[]>(initialData);

  const { items: filteredOutstandingPayment } = useSearch<OutstandingPayments>(
    outstanding,
    searchItems
  );

  const addOutstandingPayment = (
    newOutstandingPayment: OutstandingPayments[]
  ) => {
    addOutstanding((prevOutstandingPayment) => [
      ...prevOutstandingPayment,
      ...newOutstandingPayment,
    ]);
  };

  return {
    outstanding: filteredOutstandingPayment,
    addOutstandingPayment,
  };
}
