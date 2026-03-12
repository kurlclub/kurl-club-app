import { SUBSCRIPTION_FEATURE_LABELS } from '@/lib/subscription/feature-labels';
import { getSubscriptionCatalogPlans } from '@/services/subscription';
import { SubscriptionCatalogPlan } from '@/types/subscription';

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
  const featureEntries = Object.entries(plan.features || {});
  const enabledFeatures = featureEntries
    .filter(([, value]) =>
      typeof value === 'number' ? value > 0 : value === true
    )
    .map(
      ([key]) =>
        SUBSCRIPTION_FEATURE_LABELS[
          key as keyof typeof SUBSCRIPTION_FEATURE_LABELS
        ]
    )
    .filter(Boolean);

  const limits = plan.limits
    ? [
        `Clubs up to ${plan.limits.maxClubs}`,
        `Members up to ${plan.limits.maxMembers}`,
        `Trainers up to ${plan.limits.maxTrainers}`,
        `Staff up to ${plan.limits.maxStaffs}`,
      ]
    : [];

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
    popular: Boolean(plan.isPopular),
    badge: plan.badge || '',
    description: plan.description || '',
    targetAudience: [],
    limitations: limits,
    isActive: plan.status !== 'expired',
  };
};
