'use client';

import { useCallback, useMemo, useState } from 'react';

type SearchFunction<T> = (items: T[], term: string) => T[];

export function useFilterableList<T>(
  initialData: T[] = [],
  searchFunction: SearchFunction<T>
) {
  const [searchTerm, setSearchTerm] = useState('');

  const search = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const items = useMemo(() => {
    if (searchTerm.trim() === '') {
      return initialData;
    }
    return searchFunction(initialData, searchTerm);
  }, [initialData, searchTerm, searchFunction]);

  const addItems = useCallback(() => {
    // Placeholder function for compatibility
  }, []);

  return {
    items,
    addItems,
    search,
    searchTerm,
  };
}
