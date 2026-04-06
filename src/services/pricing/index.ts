import {
  getCatalogPlanFeatureLabels,
  getSubscriptionLimitLabels,
} from '@/lib/subscription/catalog-formatting';
import { getSubscriptionCatalogPlans } from '@/services/subscription';
import type {
  SubscriptionCatalogFeatures,
  SubscriptionCatalogPlan,
  SubscriptionLimits,
} from '@/types/subscription';

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
  featureFlags?: SubscriptionCatalogFeatures;
  limits?: SubscriptionLimits;
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
  const plans = await getSubscriptionCatalogPlans();
  const normalizedPlans = plans.map((plan) => normalizeCatalogPlan(plan));

  return {
    offer: {
      enabled: false,
      durationMonths: 0,
      description: '',
    },
    plans: normalizedPlans,
  };
};

const normalizeCatalogPlan = (plan: SubscriptionCatalogPlan): PricingPlan => {
  const enabledFeatures = getCatalogPlanFeatureLabels(plan.features);
  const limits = getSubscriptionLimitLabels(plan.limits);

  return {
    id: String(plan.id),
    name: plan.name,
    subtitle: plan.subtitle || '',
    pricing: {
      monthly: plan.monthlyPrice ?? 0,
      sixMonths: plan.sixMonthsPrice ?? 0,
      yearly: plan.yearlyPrice ?? 0,
    },
    features: enabledFeatures,
    featureFlags: plan.features,
    limits: plan.limits,
    popular: Boolean(plan.isPopular),
    badge: plan.badge || '',
    description: plan.description || '',
    targetAudience: [],
    limitations: limits,
    isActive: plan.status !== 'expired',
  };
};
