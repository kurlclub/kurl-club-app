'use client';

import { useState } from 'react';

import { motion } from 'framer-motion';
import { Check, Loader2, Pencil } from 'lucide-react';

import { KInput } from '@/components/shared/form/k-input';
import { Badge } from '@/components/ui/badge';
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

const invoiceHistory = [
  {
    id: 'INV-2026-008',
    billingPeriod: 'Aug 2026',
    issuedOn: '28 Aug 2026',
    amount: 'Rs. 5,499',
    status: 'Paid',
  },
  {
    id: 'INV-2026-007',
    billingPeriod: 'Jul 2026',
    issuedOn: '28 Jul 2026',
    amount: 'Rs. 5,499',
    status: 'Paid',
  },
  {
    id: 'INV-2026-006',
    billingPeriod: 'Jun 2026',
    issuedOn: '28 Jun 2026',
    amount: 'Rs. 5,499',
    status: 'Paid',
  },
  {
    id: 'INV-2026-005',
    billingPeriod: 'May 2026',
    issuedOn: '28 May 2026',
    amount: 'Rs. 4,999',
    status: 'Paid',
  },
  {
    id: 'INV-2026-004',
    billingPeriod: 'Apr 2026',
    issuedOn: '28 Apr 2026',
    amount: 'Rs. 4,999',
    status: 'Paid',
  },
  {
    id: 'INV-2026-003',
    billingPeriod: 'Mar 2026',
    issuedOn: '28 Mar 2026',
    amount: 'Rs. 4,999',
    status: 'Paid',
  },
  {
    id: 'INV-2026-002',
    billingPeriod: 'Feb 2026',
    issuedOn: '28 Feb 2026',
    amount: 'Rs. 4,999',
    status: 'Paid',
  },
  {
    id: 'INV-2026-001',
    billingPeriod: 'Jan 2026',
    issuedOn: '28 Jan 2026',
    amount: 'Rs. 4,999',
    status: 'Paid',
  },
] as const;

const INVOICES_PER_PAGE = 6;

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
  const [currentPage, setCurrentPage] = useState(1);

  const totalInvoices = invoiceHistory.length;
  const totalPages = Math.max(1, Math.ceil(totalInvoices / INVOICES_PER_PAGE));
  const currentPageStart = (currentPage - 1) * INVOICES_PER_PAGE;
  const currentPageEnd = currentPageStart + INVOICES_PER_PAGE;
  const paginatedInvoices = invoiceHistory.slice(
    currentPageStart,
    currentPageEnd
  );

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

            <div className="space-y-4 pt-4 border-t border-secondary-blue-400">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-white">Invoice History</p>
                  <p className="text-sm text-secondary-blue-200">
                    Full billing history with invoice preview and download
                    access
                  </p>
                </div>
                <div className="rounded-full border border-secondary-blue-400 bg-secondary-blue-600 px-3 py-1 text-xs font-medium text-secondary-blue-200">
                  {invoiceHistory.length} invoices
                </div>
              </div>

              <div className="space-y-3">
                {paginatedInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="rounded-xl border border-secondary-blue-400 bg-secondary-blue-600 p-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-secondary-blue-200">
                            Invoice ID
                          </p>
                          <p className="mt-1 text-sm font-semibold text-white">
                            {invoice.id}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-secondary-blue-200">
                            Billing Period
                          </p>
                          <p className="mt-1 text-sm font-semibold text-white">
                            {invoice.billingPeriod}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-secondary-blue-200">
                            Issued On
                          </p>
                          <p className="mt-1 text-sm font-semibold text-white">
                            {invoice.issuedOn}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-secondary-blue-200">
                            Amount
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <p className="text-sm font-semibold text-white">
                              {invoice.amount}
                            </p>
                            <Badge
                              variant="outline"
                              className="border-secondary-green-500/40 bg-secondary-green-500/10 px-2 py-1 text-xs text-secondary-green-300"
                            >
                              {invoice.status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 lg:pl-4">
                        <Button
                          variant="default"
                          size="sm"
                          disabled={isInvoiceLoading}
                          onClick={handleViewInvoice}
                        >
                          {isInvoiceLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : null}
                          {isInvoiceLoading ? 'Loading…' : 'View Invoice'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex flex-col gap-3 border-t border-secondary-blue-400 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-secondary-blue-200">
                    Showing {currentPageStart + 1} to{' '}
                    {Math.min(currentPageEnd, totalInvoices)} of {totalInvoices}{' '}
                    invoices
                  </p>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-secondary-blue-300 text-secondary-blue-200 hover:bg-secondary-blue-500"
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                    >
                      Previous
                    </Button>

                    {Array.from({ length: totalPages }, (_, index) => {
                      const page = index + 1;
                      const isActive = page === currentPage;

                      return (
                        <Button
                          key={page}
                          size="sm"
                          variant={isActive ? 'default' : 'outline'}
                          className={
                            isActive
                              ? ''
                              : 'border-secondary-blue-300 text-secondary-blue-200 hover:bg-secondary-blue-500'
                          }
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}

                    <Button
                      size="sm"
                      variant="outline"
                      className="border-secondary-blue-300 text-secondary-blue-200 hover:bg-secondary-blue-500"
                      disabled={currentPage === totalPages}
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
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
