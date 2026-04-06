'use client';

import { useEffect, useRef, useState } from 'react';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { InvoicePreviewDialog } from '@/components/pages/account-settings/tabs/subscription-tab/invoice-preview-dialog';
import { Pricing } from '@/components/pages/account-settings/tabs/subscription-tab/pricing';
import { SubscriptionCard } from '@/components/shared/cards/subscription-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSubscriptionAccess } from '@/hooks/use-subscription-access';
import { useSubscriptionPlans } from '@/hooks/use-subscription-plans';
import { safeFormatDate } from '@/lib/utils';
import { fetchSubscriptionInvoice } from '@/services/subscription';

export function SubscriptionTab() {
  const [isInvoicePreviewOpen, setIsInvoicePreviewOpen] = useState(false);
  const [isInvoiceLoading, setIsInvoiceLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [invoicePdfUrl, setInvoicePdfUrl] = useState<string | null>(null);
  const [invoiceFileName, setInvoiceFileName] = useState('invoice.pdf');
  const invoicePdfUrlRef = useRef<string | null>(null);
  const { data: pricingData, isLoading, error } = useSubscriptionPlans();
  const { subscription } = useSubscriptionAccess();
  const nextBillingDate = safeFormatDate(subscription?.endDate, 'en-GB', 'N/A');
  const billingCycleLabel =
    subscription?.billingCycle === 'sixMonths'
      ? '6 months billing'
      : subscription?.billingCycle === 'yearly'
        ? 'Yearly billing'
        : subscription?.billingCycle === 'monthly'
          ? 'Monthly billing'
          : 'N/A';

  const updateInvoicePdfUrl = (nextUrl: string | null) => {
    const previousUrl = invoicePdfUrlRef.current;

    if (previousUrl && previousUrl !== nextUrl) {
      URL.revokeObjectURL(previousUrl);
    }

    invoicePdfUrlRef.current = nextUrl;
    setInvoicePdfUrl(nextUrl);
  };

  useEffect(
    () => () => {
      if (invoicePdfUrlRef.current) {
        URL.revokeObjectURL(invoicePdfUrlRef.current);
      }
    },
    []
  );

  const handleScrollToPlans = () => {
    const element = document.getElementById('available-plans');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleViewInvoice = async () => {
    setIsInvoiceLoading(true);
    try {
      const { blob, filename } = await fetchSubscriptionInvoice(false);
      const url = URL.createObjectURL(blob);
      updateInvoicePdfUrl(url);
      setInvoiceFileName(filename);
      setIsInvoicePreviewOpen(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load invoice.';
      toast.error(message);
    } finally {
      setIsInvoiceLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    setIsDownloading(true);
    try {
      const { blob, filename } = await fetchSubscriptionInvoice(true);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setInvoiceFileName(filename);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to download invoice.';
      toast.error(message);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleInvoiceDialogClose = (open: boolean) => {
    if (!open) {
      updateInvoicePdfUrl(null);
    }
    setIsInvoicePreviewOpen(open);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section with Current Subscription */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SubscriptionCard onSubmit={handleScrollToPlans} />
      </motion.div>

      {/* Available Plans */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card
          id="available-plans"
          className="bg-secondary-blue-500 border-secondary-blue-400"
        >
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary-green-500" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-400">Failed to load pricing plans</p>
              </div>
            ) : (
              <Pricing
                title="Available Plans"
                description="Choose the plan that best fits your needs"
                pricingData={pricingData}
              />
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Billing Information */}
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
    </div>
  );
}
