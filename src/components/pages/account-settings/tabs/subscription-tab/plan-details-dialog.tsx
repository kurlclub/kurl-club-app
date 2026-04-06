import NumberFlow from '@number-flow/react';
import { Check, Info, Loader2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { PricingPlan } from '@/services/pricing';

type BillingCycle = 'monthly' | '6months' | 'yearly';
type PlanChangeType = 'same' | 'different';

type PlanWithFallbackFields = PricingPlan & {
  monthlyPrice?: number;
  sixMonthsPrice?: number;
  yearlyPrice?: number;
  limits?: Record<string, number | null | undefined>;
  featureFlags?: Record<string, unknown>;
  features?: string[] | Record<string, unknown>;
  limitations?: string[];
};

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
  const safePlan = plan as PlanWithFallbackFields;
  const monthly = plan.pricing?.monthly ?? safePlan.monthlyPrice ?? 0;
  const sixMonths = plan.pricing?.sixMonths ?? safePlan.sixMonthsPrice ?? 0;
  const yearly = plan.pricing?.yearly ?? safePlan.yearlyPrice ?? 0;

  switch (cycle) {
    case 'monthly':
      return monthly;
    case '6months':
      return Math.round(sixMonths / 6);
    case 'yearly':
      return Math.round(yearly / 12);
  }
};

const getBilledAmount = (plan: PricingPlan, cycle: BillingCycle): number => {
  const safePlan = plan as PlanWithFallbackFields;
  const monthly = plan.pricing?.monthly ?? safePlan.monthlyPrice ?? 0;
  const sixMonths = plan.pricing?.sixMonths ?? safePlan.sixMonthsPrice ?? 0;
  const yearly = plan.pricing?.yearly ?? safePlan.yearlyPrice ?? 0;

  switch (cycle) {
    case 'monthly':
      return monthly;
    case '6months':
      return sixMonths;
    case 'yearly':
      return yearly;
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

const LIMIT_LABELS: Record<string, string> = {
  maxClubs: 'Clubs up to',
  maxMembers: 'Members up to',
  maxTrainers: 'Trainers up to',
  maxStaffs: 'Staff up to',
  maxMembershipPlans: 'Membership plans up to',
  maxWorkoutPlans: 'Workout plans up to',
  maxLeadsPerMonth: 'Leads per month up to',
};

type FeatureItem = {
  label: string;
  enabled: boolean;
};

const FEATURE_LABELS: Record<string, string> = {
  studioDashboard: 'Studio dashboard',
  'studioDashboard.enabled': 'Studio dashboard',
  'studioDashboard.paymentInsights': 'Payment insights',
  'studioDashboard.skipperStats': 'Skipper stats',
  'studioDashboard.attendanceStats': 'Attendance stats',
  memberManagement: 'Member management',
  paymentManagement: 'Payment management',
  'attendance.manual': 'Manual attendance',
  'attendance.automatic': 'Automatic attendance',
  'attendance.memberInsights': 'Member insights',
  'attendance.deviceManagement': 'Attendance device management',
  leadsManagement: 'Leads management',
  'programs.membershipPlans': 'Membership plans',
  'programs.workoutPlans': 'Workout plans',
  'staffManagement.activityTracking': 'Staff activity tracking',
  'staffManagement.staffLogin': 'Staff login',
  payrollManagement: 'Payroll management',
  'expenses.reportsDashboard': 'Reports dashboard',
  'expenses.expenseManagement': 'Expense management',
  'helpAndSupport.ticketingPortal': 'Ticketing portal support',
  'helpAndSupport.whatsApp': 'WhatsApp support',
  'helpAndSupport.email': 'Email support',
  'helpAndSupport.call': 'Call support',
  'whatsAppNotifications.paymentReminders': 'WhatsApp payment reminders',
  'whatsAppNotifications.membershipExpiry': 'WhatsApp membership expiry alerts',
  'whatsAppNotifications.lowAttendance': 'WhatsApp low attendance alerts',
  'whatsAppNotifications.specialDays': 'WhatsApp special day alerts',
  'invoice.customTemplates': 'Custom invoice templates',
  'notifications.realtime': 'Realtime notifications',
  'notifications.whatsApp': 'WhatsApp notifications',
  'notifications.email': 'Email notifications',
  'notifications.push': 'Push notifications',
};

const toTitle = (value: string) =>
  value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[._-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\w/, (char) => char.toUpperCase());

const buildLimitations = (plan: PricingPlan): string[] => {
  const safePlan = plan as PlanWithFallbackFields;
  const existing = Array.isArray(safePlan.limitations)
    ? safePlan.limitations.filter(Boolean)
    : [];
  const limits = safePlan.limits;

  if (!limits || typeof limits !== 'object') {
    return existing;
  }

  const fromLimits = Object.entries(limits)
    .filter(([, value]) => typeof value === 'number' && Number.isFinite(value))
    .map(([key, value]) => `${LIMIT_LABELS[key] || toTitle(key)} ${value}`);

  return Array.from(new Set([...existing, ...fromLimits]));
};

const collectFeatureItems = (value: unknown, prefix = ''): FeatureItem[] => {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((label) => ({ label, enabled: true }));
  }

  if (!value || typeof value !== 'object') {
    return [];
  }

  const items: FeatureItem[] = [];

  for (const [key, nested] of Object.entries(
    value as Record<string, unknown>
  )) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (typeof nested === 'boolean') {
      items.push({
        label: FEATURE_LABELS[path] || FEATURE_LABELS[key] || toTitle(path),
        enabled: nested,
      });
      continue;
    }

    if (typeof nested === 'number') {
      if (nested > 0) {
        items.push({
          label: FEATURE_LABELS[path] || FEATURE_LABELS[key] || toTitle(path),
          enabled: true,
        });
      }
      continue;
    }

    items.push(...collectFeatureItems(nested, path));
  }

  return items;
};

const buildFeatures = (plan: PricingPlan): FeatureItem[] => {
  const safePlan = plan as PlanWithFallbackFields;
  const featureSource = safePlan.featureFlags ?? safePlan.features;
  const items = collectFeatureItems(featureSource);
  const featureMap = new Map<string, boolean>();

  for (const item of items) {
    const existing = featureMap.get(item.label);
    featureMap.set(item.label, Boolean(existing) || item.enabled);
  }

  return Array.from(featureMap.entries())
    .filter(([label]) => Boolean(label))
    .map(([label, enabled]) => ({ label, enabled }));
};

export function PlanDetailsDialog({
  open,
  onOpenChange,
  selectedPlan,
  billingCycle,
  planChangeType = null,
  onPayNow,
  isPaying = false,
}: PlanDetailsDialogProps) {
  if (!selectedPlan) return null;

  const currentPrice = getPrice(selectedPlan, billingCycle);
  const billedAmount = getBilledAmount(selectedPlan, billingCycle);
  const isFreePlan = currentPrice === 0;
  const description = getPlainText(selectedPlan.description);
  const limitations = buildLimitations(selectedPlan);
  const features = buildFeatures(selectedPlan);

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

        <div className="space-y-2">
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
                    <span className="pb-1 text-xs text-secondary-blue-200">
                      /mo
                    </span>
                  </div>
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
              Included Features
            </p>
            <ul className="grid max-h-30 grid-cols-1 gap-2 overflow-y-auto pl-0.5 pr-1 md:grid-cols-2">
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
