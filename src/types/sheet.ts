import { ReactNode } from 'react';

export interface SheetProps {
  title?: string | React.ReactNode;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  onIconClose?: () => void;
  position?: 'top' | 'right' | 'bottom' | 'left';
  onOpenChange?: (open: boolean) => void;
  className?: string;
  onCloseBtnClick?: () => void;
}

export interface UseSheetProps {
  defaultOpen?: boolean;
}

export interface UseSheetReturn {
  isOpen: boolean;
  openSheet: () => void;
  closeSheet: () => void;
}
