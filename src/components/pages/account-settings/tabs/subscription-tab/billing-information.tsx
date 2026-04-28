'use client';

import { useState } from 'react';

import { motion } from 'framer-motion';
import { Check, Loader2, Pencil } from 'lucide-react';

import { KInput } from '@/components/shared/form/k-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { InvoicePreviewDialog } from './invoice-preview-dialog';

/** Validates a 15-character Indian GSTIN format */
const isValidGSTIN = (value: string) =>
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value);

type BillingInformationProps = {
  nextBillingDate: string;
  billingCycleLabel: string;
  isInvoiceLoading: boolean;
  isInvoicePreviewOpen: boolean;
  invoicePdfUrl: string | null;
  invoiceFileName: string;
  isDownloading: boolean;
  handleViewInvoice: () => Promise<void>;
  handleInvoiceDialogClose: (open: boolean) => void;
  handleDownloadInvoice: () => Promise<void>;
};

function BillingInformation({
  nextBillingDate,
  billingCycleLabel,
  isInvoiceLoading,
  isInvoicePreviewOpen,
  invoicePdfUrl,
  invoiceFileName,
  isDownloading,
  handleViewInvoice,
  handleInvoiceDialogClose,
  handleDownloadInvoice,
}: BillingInformationProps) {
  const [gstinInput, setGstinInput] = useState('');
  const [savedGstin, setSavedGstin] = useState<string | null>(null);
  const [isEditingGstin, setIsEditingGstin] = useState(false);
  const [gstinError, setGstinError] = useState('');

  const handleGstinSave = () => {
    const trimmed = gstinInput.trim().toUpperCase();
    if (!trimmed) {
      setGstinError('GSTIN is required.');
      return;
    }
    if (!isValidGSTIN(trimmed)) {
      setGstinError('Enter a valid 15-character GSTIN (e.g. 22AAAAA0000A1Z5).');
      return;
    }
    setSavedGstin(trimmed);
    setIsEditingGstin(false);
    setGstinError('');
  };

  const handleGstinEdit = () => {
    setGstinInput(savedGstin ?? '');
    setGstinError('');
    setIsEditingGstin(true);
  };

  const showGstinForm = !savedGstin || isEditingGstin;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="bg-secondary-blue-500 border-secondary-blue-400">
          <CardContent className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-4 bg-secondary-blue-600 rounded-lg">
                <p className="font-medium text-white mb-1">Next billing date</p>
                <p className="text-sm text-secondary-blue-200">
                  {nextBillingDate}
                </p>
              </div>
              <div className="p-4 bg-secondary-blue-600 rounded-lg">
                <p className="font-medium text-white mb-1">Billing cycle</p>
                <p className="text-sm text-secondary-blue-200">
                  {billingCycleLabel}
                </p>
              </div>
            </div>

            {/* GST Details */}
            <div className="pt-4 border-t border-secondary-blue-400 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">GST Details</p>
                  <p className="text-sm text-secondary-blue-200">
                    Add your GSTIN to include it on invoices
                  </p>
                </div>
                {savedGstin && !isEditingGstin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-secondary-blue-200 hover:text-white"
                    onClick={handleGstinEdit}
                  >
                    <Pencil />
                    Edit
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <KInput
                    disabled={!showGstinForm}
                    label="GSTIN"
                    id="gstin"
                    value={gstinInput}
                    onChange={(e) => {
                      setGstinInput(e.target.value.toUpperCase());
                      if (gstinError) setGstinError('');
                    }}
                    maxLength={15}
                    wrapperClass="w-full"
                    className="gst-input"
                  />
                  {showGstinForm && (
                    <Button onClick={handleGstinSave} className="shrink-0 h-13">
                      <Check />
                      Save
                    </Button>
                  )}
                  {isEditingGstin && (
                    <Button
                      variant="ghost"
                      className="shrink-0 h-13 text-secondary-blue-200 hover:text-white"
                      onClick={() => {
                        setIsEditingGstin(false);
                        setGstinError('');
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
                {gstinError && (
                  <p className="text-xs text-red-400">{gstinError}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-secondary-blue-400">
              <div>
                <p className="font-medium text-white">Billing History</p>
                <p className="text-sm text-secondary-blue-200">
                  View and download your invoices
                </p>
              </div>
              <Button
                variant="default"
                size="sm"
                disabled={isInvoiceLoading}
                onClick={handleViewInvoice}
              >
                {isInvoiceLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {isInvoiceLoading ? 'Loading…' : 'View Invoices'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      <InvoicePreviewDialog
        open={isInvoicePreviewOpen}
        onOpenChange={handleInvoiceDialogClose}
        pdfUrl={invoicePdfUrl}
        downloadFileName={invoiceFileName}
        isLoading={isInvoiceLoading}
        isDownloading={isDownloading}
        onDownload={handleDownloadInvoice}
      />
    </>
  );
}

export default BillingInformation;
