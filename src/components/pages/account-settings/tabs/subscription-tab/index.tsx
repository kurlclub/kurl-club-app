'use client';

import { motion } from 'framer-motion';

import { SubscriptionPlansSkeleton } from '@/components/pages/account-settings/account-settings-skeletons';
import { Pricing } from '@/components/pages/account-settings/tabs/subscription-tab/pricing';
import { SubscriptionCard } from '@/components/shared/cards/subscription-card';
import { Card, CardContent } from '@/components/ui/card';
import { useSubscriptionAccess } from '@/hooks/use-subscription-access';
import { useSubscriptionPlans } from '@/hooks/use-subscription-plans';
import { safeFormatDate } from '@/lib/utils';

import BillingInformation from './billing-information';

export function SubscriptionTab() {
  const { data: pricingData, isLoading, error } = useSubscriptionPlans();
  const { subscription } = useSubscriptionAccess();
  const nextBillingDate = safeFormatDate(
    subscription?.nextBillingDate,
    'en-GB',
    'N/A'
  );
  const billingCycleLabel =
    subscription?.billingCycle === 'sixMonths'
      ? '6 months billing'
      : subscription?.billingCycle === 'yearly'
        ? 'Yearly billing'
        : subscription?.billingCycle === 'monthly'
          ? 'Monthly billing'
          : 'N/A';

  const handleScrollToPlans = () => {
    const element = document.getElementById('available-plans');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section with Current Subscription */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SubscriptionCard onSubmit={handleScrollToPlans} />
      </motion.div>

      {/* Available Plans */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card
          id="available-plans"
          className="bg-secondary-blue-500 border-secondary-blue-400"
        >
          <CardContent>
            {isLoading ? (
              <SubscriptionPlansSkeleton />
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-400">Failed to load pricing plans</p>
              </div>
            ) : (
              <Pricing
                title="Available Plans"
                description="Choose the plan that best fits your needs"
                pricingData={pricingData}
              />
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Billing Information */}
      <BillingInformation
        nextBillingDate={nextBillingDate}
        billingCycleLabel={billingCycleLabel}
      />
    </div>
  );
}
