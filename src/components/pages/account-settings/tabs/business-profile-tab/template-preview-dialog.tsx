'use client';

import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { InvoiceTemplate } from '@/services/invoice';

type TemplatePreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: InvoiceTemplate | null;
};

export function TemplatePreviewDialog({
  open,
  onOpenChange,
  template,
}: TemplatePreviewDialogProps) {
  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 gap-0 bg-secondary-blue-500 border-primary-blue-400">
        <DialogHeader className="px-6 py-4 border-b border-primary-blue-400">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-lg">
              {template.name} Template Preview
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden bg-linear-to-b from-secondary-blue-600 to-secondary-blue-700">
          <div className="w-full h-full bg-white">
            <iframe
              src={template.previewUrl}
              className="w-full h-full border-0"
              title={`${template.name} Template Preview`}
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-primary-blue-400 bg-secondary-blue-600">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-300">
              This is how your invoice will look with the {template.name}{' '}
              template
            </p>
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              size="sm"
            >
              Close Preview
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
