'use client';

import { motion } from 'framer-motion';
import { CreditCard, Loader2 } from 'lucide-react';

import { Pricing } from '@/components/pages/account-settings/tabs/subscription-tab/pricing';
import { SubscriptionCard } from '@/components/shared/cards/subscription-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSubscriptionPlans } from '@/hooks/use-subscription-plans';

export function SubscriptionTab() {
  const { data: pricingData, isLoading, error } = useSubscriptionPlans();

  return (
    <div className="space-y-8">
      {/* Hero Section with Current Subscription */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SubscriptionCard variant="premium" />
      </motion.div>

      {/* Available Plans */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-secondary-blue-500 border-secondary-blue-400">
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary-green-500" />
              </div>
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="bg-secondary-blue-500 border-secondary-blue-400">
          <CardContent className="space-y-6">
            <div className="p-4 bg-linear-to-r from-secondary-blue-600 to-secondary-blue-700 rounded-xl border border-secondary-blue-400">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-secondary-blue-500 rounded-lg shadow-sm">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      •••• •••• •••• 4242
                    </p>
                    <p className="text-sm text-secondary-blue-200">
                      Expires 12/2025 • Visa
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="font-medium">
                  Update Card
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-secondary-blue-600 rounded-lg">
                <p className="font-medium text-white mb-1">Next billing date</p>
                <p className="text-sm text-secondary-blue-200">
                  January 15, 2026
                </p>
              </div>
              <div className="p-4 bg-secondary-blue-600 rounded-lg">
                <p className="font-medium text-white mb-1">Billing cycle</p>
                <p className="text-sm text-secondary-blue-200">
                  Monthly billing
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-secondary-blue-400">
              <div>
                <p className="font-medium text-white">Billing History</p>
                <p className="text-sm text-secondary-blue-200">
                  View and download your invoices
                </p>
              </div>
              <Button variant="outline" size="sm">
                View Invoices
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
