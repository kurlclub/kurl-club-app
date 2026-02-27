import { useQuery } from '@tanstack/react-query';

import { type PricingData, getSubscriptionPlans } from '@/services/pricing';

export const useSubscriptionPlans = () => {
  return useQuery<PricingData>({
    queryKey: ['subscription-plans'],
    queryFn: getSubscriptionPlans,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
