import { getCatalogPlanFeatureLabels } from '@/lib/subscription/access-policy';
import { getSubscriptionCatalogPlans } from '@/services/subscription';
import { SubscriptionCatalogPlan } from '@/types/subscription';
import type { SubscriptionCatalogFeatures } from '@/types/subscription';

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
  const limitsMap: Array<[number | null | undefined, string]> = [
    [plan.limits?.maxClubs, 'Clubs up to'],
    [plan.limits?.maxMembers, 'Members up to'],
    [plan.limits?.maxTrainers, 'Trainers up to'],
    [plan.limits?.maxStaffs, 'Staff up to'],
    [plan.limits?.maxMembershipPlans, 'Membership plans up to'],
    [plan.limits?.maxWorkoutPlans, 'Workout plans up to'],
    [plan.limits?.maxLeadsPerMonth, 'Leads per month up to'],
  ];

  const limits = limitsMap
    .filter(([value]) => typeof value === 'number' && Number.isFinite(value))
    .map(([value, label]) => `${label} ${value}`);

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
    popular: Boolean(plan.isPopular),
    badge: plan.badge || '',
    description: plan.description || '',
    targetAudience: [],
    limitations: limits,
    isActive: plan.status !== 'expired',
  };
};
