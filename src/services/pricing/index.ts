import { api } from '@/lib/api';

export interface PricingPlan {
  id: string;
  name: string;
  subtitle: string;
  pricing: {
    monthly: number;
    sixMonths: number;
    yearly: number;
  };
  features: string[];
  popular: boolean;
  badge: string;
  description: string;
  targetAudience: string[];
  limitations: string[];
  isActive: boolean;
}

export interface TrialOffer {
  enabled: boolean;
  durationMonths: number;
  description: string;
}

export interface PricingData {
  offer: TrialOffer;
  plans: PricingPlan[];
}

export interface PricingResponse {
  status: string;
  data: PricingData;
}

export const getSubscriptionPlans = async (): Promise<PricingData> => {
  const response = await api.get<PricingResponse>('/SubscriptionPlan');
  return response.data;
};
