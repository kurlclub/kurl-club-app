import { api } from '@/lib/api';
import { SubscriptionCatalogPlan } from '@/types/subscription';

export * from './payment';

type SubscriptionCatalogResponse = {
  status: string;
  data: SubscriptionCatalogPlan[];
};

export const getSubscriptionCatalogPlans = async () => {
  const response =
    await api.get<SubscriptionCatalogResponse>('/SubscriptionPlan');
  return response.data || [];
};

export const fetchSubscriptionInvoice = async (
  download: boolean
): Promise<Blob> => {
  const response = await api.get<{
    blob: Blob;
    contentDisposition: string | null;
  }>('/SubscriptionPayment/invoice', {
    params: { download },
    responseType: 'blob',
  });
  return response.blob;
};
