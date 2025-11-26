'use client';

import { useCallback, useState } from 'react';

import { UseSheetProps, UseSheetReturn } from '@/types/sheet';

export const useSheet = ({
  defaultOpen = false,
}: UseSheetProps = {}): UseSheetReturn => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const openSheet = useCallback(() => setIsOpen(true), []);
  const closeSheet = useCallback(() => setIsOpen(false), []);

  return { isOpen, openSheet, closeSheet };
};
