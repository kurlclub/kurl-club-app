import { useState } from 'react';

import { useSearch } from '@/hooks/use-search';
import { searchItems } from '@/lib/utils';
import { Skippers } from '@/types';

export function useSkippers(initialData: Skippers[]) {
  const [outstanding, addOutstanding] = useState<Skippers[]>(initialData);

  const { items: filteredOutstandingPayment } = useSearch<Skippers>(
    outstanding,
    searchItems
  );

  const addOutstandingPayment = (newOutstandingPayment: Skippers[]) => {
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
