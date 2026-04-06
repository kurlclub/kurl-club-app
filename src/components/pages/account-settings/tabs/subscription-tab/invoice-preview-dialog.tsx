'use client';

import { Download, FileText, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type InvoicePreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfUrl: string | null;
  title?: string;
  description?: string;
  downloadFileName?: string;
  isLoading?: boolean;
  isDownloading?: boolean;
  errorMessage?: string;
  onDownload?: () => void;
};

export function InvoicePreviewDialog({
  open,
  onOpenChange,
  pdfUrl,
  title = 'Invoice Preview',
  description = 'Preview your invoice PDF and download it.',
  downloadFileName = 'invoice.pdf',
  isLoading = false,
  isDownloading = false,
  errorMessage = 'Unable to load invoice preview.',
  onDownload,
}: InvoicePreviewDialogProps) {
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
      return;
    }

    if (!pdfUrl) return;

    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = downloadFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl border-secondary-blue-400 bg-secondary-blue-500 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">{title}</DialogTitle>
          <div className="flex items-center gap-4 justify-between">
            <DialogDescription className="text-secondary-blue-200">
              {description}
            </DialogDescription>
            <Button
              type="button"
              size="sm"
              onClick={handleDownload}
              disabled={!pdfUrl || isLoading || isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isDownloading ? 'Downloading…' : 'Download PDF'}
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-3">
          <div className="h-[65vh] overflow-hidden rounded-lg border border-secondary-blue-400 bg-white">
            {isLoading ? (
              <div className="flex h-full items-center justify-center text-secondary-blue-500">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : pdfUrl ? (
              <iframe
                src={`${pdfUrl}#toolbar=0&navpanes=0`}
                className="h-full w-full border-0"
                title={title}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-secondary-blue-500">
                <FileText className="h-8 w-8" />
                <p className="text-sm font-medium">{errorMessage}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
