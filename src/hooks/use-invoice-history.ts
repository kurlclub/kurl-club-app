import { useState } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';

import { fetchInvoiceById, fetchInvoiceHistory } from '@/services/subscription';

export const useInvoiceHistory = () => {
  const {
    data: invoices = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['invoice-history'],
    queryFn: fetchInvoiceHistory,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const [viewingInvoiceId, setViewingInvoiceId] = useState<number | null>(null);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<
    number | null
  >(null);

  const viewInvoiceMutation = useMutation({
    mutationFn: ({ invoiceId }: { invoiceId: number }) =>
      fetchInvoiceById(invoiceId, false),
    onMutate: ({ invoiceId }) => {
      setViewingInvoiceId(invoiceId);
    },
    onSettled: () => {
      setViewingInvoiceId(null);
    },
    onSuccess: (data) => {
      const blobUrl = URL.createObjectURL(data.blob);
      window.open(blobUrl, '_blank');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    },
  });

  const downloadInvoiceMutation = useMutation({
    mutationFn: ({ invoiceId }: { invoiceId: number }) =>
      fetchInvoiceById(invoiceId, true),
    onMutate: ({ invoiceId }) => {
      setDownloadingInvoiceId(invoiceId);
    },
    onSettled: () => {
      setDownloadingInvoiceId(null);
    },
    onSuccess: (data) => {
      const url = URL.createObjectURL(data.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    },
  });

  return {
    invoices,
    isLoading,
    error,
    refetch,
    viewInvoice: (invoiceId: number) =>
      viewInvoiceMutation.mutate({ invoiceId }),
    downloadInvoice: (invoiceId: number) =>
      downloadInvoiceMutation.mutate({ invoiceId }),
    viewingInvoiceId,
    downloadingInvoiceId,
    isViewingInvoiceFor: (invoiceId: number) => viewingInvoiceId === invoiceId,
    isDownloadingInvoiceFor: (invoiceId: number) =>
      downloadingInvoiceId === invoiceId,
    viewInvoiceError: viewInvoiceMutation.error,
    downloadInvoiceError: downloadInvoiceMutation.error,
  };
};
