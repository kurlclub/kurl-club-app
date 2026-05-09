'use client';

import { useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import NumberFlow from '@number-flow/react';
import { Loader2, ReceiptText } from 'lucide-react';
import { z } from 'zod';

import {
  KFormField,
  KFormFieldType,
} from '@/components/shared/form/k-formfield';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useGst } from '@/hooks/use-gst';
import { cn } from '@/lib/utils';
import type { PricingPlan } from '@/services/pricing';

type BillingCycle = 'monthly' | '6months' | 'yearly';

const GST_RATE = 0.18;
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const requiredText = (label: string) =>
  z.string().trim().min(1, `${label} is required.`);

export const checkoutBillingSchema = z.object({
  gstNumber: z
    .string()
    .trim()
    .transform((value) => value.toUpperCase())
    .refine((value) => value === '' || GSTIN_REGEX.test(value), {
      message: 'Enter a valid 15-character GSTIN.',
    }),
  billingFullName: requiredText('Full name'),
  billingAddressLine: requiredText('Address line'),
  billingCity: requiredText('City'),
  billingState: requiredText('State'),
  billingPincode: requiredText('Pincode'),
  billingCountry: requiredText('Country'),
});

export type CheckoutBillingFormValues = z.infer<typeof checkoutBillingSchema>;

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPlan: PricingPlan | null;
  billingCycle: BillingCycle;
  onConfirm: (
    plan: PricingPlan,
    billingCycle: BillingCycle,
    billingDetails: CheckoutBillingFormValues
  ) => Promise<void>;
  isPaying?: boolean;
}

const getBilledAmount = (plan: PricingPlan, cycle: BillingCycle): number => {
  switch (cycle) {
    case 'monthly':
      return plan.pricing.monthly;
    case '6months':
      return plan.pricing.sixMonths;
    case 'yearly':
      return plan.pricing.yearly;
  }
};

const getBillingPeriodLabel = (cycle: BillingCycle) => {
  switch (cycle) {
    case 'monthly':
      return 'Monthly';
    case '6months':
      return '6 months';
    case 'yearly':
      return 'Yearly';
  }
};

const formatCurrency = (amount: number) =>
  `Rs. ${amount.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  })}`;

export function CheckoutDialog({
  open,
  onOpenChange,
  selectedPlan,
  billingCycle,
  onConfirm,
  isPaying = false,
}: CheckoutDialogProps) {
  const { gstNumber } = useGst();
  const billingFormValues = useMemo<CheckoutBillingFormValues>(
    () => ({
      gstNumber: gstNumber?.toUpperCase() ?? '',
      billingFullName: '',
      billingAddressLine: '',
      billingCity: '',
      billingState: '',
      billingPincode: '',
      billingCountry: 'India',
    }),
    [gstNumber]
  );

  const form = useForm<CheckoutBillingFormValues>({
    resolver: zodResolver(checkoutBillingSchema),
    values: billingFormValues,
    resetOptions: {
      keepDirtyValues: true,
    },
  });

  if (!selectedPlan) return null;

  const actualPrice = getBilledAmount(selectedPlan, billingCycle);
  const gstCharge = actualPrice * GST_RATE;
  const totalPrice = actualPrice + gstCharge;
  const isFreePlan = actualPrice === 0;

  const handleSubmit = form.handleSubmit(async (values) => {
    if (isFreePlan) return;
    await onConfirm(selectedPlan, billingCycle, values);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl border-secondary-blue-400 bg-secondary-blue-500 text-white">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl">Checkout</DialogTitle>
          <DialogDescription className="text-secondary-blue-200">
            {selectedPlan.name} subscription
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <section className="rounded-lg border border-secondary-blue-400/70 bg-secondary-blue-700/50 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-green-500/15 text-primary-green-300">
                    <ReceiptText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Payment Summary
                    </p>
                    <p className="text-xs text-secondary-blue-200">
                      {getBillingPeriodLabel(billingCycle)} billing
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-secondary-blue-200">Total price</span>
                    <span className="font-medium text-white">
                      {formatCurrency(actualPrice)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-secondary-blue-200">
                      Actual price
                    </span>
                    <span className="font-medium text-white">
                      {formatCurrency(actualPrice)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-secondary-blue-200">
                      Billing period
                    </span>
                    <span className="font-medium text-white">
                      {getBillingPeriodLabel(billingCycle)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-secondary-blue-200">
                      GST charge (18%)
                    </span>
                    <span className="font-medium text-white">
                      {formatCurrency(gstCharge)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-primary-green-500/30 bg-primary-green-500/10 p-4">
                  <p className="text-xs uppercase tracking-widest text-primary-green-200">
                    Total incl. GST
                  </p>
                  <div className="mt-2 flex items-start gap-1">
                    <span className="pt-1 text-sm text-primary-green-200">
                      Rs.
                    </span>
                    <NumberFlow
                      value={totalPrice}
                      className="text-3xl font-bold leading-none text-primary-green-200"
                      transformTiming={{ duration: 300, easing: 'ease-out' }}
                      willChange
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-secondary-blue-400/70 bg-secondary-blue-700/50 p-4">
                <div className="mb-4">
                  <p className="text-sm font-semibold text-white">
                    Billing Details
                  </p>
                  <p className="text-xs text-secondary-blue-200">
                    GSTIN is optional. Other billing fields are mandatory.
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <KFormField
                    control={form.control}
                    fieldType={KFormFieldType.INPUT}
                    name="billingFullName"
                    label="Full Name"
                    mandetory
                    disabled={isPaying}
                  />
                  <KFormField
                    control={form.control}
                    fieldType={KFormFieldType.INPUT}
                    name="billingCity"
                    label="City"
                    mandetory
                    disabled={isPaying}
                  />
                  <KFormField
                    control={form.control}
                    fieldType={KFormFieldType.INPUT}
                    name="gstNumber"
                    label="GSTIN"
                    maxLength={15}
                    disabled={isPaying}
                    className="uppercase"
                  />
                  <KFormField
                    control={form.control}
                    fieldType={KFormFieldType.INPUT}
                    name="billingState"
                    label="State"
                    mandetory
                    disabled={isPaying}
                  />
                  <KFormField
                    control={form.control}
                    fieldType={KFormFieldType.INPUT}
                    name="billingAddressLine"
                    label="Address Line"
                    mandetory
                    disabled={isPaying}
                  />
                  <KFormField
                    control={form.control}
                    fieldType={KFormFieldType.INPUT}
                    name="billingPincode"
                    label="Pincode"
                    mandetory
                    disabled={isPaying}
                  />
                  <KFormField
                    control={form.control}
                    fieldType={KFormFieldType.INPUT}
                    name="billingCountry"
                    label="Country"
                    mandetory
                    disabled={isPaying}
                  />
                </div>
              </section>
            </div>

            <DialogFooter className="gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="border-secondary-blue-300/40 bg-transparent hover:bg-secondary-blue-600"
                onClick={() => onOpenChange(false)}
                disabled={isPaying}
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isFreePlan || isPaying}
                className={cn(
                  isFreePlan || isPaying
                    ? 'cursor-not-allowed bg-secondary-blue-400 text-secondary-blue-200 hover:bg-secondary-blue-400'
                    : 'bg-primary-green-400 text-primary-blue-800 hover:bg-primary-green-300'
                )}
              >
                {isPaying ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </span>
                ) : (
                  'Pay Now'
                )}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
