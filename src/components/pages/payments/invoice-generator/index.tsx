'use client';

import { useState } from 'react';

import { FileText, Loader2, Mail, Send } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';

import { KSheet } from '@/components/shared/form/k-sheet';
import { Button } from '@/components/ui/button';
import { useAppDialog } from '@/hooks/use-app-dialog';
import {
  useInvoiceManagement,
  usePaymentHistory,
} from '@/hooks/use-payment-management';
import type { MemberPaymentDetails } from '@/types/payment';

import { MobilePreviewPopup } from './mobile-preview-popup';
import { PaymentListItem } from './payment-list-item';
import { PDFViewer } from './pdf-viewer';

type InvoiceGeneratorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: MemberPaymentDetails | null;
};

export function InvoiceGenerator({
  open,
  onOpenChange,
  member,
}: InvoiceGeneratorProps) {
  const [selectedPayment, setSelectedPayment] = useState<number | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const { data: paymentHistory = [], isLoading } = usePaymentHistory(
    member?.memberId || 0
  );
  const { exportInvoice, sendInvoiceEmail, isExporting, isSending } =
    useInvoiceManagement();
  const { showConfirm } = useAppDialog();

  const handlePaymentSelect = async (paymentId: number) => {
    // Avoid re-fetching if same payment is already selected
    if (selectedPayment === paymentId && pdfUrl) {
      return;
    }

    setSelectedPayment(paymentId);
    try {
      const { blob } = await exportInvoice(paymentId);
      setPdfUrl(URL.createObjectURL(blob));
    } catch {
      toast.error('Failed to load invoice preview');
    }
  };

  const handleDownloadPdf = async () => {
    if (!selectedPayment) return;

    try {
      const { blob, filename } = await exportInvoice(selectedPayment);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Invoice downloaded successfully!');
    } catch {
      toast.error('Failed to download invoice');
    }
  };

  const handleSendInvoice = () => {
    if (!selectedPayment || !member) return;

    const payment = paymentHistory.find((p) => p.id === selectedPayment);
    if (!payment) return;

    showConfirm({
      title: 'Send Invoice Email',
      description: `Send payment receipt for ₹${payment.amount} to ${member.memberName}?`,
      confirmLabel: 'Send Email',
      onConfirm: async () => {
        await sendInvoiceEmail(selectedPayment);
        onOpenChange(false);
      },
    });
  };

  const handleClose = () => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setSelectedPayment(null);
    setPdfUrl(null);
    onOpenChange(false);
  };

  const footer = (
    <div className="flex items-center justify-between w-full">
      <Button variant="outline" onClick={handleClose}>
        Close
      </Button>
      {selectedPayment && (
        <Button onClick={handleSendInvoice} disabled={isSending}>
          {isSending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Send className="w-4 h-4 mr-2" />
          )}
          Send Invoice Email
        </Button>
      )}
    </div>
  );

  return (
    <KSheet
      isOpen={open}
      onClose={handleClose}
      title="Generate Invoice"
      footer={footer}
      className={`w-[480px] transition-all duration-500 ease-in-out ${
        selectedPayment ? 'md:w-[900px] lg:w-[1100px]' : 'md:w-[480px]'
      }`}
    >
      {!member ? null : (
        <div className="relative space-y-6 md:space-y-0 h-full">
          {/* Member Info Header - Mobile Only */}
          <div className="md:hidden rounded-lg border border-primary-blue-400 bg-gradient-to-br from-secondary-blue-500 to-primary-blue-500 px-5 py-4 shadow-sm mb-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-xs font-bold text-primary-green-200 tracking-wider uppercase">
                    #
                    {member.memberIdentifier ||
                      `KC${member.memberId.toString().padStart(3, '0')}`}
                  </div>
                  <div className="h-1 w-1 rounded-full bg-primary-blue-300" />
                  <div className="text-xs text-primary-blue-200">
                    Invoice Generator
                  </div>
                </div>
                <h1 className="text-lg font-semibold text-white">
                  {member.memberName}
                </h1>
              </div>
              {selectedPayment && (
                <button
                  onClick={() => setShowMobilePreview(true)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-blue-400/30 hover:bg-primary-blue-400/50 transition-colors"
                >
                  <FileText className="w-5 h-5 text-primary-green-200" />
                </button>
              )}
            </div>
          </div>

          {/* Two-Panel Layout */}
          <div className="flex flex-col md:flex-row md:gap-6 md:h-[calc(100vh-280px)]">
            {/* Left Panel - Payment History List */}
            <div
              className={`space-y-3 ${selectedPayment ? 'md:w-[380px] md:flex-shrink-0' : 'md:w-full'}`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">
                  Select Payment Transaction
                </h3>
                <div className="text-xs text-primary-blue-200">
                  {paymentHistory.length} transaction
                  {paymentHistory.length !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="space-y-2 max-h-[280px] md:max-h-[calc(100vh-320px)] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-primary-blue-400 scrollbar-track-transparent">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-primary-blue-300">
                    <Loader2 className="w-8 h-8 mb-3 animate-spin" />
                    <p className="text-sm">Loading payment history...</p>
                  </div>
                ) : paymentHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-primary-blue-300">
                    <FileText className="w-12 h-12 mb-3 text-primary-blue-400" />
                    <p className="text-sm font-medium">
                      No payment history found
                    </p>
                    <p className="text-xs text-primary-blue-400 mt-1">
                      No transactions available
                    </p>
                  </div>
                ) : (
                  paymentHistory.map((payment) => (
                    <PaymentListItem
                      key={payment.id}
                      payment={payment}
                      isSelected={selectedPayment === payment.id}
                      onSelect={handlePaymentSelect}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Right Panel - Invoice Preview (Desktop Only) */}
            <AnimatePresence mode="wait">
              {selectedPayment && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="hidden md:flex md:flex-col md:flex-1 space-y-3 overflow-hidden h-full"
                >
                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="flex items-center justify-between flex-shrink-0"
                  >
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary-green-200" />
                      Invoice Preview
                    </h3>
                    <div className="text-xs text-primary-blue-200">
                      Ready to send
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                    className="flex-1 min-h-0"
                  >
                    <PDFViewer
                      isLoading={isExporting}
                      pdfUrl={pdfUrl}
                      onDownload={handleDownloadPdf}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Invoice Preview Popup */}
          <MobilePreviewPopup
            show={showMobilePreview}
            pdfUrl={pdfUrl}
            onClose={() => setShowMobilePreview(false)}
            onDownload={handleDownloadPdf}
          />
        </div>
      )}
    </KSheet>
  );
}
