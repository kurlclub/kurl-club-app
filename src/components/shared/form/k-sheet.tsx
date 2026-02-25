'use client';

import { Cross2Icon } from '@radix-ui/react-icons';

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
  onCloseBtnClick,
}: SheetProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side={position}
        className={` bg-secondary-blue-700 border-primary-blue-400 border p-0 max-w-full! flex flex-col ${className}`}
      >
        <SheetHeader className="relative border-b border-primary-blue-400 px-5 py-[30px] bg-secondary-blue-700 h-[80px] flex-shrink-0">
          <button
            onClick={() => {
              if (onCloseBtnClick) {
                onCloseBtnClick();
                return;
              }
              onClose();
            }}
            className="fixed right-7 top-[33px] rounded-xs opacity-70 ring-offset-0 transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-0 focus:ring-offset-0 disabled:pointer-events-none z-30 data-[state=open]:bg-secondary"
          >
            <Cross2Icon className="h-6 w-6 cursor-pointer" />
            {/* <span className="sr-only">Close</span> */}
          </button>
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
