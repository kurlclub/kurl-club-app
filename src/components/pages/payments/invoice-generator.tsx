'use client';

import { useState } from 'react';

import { Download, FileText, Loader2, Mail, Send } from 'lucide-react';
import { toast } from 'sonner';

import { KSheet } from '@/components/shared/form/k-sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAppDialog } from '@/hooks/use-app-dialog';
import {
  useInvoiceManagement,
  usePaymentHistory,
} from '@/hooks/use-payment-management';
import { formatDateTime } from '@/lib/utils';
import type { PaymentHistory } from '@/services/transaction';
import type { MemberPaymentDetails } from '@/types/payment';

type InvoiceGeneratorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: MemberPaymentDetails | null;
};

type PaymentListItemProps = {
  payment: PaymentHistory;
  isSelected: boolean;
  onSelect: (paymentId: number) => void;
};

type PDFViewerProps = {
  isLoading: boolean;
  pdfUrl: string | null;
  onDownload: () => void;
};

function PaymentListItem({
  payment,
  isSelected,
  onSelect,
}: PaymentListItemProps) {
  return (
    <Card
      className={`cursor-pointer transition-all ${
        isSelected
          ? 'border-primary-green-400 bg-primary-green-500/10 shadow-md'
          : 'border-primary-blue-400 bg-primary-blue-500/10 hover:bg-primary-blue-500/20 hover:border-primary-blue-300'
      }`}
      onClick={() => onSelect(payment.id)}
    >
      <CardContent className="p-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <div className="text-white font-semibold text-base">
                ₹{payment.amount.toLocaleString()}
              </div>
              {isSelected && (
                <div className="h-1.5 w-1.5 rounded-full bg-primary-green-400 animate-pulse" />
              )}
            </div>
            <div className="text-xs text-primary-blue-200">
              {payment.paymentMethod}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-primary-blue-300">
              {formatDateTime(payment.paymentDate, 'date')}
            </div>
            <div className="text-[10px] text-primary-blue-200 font-mono mt-0.5">
              #{payment.id}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PDFViewer({ isLoading, pdfUrl, onDownload }: PDFViewerProps) {
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
    <Card className="border-primary-blue-400 bg-primary-blue-500/10 overflow-hidden">
      <CardContent className="p-0">
        <div className="relative bg-gradient-to-b from-gray-900 to-gray-950">
          {/* Floating Action Bar */}
          <div className="absolute top-3 right-3 z-10 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={onDownload}
              className="h-8 px-3 bg-primary-blue-400 hover:bg-primary-blue-300 text-white border-0 shadow-lg"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download
            </Button>
          </div>

          {/* PDF Container */}
          <div className="border-t border-primary-blue-400/30">
            <iframe
              src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              className="w-full h-[400px] border-0"
              title="Invoice Preview"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function InvoiceGenerator({
  open,
  onOpenChange,
  member,
}: InvoiceGeneratorProps) {
  const [selectedPayment, setSelectedPayment] = useState<number | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { data: paymentHistory = [], isLoading } = usePaymentHistory(
    member?.memberId || 0
  );
  const { exportInvoice, sendInvoiceEmail, isExporting, isSending } =
    useInvoiceManagement();
  const { showConfirm } = useAppDialog();

  const handlePaymentSelect = async (paymentId: number) => {
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
      className="w-[480px]"
    >
      {!member ? null : (
        <div className="space-y-6">
          {/* Member Info Header */}
          <div className="rounded-lg border border-primary-blue-400 bg-gradient-to-br from-secondary-blue-500 to-primary-blue-500 px-5 py-4 shadow-sm">
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
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-blue-400/30">
                <FileText className="w-5 h-5 text-primary-green-200" />
              </div>
            </div>
          </div>

          {/* Payment History List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                Select Payment Transaction
              </h3>
              <div className="text-xs text-primary-blue-200">
                {paymentHistory.length} transaction
                {paymentHistory.length !== 1 ? 's' : ''}
              </div>
            </div>
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-primary-blue-400 scrollbar-track-transparent">
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

          {/* Invoice Preview */}
          {selectedPayment && (
            <div className="space-y-3">
              <Separator className="bg-primary-blue-400/50" />
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary-green-200" />
                  Invoice Preview
                </h3>
                <div className="text-xs text-primary-blue-200">
                  Ready to send
                </div>
              </div>
              <PDFViewer
                isLoading={isExporting}
                pdfUrl={pdfUrl}
                onDownload={handleDownloadPdf}
              />
            </div>
          )}
        </div>
      )}
    </KSheet>
  );
}
