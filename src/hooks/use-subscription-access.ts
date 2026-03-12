import { useSubscription } from '@/providers/subscription-provider';

export const useSubscriptionAccess = () => {
  return useSubscription();
};
