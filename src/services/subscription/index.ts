import { api } from '@/lib/api';
import {
  InvoiceHistoryItem,
  InvoiceHistoryResponse,
} from '@/types/subscription';
import { SubscriptionCatalogPlan } from '@/types/subscription';

export * from './payment';

type SubscriptionCatalogResponse = {
  status: string;
  data: SubscriptionCatalogPlan[];
};

const resolveDownloadFilename = (
  contentDisposition: string | null,
  fallback: string
) => {
  if (!contentDisposition) {
    return fallback;
  }

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''(.+?)(?:;|$)/);
  const regularMatch = contentDisposition.match(/filename=([^;]+)/);

  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  if (regularMatch?.[1]) {
    return regularMatch[1].replace(/["']/g, '').trim();
  }

  return fallback;
};

export const getSubscriptionCatalogPlans = async () => {
  const response =
    await api.get<SubscriptionCatalogResponse>('/SubscriptionPlan');
  return response.data || [];
};

export const fetchSubscriptionInvoice = async (
  download: boolean
): Promise<{ blob: Blob; filename: string }> => {
  const { blob, contentDisposition } = await api.get<{
    blob: Blob;
    contentDisposition: string | null;
  }>('/SubscriptionPayment/invoice', {
    params: { download },
    responseType: 'blob',
  });

  return {
    blob,
    filename: resolveDownloadFilename(contentDisposition, 'invoice.pdf'),
  };
};

export const fetchInvoiceHistory = async (): Promise<InvoiceHistoryItem[]> => {
  const response = await api.get<InvoiceHistoryResponse>(
    '/SubscriptionPayment/invoice-history'
  );

  if (response.status !== 'Success' || !response.data) {
    throw new Error('Failed to fetch invoice history');
  }

  return response.data;
};

export const fetchInvoiceById = async (
  invoiceId: number,
  download: boolean = false
): Promise<{ blob: Blob; filename: string }> => {
  const { blob, contentDisposition } = await api.get<{
    blob: Blob;
    contentDisposition: string | null;
  }>(`/SubscriptionPayment/download-invoice-history/${invoiceId}`, {
    params: { download },
    responseType: 'blob',
  });

  return {
    blob,
    filename: resolveDownloadFilename(
      contentDisposition,
      `invoice-${invoiceId}.pdf`
    ),
  };
};
