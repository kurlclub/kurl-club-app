import { Download } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type MobilePreviewPopupProps = {
  show: boolean;
  pdfUrl: string | null;
  onClose: () => void;
  onDownload: () => void;
};

export function MobilePreviewPopup({
  show,
  pdfUrl,
  onClose,
  onDownload,
}: MobilePreviewPopupProps) {
  return (
    <AnimatePresence>
      {show && pdfUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="md:hidden absolute inset-4 z-50 flex flex-col"
        >
          <Card className="border-primary-blue-400 bg-primary-blue-500/10 overflow-hidden h-full flex flex-col">
            <CardContent className="p-0 h-full flex flex-col">
              <div className="relative bg-gradient-to-b from-gray-900 to-gray-950 h-full flex flex-col">
                {/* Action Bar */}
                <div className="flex gap-2 p-3 border-b border-primary-blue-400/30 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={onDownload}
                    className="h-8 px-3 bg-primary-blue-400 hover:bg-primary-blue-300 text-white border-0"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onClose}
                    className="h-8 px-3 ml-auto"
                  >
                    Close
                  </Button>
                </div>
                {/* PDF Container */}
                <div className="flex-1 overflow-hidden">
                  <iframe
                    src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                    className="w-full h-full border-0"
                    title="Invoice Preview"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
