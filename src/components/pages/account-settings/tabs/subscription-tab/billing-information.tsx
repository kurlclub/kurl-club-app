'use client';

import { useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import { Check, Loader2, Pencil, X } from 'lucide-react';

import { KInput } from '@/components/shared/form/k-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useGst } from '@/hooks/use-gst';
import { useInvoiceHistory } from '@/hooks/use-invoice-history';

/** Validates a 15-character Indian GSTIN format */
const isValidGSTIN = (value: string) =>
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value);

type BillingInformationProps = {
  nextBillingDate: string;
  billingCycleLabel: string;
};

const INVOICES_PER_PAGE = 6;

function BillingInformation({
  nextBillingDate,
  billingCycleLabel,
}: BillingInformationProps) {
  const { gstNumber, addGst, deleteGst, isAddingGst, isDeletingGst } = useGst();

  const [gstinInput, setGstinInput] = useState('');
  const [isEditingGstin, setIsEditingGstin] = useState(false);
  const [gstinError, setGstinError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Derive state from gstNumber instead of using effects
  const gstValue = gstNumber || '';
  const isGstAdded = !!gstNumber;

  const {
    invoices,
    viewInvoice,
    downloadInvoice,
    isViewingInvoiceFor,
    isDownloadingInvoiceFor,
    isLoading: isInvoicesLoading,
  } = useInvoiceHistory();

  const totalInvoices = invoices.length;
  const totalPages = Math.max(1, Math.ceil(totalInvoices / INVOICES_PER_PAGE));
  const currentPageStart = (currentPage - 1) * INVOICES_PER_PAGE;
  const currentPageEnd = currentPageStart + INVOICES_PER_PAGE;
  const paginatedInvoices = invoices.slice(currentPageStart, currentPageEnd);

  // Helper functions for formatting invoice data
  const formatInvoiceDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatInvoiceAmount = (amount: number, currency: string) => {
    return `${currency === 'INR' ? 'Rs.' : currency} ${amount.toLocaleString('en-IN')}`;
  };

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
    addGst(trimmed);
    setIsEditingGstin(false);
    setGstinError('');
    setGstinInput('');
  };

  const handleGstinEdit = () => {
    setGstinInput(gstValue);
    setGstinError('');
    setIsEditingGstin(true);
  };

  const handleGstinDelete = () => {
    deleteGst();
    setGstinInput('');
  };

  const showGstinForm = !isGstAdded || isEditingGstin;

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
                {isGstAdded && !isEditingGstin && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-secondary-blue-200 hover:text-white"
                      onClick={handleGstinEdit}
                    >
                      <Pencil />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-alert-red-400 hover:text-alert-red-300"
                      onClick={handleGstinDelete}
                      disabled={isDeletingGst}
                    >
                      {isDeletingGst ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Delete'
                      )}
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex gap-2 items-center">
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
                    <Button
                      onClick={handleGstinSave}
                      className="h-13"
                      disabled={isAddingGst}
                    >
                      {isAddingGst ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check />
                      )}
                    </Button>
                  )}
                  {isEditingGstin && (
                    <Button
                      variant="outlinePrimary"
                      className="h-13"
                      onClick={() => {
                        setIsEditingGstin(false);
                        setGstinError('');
                      }}
                    >
                      <X />
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
                  {totalInvoices} invoices
                </div>
              </div>

              <div className="space-y-3">
                {isInvoicesLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-secondary-blue-400 bg-secondary-blue-600 p-4"
                    >
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Skeleton className="h-9 w-24 rounded-md" />
                        <Skeleton className="h-9 w-28 rounded-md" />
                      </div>
                    </div>
                  ))
                ) : paginatedInvoices.length > 0 ? (
                  paginatedInvoices.map((invoice) => {
                    const viewing = isViewingInvoiceFor(invoice.id);
                    const downloading = isDownloadingInvoiceFor(invoice.id);

                    return (
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
                                {invoice.invoiceNumber}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-[0.18em] text-secondary-blue-200">
                                Plan
                              </p>
                              <p className="mt-1 text-sm font-semibold text-white">
                                {invoice.planName}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-[0.18em] text-secondary-blue-200">
                                Paid On
                              </p>
                              <p className="mt-1 text-sm font-semibold text-white">
                                {formatInvoiceDate(invoice.paidAtUtc)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-[0.18em] text-secondary-blue-200">
                                Amount
                              </p>
                              <div className="mt-1 flex items-center gap-2">
                                <p className="text-sm font-semibold text-white">
                                  {formatInvoiceAmount(
                                    invoice.amount,
                                    invoice.currency
                                  )}
                                </p>
                                <Badge
                                  variant="outline"
                                  className="border-secondary-green-500/40 bg-secondary-green-500/10 px-2 py-1 text-xs text-secondary-green-300"
                                >
                                  Paid
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 lg:pl-4">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={viewing}
                              onClick={() => viewInvoice(invoice.id)}
                            >
                              {viewing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : null}
                              View
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              disabled={downloading}
                              onClick={() => downloadInvoice(invoice.id)}
                            >
                              {downloading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : null}
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-xl border border-secondary-blue-400 bg-secondary-blue-600 p-6 text-center text-sm text-secondary-blue-200">
                    No invoice history available yet.
                  </div>
                )}

                {!isInvoicesLoading && paginatedInvoices.length > 0 && (
                  <div className="flex flex-col gap-3 border-t border-secondary-blue-400 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-secondary-blue-200">
                      Showing {currentPageStart + 1} to{' '}
                      {Math.min(currentPageEnd, totalInvoices)} of{' '}
                      {totalInvoices} invoices
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
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1)
                          )
                        }
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}

export default BillingInformation;
