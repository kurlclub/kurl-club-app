'use client';

import type React from 'react';
import { createContext, useContext, useState } from 'react';

import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type DialogOptions = {
  title: string;
  description: string;
  variant?: 'default' | 'destructive' | 'success';
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  loadingLabel?: string;
};

type DialogContextType = {
  openDialog: (options: DialogOptions) => void;
  closeDialog: () => void;
};

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [dialogOptions, setDialogOptions] = useState<DialogOptions | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const openDialog = (options: DialogOptions) => {
    setDialogOptions(options);
  };

  const closeDialog = () => {
    setDialogOptions(null);
  };

  const handleConfirm = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await dialogOptions?.onConfirm?.();
    } finally {
      setIsLoading(false);
      closeDialog();
    }
  };

  const handleCancel = () => {
    dialogOptions?.onCancel?.();
    closeDialog();
  };

  return (
    <DialogContext.Provider value={{ openDialog, closeDialog }}>
      {children}
      <Dialog
        open={!!dialogOptions}
        onOpenChange={isLoading ? undefined : closeDialog}
      >
        <DialogContent className="bg-secondary-blue-700 border-primary-blue-400">
          <DialogHeader>
            <DialogTitle>{dialogOptions?.title}</DialogTitle>
            <DialogDescription>{dialogOptions?.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {dialogOptions?.cancelLabel && (
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                {dialogOptions.cancelLabel}
              </Button>
            )}
            {dialogOptions?.confirmLabel && (
              <Button
                variant={
                  dialogOptions.variant === 'destructive'
                    ? 'destructive'
                    : 'default'
                }
                onClick={handleConfirm}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading
                  ? dialogOptions.loadingLabel || 'Loading...'
                  : dialogOptions.confirmLabel}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};
