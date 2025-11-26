'use client';

import { useCallback, useState } from 'react';

type SearchFunction<T> = (items: T[], searchTerm: string) => T[];

export function useSearch<T>(
  initialItems: T[],
  searchFunction: SearchFunction<T>
) {
  const [searchTerm, setSearchTerm] = useState('');

  const search = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  // Calculate filtered items directly without state
  const items =
    searchTerm.trim() === ''
      ? initialItems
      : searchFunction(initialItems, searchTerm);

  return { items, search, searchTerm };
}
