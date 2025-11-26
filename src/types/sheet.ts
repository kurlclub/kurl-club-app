import { ReactNode } from 'react';

export interface SheetProps {
  title?: string | React.ReactNode;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  position?: 'top' | 'right' | 'bottom' | 'left';
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export interface UseSheetProps {
  defaultOpen?: boolean;
}

export interface UseSheetReturn {
  isOpen: boolean;
  openSheet: () => void;
  closeSheet: () => void;
}
