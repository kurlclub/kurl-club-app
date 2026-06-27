'use client';

import * as React from 'react';

import { Cross2Icon } from '@radix-ui/react-icons';
import {
  AnimatePresence,
  type Variants,
  motion,
  useReducedMotion,
} from 'motion/react';
import { Dialog as SheetPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';
import { SheetProps } from '@/types/sheet';

// Per-side positioning + the axis the panel slides along.
const POSITION = {
  right: {
    box: 'inset-y-0 right-0 h-full',
    origin: 'right center',
    axis: 'x',
    from: '100%',
  },
  left: {
    box: 'inset-y-0 left-0 h-full',
    origin: 'left center',
    axis: 'x',
    from: '-100%',
  },
  top: {
    box: 'inset-x-0 top-0 w-full',
    origin: 'center top',
    axis: 'y',
    from: '-100%',
  },
  bottom: {
    box: 'inset-x-0 bottom-0 w-full',
    origin: 'center bottom',
    axis: 'y',
    from: '100%',
  },
} as const;

// Header / body / footer fade-and-rise in sequence once the panel has slid in.
const staggerContainer: Variants = {
  animate: { transition: { staggerChildren: 0.07, delayChildren: 0.18 } },
};
const staggerItem: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

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
  const reduce = useReducedMotion();
  const p = POSITION[position] ?? POSITION.right;

  const offset = p.axis === 'x' ? { x: p.from } : { y: p.from };
  const center = p.axis === 'x' ? { x: 0 } : { y: 0 };

  const panelMotion = reduce
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2, ease: 'easeOut' as const },
      }
    : {
        initial: { ...offset, scale: 0.96 },
        animate: { ...center, scale: 1 },
        exit: { ...offset, scale: 0.96 },
        transition: {
          type: 'tween' as const,
          ease: 'easeOut' as const,
          duration: 0.35,
        },
      };

  const stagger = !reduce;

  return (
    <SheetPrimitive.Root
      open={isOpen}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <SheetPrimitive.Portal forceMount>
        <AnimatePresence>
          {isOpen && (
            <React.Fragment key="k-sheet">
              <SheetPrimitive.Overlay asChild forceMount>
                <motion.div
                  className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </SheetPrimitive.Overlay>

              <SheetPrimitive.Content asChild forceMount>
                <motion.div
                  style={{ transformOrigin: p.origin }}
                  className={cn(
                    'fixed z-50 flex flex-col overflow-hidden border border-primary-blue-400 bg-secondary-blue-700 p-0 shadow-2xl max-w-full!',
                    p.box,
                    'w-3/4 sm:max-w-sm',
                    className
                  )}
                  initial={panelMotion.initial}
                  animate={panelMotion.animate}
                  exit={panelMotion.exit}
                  transition={panelMotion.transition}
                >
                  <motion.div
                    className="flex min-h-0 flex-1 flex-col"
                    variants={stagger ? staggerContainer : undefined}
                    initial={stagger ? 'initial' : false}
                    animate={stagger ? 'animate' : undefined}
                  >
                    <motion.div
                      variants={stagger ? staggerItem : undefined}
                      className="relative flex h-20 shrink-0 flex-col justify-center space-y-2 border-b border-primary-blue-400 bg-secondary-blue-700 px-5 py-7.5 text-left"
                    >
                      <button
                        onClick={() => {
                          if (onCloseBtnClick) {
                            onCloseBtnClick();
                            return;
                          }
                          onClose();
                        }}
                        className="absolute right-7 top-8.25 z-30 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-0 disabled:pointer-events-none"
                      >
                        <Cross2Icon className="h-6 w-6 cursor-pointer" />
                      </button>
                      {title && (
                        <SheetPrimitive.Title className="text-xl font-medium leading-normal text-white">
                          {title}
                        </SheetPrimitive.Title>
                      )}
                      {description && (
                        <SheetPrimitive.Description className="text-sm text-muted-foreground">
                          {description}
                        </SheetPrimitive.Description>
                      )}
                    </motion.div>

                    <motion.div
                      variants={stagger ? staggerItem : undefined}
                      className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-2"
                    >
                      {children}
                    </motion.div>

                    {footer && (
                      <motion.div
                        variants={stagger ? staggerItem : undefined}
                        className="flex h-20 shrink-0 justify-end border-t border-primary-blue-400 bg-secondary-blue-700 px-3 py-4"
                      >
                        {footer}
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              </SheetPrimitive.Content>
            </React.Fragment>
          )}
        </AnimatePresence>
      </SheetPrimitive.Portal>
    </SheetPrimitive.Root>
  );
};
