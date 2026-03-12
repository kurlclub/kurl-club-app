import { api } from '@/lib/api';
import { SubscriptionCatalogPlan } from '@/types/subscription';

type SubscriptionCatalogResponse = {
  status: string;
  data: SubscriptionCatalogPlan[];
};

export const getSubscriptionCatalogPlans = async () => {
  const response =
    await api.get<SubscriptionCatalogResponse>('/SubscriptionPlan');
  return response.data || [];
};
