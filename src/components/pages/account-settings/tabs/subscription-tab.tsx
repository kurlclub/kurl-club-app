'use client';

import { Check, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/providers/auth-provider';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$29',
    period: '/month',
    features: [
      '1 Gym Location',
      'Up to 100 Members',
      'Basic Analytics',
      'Email Support',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$79',
    period: '/month',
    features: [
      '3 Gym Locations',
      'Up to 500 Members',
      'Advanced Analytics',
      'Priority Support',
      'Custom Branding',
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$199',
    period: '/month',
    features: [
      'Unlimited Gyms',
      'Unlimited Members',
      'Full Analytics Suite',
      '24/7 Support',
      'API Access',
      'Dedicated Manager',
    ],
  },
];

export function SubscriptionTab() {
  const { user } = useAuth();
  const currentPlan = user?.isMultiClub ? 'enterprise' : 'starter';

  const handleUpgrade = (planId: string) => {
    // TODO: Implement upgrade logic
    toast.success(`Upgrade to ${planId} plan initiated!`);
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="bg-white dark:bg-secondary-blue-500 border-gray-200 dark:border-secondary-blue-400 py-2">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">
            Current Plan
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-secondary-blue-200 text-[15px]">
            You are currently on the{' '}
            {user?.isMultiClub ? 'Enterprise' : 'Starter'} plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-secondary-blue-600 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {user?.isMultiClub ? 'Enterprise Plan' : 'Starter Plan'}
              </p>
              <p className="text-sm text-gray-600 dark:text-secondary-blue-200 mt-1">
                {user?.isMultiClub
                  ? 'Multi-gym access with unlimited features'
                  : 'Single gym with basic features'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {user?.isMultiClub ? '$199' : '$29'}
              </p>
              <p className="text-sm text-gray-600 dark:text-secondary-blue-200">
                /month
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card className="bg-white dark:bg-secondary-blue-500 border-gray-200 dark:border-secondary-blue-400 py-2">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">
            Available Plans
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-secondary-blue-200 text-[15px]">
            Choose the plan that best fits your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative p-6 rounded-lg border-2 ${
                  plan.id === currentPlan
                    ? 'border-primary-green-500 bg-primary-green-500/5'
                    : 'border-gray-200 dark:border-secondary-blue-400'
                } ${plan.popular ? 'ring-2 ring-primary-green-500' : ''}`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary-green-500 text-secondary-blue-500 text-xs font-medium rounded-full">
                    Popular
                  </span>
                )}
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 dark:text-secondary-blue-200">
                      {plan.period}
                    </span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600 dark:text-secondary-blue-200">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.id === currentPlan ? 'secondary' : 'default'}
                  disabled={plan.id === currentPlan}
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {plan.id === currentPlan ? 'Current Plan' : 'Upgrade'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing Information */}
      <Card className="bg-white dark:bg-secondary-blue-500 border-gray-200 dark:border-secondary-blue-400 py-2">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">
            Billing Information
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-secondary-blue-200 text-[15px]">
            Manage your payment methods and billing history
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-secondary-blue-600 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-secondary-blue-500 rounded">
                <CreditCard className="h-5 w-5 text-gray-900 dark:text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  •••• •••• •••• 4242
                </p>
                <p className="text-sm text-gray-600 dark:text-secondary-blue-200">
                  Expires 12/2025
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Update
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Next billing date
              </p>
              <p className="text-sm text-gray-600 dark:text-secondary-blue-200">
                January 1, 2026
              </p>
            </div>
            <Button variant="outline" size="sm">
              View Invoices
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
