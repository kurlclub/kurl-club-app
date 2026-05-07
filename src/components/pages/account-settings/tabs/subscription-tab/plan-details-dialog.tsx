import { useState } from 'react';

import NumberFlow from '@number-flow/react';
import { Check, Info, Loader2, Trash2, X } from 'lucide-react';

import { KInput } from '@/components/shared/form/k-input';
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
import {
  getSubscriptionCatalogFeatureItems,
  getSubscriptionLimitLabels,
} from '@/lib/subscription/catalog-formatting';
import { cn } from '@/lib/utils';
import type { PricingPlan } from '@/services/pricing';

/** Validates a 15-character Indian GSTIN format */
const isValidGSTIN = (value: string) =>
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value);

type BillingCycle = 'monthly' | '6months' | 'yearly';
type PlanChangeType = 'same' | 'different';

interface PlanDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPlan: PricingPlan | null;
  billingCycle: BillingCycle;
  planChangeType?: PlanChangeType | null;
  onPayNow?: (plan: PricingPlan, billingCycle: BillingCycle) => Promise<void>;
  isPaying?: boolean;
}

const getPrice = (plan: PricingPlan, cycle: BillingCycle): number => {
  switch (cycle) {
    case 'monthly':
      return plan.pricing.monthly;
    case '6months':
      return plan.pricing.sixMonths;
    case 'yearly':
      return plan.pricing.yearly;
  }
};

const getPriceSuffix = (cycle: BillingCycle) => {
  switch (cycle) {
    case 'monthly':
      return '/mo';
    case '6months':
      return '/6 mo';
    case 'yearly':
      return '/yr';
  }
};

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

const getBilledLabel = (cycle: BillingCycle) => {
  switch (cycle) {
    case 'monthly':
      return 'Billed monthly';
    case '6months':
      return 'Billed every 6 months';
    case 'yearly':
      return 'Billed yearly';
  }
};

