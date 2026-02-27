import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DocumentPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentUrl: string;
  title?: string;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DocumentPreviewModal({
  open,
  onOpenChange,
  documentUrl,
  title = 'Document Preview',
  isLoading = false,
  emptyMessage = 'Preview is unavailable.',
}: DocumentPreviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] bg-white dark:bg-secondary-blue-600">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-secondary-blue-700 rounded-lg p-2">
          {isLoading ? (
            <div className="w-full h-[calc(90vh-120px)] rounded-lg bg-white flex items-center justify-center text-sm text-gray-600 dark:text-gray-300">
              Loading preview...
            </div>
          ) : documentUrl ? (
            <iframe
              src={documentUrl}
              className="w-full h-[calc(90vh-120px)] border-0 rounded-lg bg-white"
              title={title}
            />
          ) : (
            <div className="w-full h-[calc(90vh-120px)] rounded-lg bg-white flex items-center justify-center text-sm text-gray-600 dark:text-gray-300">
              {emptyMessage}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
