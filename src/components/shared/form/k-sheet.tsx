'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { SheetProps } from '@/types/sheet';

export const KSheet = ({
  title,
  description,
  children,
  footer,
  isOpen,
  onClose,
  position = 'right',
  className,
}: SheetProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side={position}
        className={`bg-secondary-blue-700 border-primary-blue-400 border p-0 max-w-full! flex flex-col ${className}`}
      >
        <SheetHeader className="border-b border-primary-blue-400 px-5 py-[30px] bg-secondary-blue-700 h-[80px] flex-shrink-0">
          {title && (
            <SheetTitle className="text-xl font-medium text-white leading-normal ">
              {title}
            </SheetTitle>
          )}
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="px-5 pb-5 pt-2 flex-1 overflow-y-auto">{children}</div>
        {footer && (
          <div className="flex h-[80px] justify-end bg-secondary-blue-700 px-3 py-4 border-t border-primary-blue-400 flex-shrink-0">
            {footer}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