const getPlainText = (value?: string) => {
  if (!value) return '';
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const buildLimitations = (plan: PricingPlan): string[] => {
  const existing = Array.isArray(plan.limitations)
    ? plan.limitations.filter(Boolean)
    : [];
  const fromLimits = getSubscriptionLimitLabels(plan.limits);

  return Array.from(new Set([...existing, ...fromLimits]));
};

const buildFeatures = (plan: PricingPlan) =>
  getSubscriptionCatalogFeatureItems(plan.featureFlags ?? plan.features);

export function PlanDetailsDialog({
  open,
  onOpenChange,
  selectedPlan,
  billingCycle,
  planChangeType = null,
  onPayNow,
  isPaying = false,
}: PlanDetailsDialogProps) {
  const { gstNumber, addGst, deleteGst, isAddingGst, isDeletingGst } = useGst();

  const [gstValue, setGstValue] = useState<string>('');
  const [isEditingGst, setIsEditingGst] = useState<boolean>(false);
  const [gstError, setGstError] = useState<string>('');

  // Derive state from gstNumber instead of using effects
  const savedGstValue = gstNumber || '';
  const isGstAdded = !!gstNumber;

  if (!selectedPlan) return null;

  const currentPrice = getPrice(selectedPlan, billingCycle);
  const billedAmount = getBilledAmount(selectedPlan, billingCycle);
  const priceSuffix = getPriceSuffix(billingCycle);
  const isFreePlan = currentPrice === 0;
  const description = getPlainText(selectedPlan.description);
  const limitations = buildLimitations(selectedPlan);
  const features = buildFeatures(selectedPlan);
  const hasUnavailableFeatures = features.some((feature) => !feature.enabled);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-secondary-blue-400 bg-secondary-blue-500 text-white gap-1">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl mb-0">
            {selectedPlan.name}
          </DialogTitle>
          <DialogDescription className="text-secondary-blue-200">
            {selectedPlan.subtitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1">
          <div className="rounded-xl border border-secondary-blue-400/70 bg-secondary-blue-700/50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-widest text-secondary-blue-200">
                  Price
                </p>
                {isFreePlan ? (
                  <p className="mt-1 text-3xl font-bold text-primary-green-300">
                    Free
                  </p>
                ) : (
                  <div className="mt-1 flex items-end gap-1">
                    <span className="pb-1 text-sm text-secondary-blue-300">
                      ₹
                    </span>
                    <NumberFlow
                      value={currentPrice}
                      className="text-3xl font-bold leading-none text-white"
                      transformTiming={{ duration: 300, easing: 'ease-out' }}
                      willChange
                    />
                    <span className="pb-1 text-xs text-secondary-blue-200 whitespace-nowrap">
                      {priceSuffix}
                    </span>
                  </div>
                )}
                {!isFreePlan && (
                  <p className="mt-1 text-xs text-secondary-blue-300 whitespace-nowrap">
                    +GST (18%) included
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-secondary-blue-200">
                  {getBilledLabel(billingCycle)}
                </p>
                <p className="mt-1 font-semibold text-white">
                  {billedAmount === 0 ? 'Free' : `₹${billedAmount}`}
                </p>
              </div>
            </div>
          </div>

          {description && (
            <div className="rounded-xl border border-secondary-blue-400/70 bg-secondary-blue-700/50 p-4">
              <div className="max-h-20 overflow-auto">
                <p className="text-sm leading-relaxed text-secondary-blue-100">
                  {description}
                </p>
              </div>
            </div>
          )}

          {limitations.length > 0 && (
            <div className="rounded-xl border border-secondary-blue-400/70 bg-secondary-blue-700/50 p-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-secondary-blue-200">
                Plan Limits
              </p>
              <div className="flex flex-wrap gap-2">
                {limitations.map((limit, idx) => (
                  <span
                    key={`${selectedPlan.id}-limit-${idx}`}
                    className="rounded-full border border-primary-green-500/30 bg-primary-green-500/10 px-2.5 py-1 text-xs font-medium text-primary-green-200"
                  >
                    {limit}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-secondary-blue-400/70 bg-secondary-blue-700/50 p-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-secondary-blue-200">
              {hasUnavailableFeatures ? 'Features' : 'Included Features'}
            </p>
            <ul className="grid max-h-22.5 grid-cols-1 gap-2 overflow-y-auto pl-0.5 pr-1 md:grid-cols-2">
              {features.map((feature, idx) => (
                <li
                  key={`${selectedPlan.id}-feature-${idx}`}
                  className="flex items-center gap-2"
                >
                  <div
                    className={cn(
                      'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-1',
                      feature.enabled
                        ? 'bg-primary-green-500/15 ring-primary-green-500/20'
                        : 'bg-alert-red-500/15 ring-alert-red-500/20'
                    )}
                  >
                    {feature.enabled ? (
                      <Check className="h-2.5 w-2.5 text-primary-green-500" />
                    ) : (
                      <X className="h-2.5 w-2.5 text-alert-red-500" />
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-xs',
                      feature.enabled
                        ? 'text-secondary-blue-100'
                        : 'text-secondary-blue-300 line-through'
                    )}
                  >
                    {feature.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* GST Section */}
          <div className="rounded-xl border border-secondary-blue-400/70 bg-secondary-blue-700/50 p-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-secondary-blue-200">
              GST (Optional)
            </p>
            {isGstAdded ? (
              <div className="flex items-center justify-between gap-2">
                <KInput
                  disabled
                  label="GSTIN"
                  id="gstin"
                  value={savedGstValue}
                  onChange={(e) => setGstValue(e.target.value)}
                  maxLength={15}
                  wrapperClass="w-full"
                  className="gst-input"
                />
                <Button
                  className="h-13"
                  variant="destructive"
                  onClick={() => {
                    deleteGst();
                    setGstValue('');
                  }}
                  disabled={isDeletingGst}
                >
                  {isDeletingGst ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ) : isEditingGst ? (
              <>
                <div className="flex items-center gap-2">
                  <KInput
                    label="GSTIN"
                    id="gstin"
                    value={gstValue}
                    onChange={(e) => {
                      setGstValue(e.target.value.toUpperCase());
                      if (gstError) setGstError('');
                    }}
                    maxLength={15}
                    wrapperClass="w-full"
                    className="gst-input"
                  />
                  <Button
                    className="h-13"
                    onClick={() => {
                      const trimmed = gstValue.trim().toUpperCase();
                      if (!trimmed) {
                        setGstError('GSTIN is required.');
                        return;
                      }
                      if (!isValidGSTIN(trimmed)) {
                        setGstError(
                          'Enter a valid 15-character GSTIN (e.g. 22AAAAA0000A1Z5).'
                        );
                        return;
                      }
                      addGst(trimmed);
                      setIsEditingGst(false);
                      setGstError('');
                      setGstValue('');
                    }}
                    disabled={!gstValue.trim() || isAddingGst}
                  >
                    {isAddingGst ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check />
                    )}
                  </Button>
                  <Button
                    className="h-13"
                    variant="outlinePrimary"
                    onClick={() => {
                      setIsEditingGst(false);
                      setGstValue('');
                    }}
                  >
                    <X />
                  </Button>
                </div>
                {gstError && <p className="text-xs text-red-400">{gstError}</p>}
              </>
            ) : (
              <Button
                variant="outlinePrimary"
                size="lg"
                onClick={() => setIsEditingGst(true)}
                className="h-13"
              >
                Add GST
              </Button>
            )}
          </div>

          {isFreePlan && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-200">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-xs leading-relaxed">
                Free trial is already used on your first package while adding
                gym. This plan cannot be selected again.
              </p>
            </div>
          )}

          {planChangeType === 'same' && !isFreePlan && (
            <div className="flex items-start gap-2 rounded-xl border border-primary-green-500/40 bg-primary-green-500/10 p-3 text-primary-green-200">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-xs leading-relaxed">
                You are renewing the same plan. Your remaining time will be
                stacked, and your current plan end date will be extended.
              </p>
            </div>
          )}

          {planChangeType === 'different' && !isFreePlan && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-amber-200">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-xs leading-relaxed">
                You are switching plans. Your current plan&apos;s remaining time
                will be forfeited, and the new plan will start immediately after
                payment.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:justify-end mt-2">
          <Button
            variant="outline"
            className="border-secondary-blue-300/40 bg-transparent hover:bg-secondary-blue-600"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            disabled={isFreePlan || isPaying}
            className={cn(
              isFreePlan || isPaying
                ? 'cursor-not-allowed bg-secondary-blue-400 text-secondary-blue-200 hover:bg-secondary-blue-400'
                : 'bg-primary-green-400 text-primary-blue-800 hover:bg-primary-green-300'
            )}
            onClick={async () => {
              if (!isFreePlan) {
                await onPayNow?.(selectedPlan, billingCycle);
              }
            }}
          >
            {isFreePlan ? (
              'Free Trial Ended'
            ) : isPaying ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </span>
            ) : (
              'Pay Now'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
