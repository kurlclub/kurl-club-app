import { Download, FileText, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type PDFViewerProps = {
  isLoading: boolean;
  pdfUrl: string | null;
  onDownload: () => void;
};

export function PDFViewer({ isLoading, pdfUrl, onDownload }: PDFViewerProps) {
  if (isLoading) {
    return (
      <Card className="border-primary-blue-400 bg-primary-blue-500/10">
        <CardContent className="p-0">
          <div className="flex flex-col items-center justify-center py-16 text-primary-blue-200">
            <Loader2 className="w-12 h-12 mb-4 text-primary-blue-300 animate-spin" />
            <p className="text-sm font-medium">Loading invoice preview...</p>
            <p className="text-xs text-primary-blue-300 mt-1">Please wait</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!pdfUrl) {
    return (
      <Card className="border-primary-blue-400 bg-primary-blue-500/10">
        <CardContent className="p-0">
          <div className="flex flex-col items-center justify-center py-16 text-primary-blue-200">
            <FileText className="w-12 h-12 mb-4 text-primary-blue-300" />
            <p className="text-sm font-medium">Failed to load preview</p>
            <p className="text-xs text-primary-blue-300 mt-1">
              Please try again
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary-blue-400 bg-primary-blue-500/10 overflow-hidden h-full">
      <CardContent className="p-0 h-full">
        <div className="relative bg-gradient-to-b from-gray-900 to-gray-950 h-full">
          {/* Floating Action Bar */}
          <div className="absolute top-1 right-5 z-10 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={onDownload}
              className="h-8 px-2 bg-primary-blue-400 hover:bg-primary-blue-300 text-white border-0 shadow-lg"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download
            </Button>
          </div>

          {/* PDF Container */}
          <div className="border-t border-primary-blue-400/30 h-full">
            <iframe
              src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              className="w-full h-full border-0"
              title="Invoice Preview"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
