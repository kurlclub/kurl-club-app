'use client';

import { useLayoutEffect, useRef, useState } from 'react';

import { ArrowUpRight } from 'lucide-react';

import { useCurrency } from '@/hooks/use-currency';
import type { MembershipPlan } from '@/types/membership-plan';

interface MembershipCardProps {
  plan: MembershipPlan;
  onClick: () => void;
}

// Strip the stored rich-text down to plain words so it clamps cleanly.
const toText = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// Editorial Label × Ticket Stub: a perforated "pass" — price stub on the left,
// dashed tear line with punch-hole notches, editorial main with mono overlines.
export function MembershipCard({ plan, onClick }: MembershipCardProps) {
  const { formatAmount } = useCurrency();
  const isPerSession = plan.billingType === 'PerSession';
  const billingLabel = isPerSession ? 'Per Session' : 'Recurring';
  const durationInDays = Number(plan.durationInDays);
  const durationLabel =
    durationInDays === 30 ? '1 month' : `${plan.durationInDays} days`;
  const statusText = plan.isActive
    ? 'text-primary-green-300'
    : 'text-alert-red-300';

  // Only surface "Read more" when the clamped description actually overflows.
  const descRef = useRef<HTMLParagraphElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useLayoutEffect(() => {
    const el = descRef.current;
    if (!el) return;
    const check = () => setIsTruncated(el.scrollHeight > el.clientHeight + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [plan.details]);

  return (
    <div
      onClick={onClick}
      className="group flex cursor-pointer rounded-md border border-white/15 bg-secondary-blue-700 transition-colors hover:border-white/30"
    >
      {/* Stub — price */}
      <div className="flex w-24 shrink-0 flex-col items-center justify-center gap-1.5 rounded-l-md bg-white/3 p-3 text-center">
        <span className="text-xl font-bold leading-none tracking-tight text-white">
          {formatAmount(Number(plan.fee))}
        </span>
        <span className="font-mono text-[9px] uppercase leading-tight tracking-[0.12em] text-white/40">
          {billingLabel}
        </span>
      </div>

      {/* Perforation + editorial main */}
      <div className="relative flex-1 border-l border-dashed border-white/20 p-5">
        {/* Punch-hole notches — fill matches the StudioLayout page background */}
        <span className="absolute left-0 top-0 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background-dark" />
        <span className="absolute bottom-0 left-0 size-3.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-background-dark" />

        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
          <span>Membership</span>
          <span className={statusText}>
            {plan.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="my-3 h-px bg-white/12" />
        <h3 className="text-[15px] font-semibold leading-snug text-white">
          {plan.planName}
        </h3>
        <p className="mt-1.5 font-mono text-[11px] text-white/40">
          Valid for {durationLabel}
        </p>
        <div className="my-3 h-px bg-white/12" />

        <p
          ref={descRef}
          className="line-clamp-2 text-[13px] leading-snug text-white/55"
        >
          {toText(plan.details)}
        </p>
        {isTruncated && (
          <span className="mt-1 inline-flex items-center gap-0.5 text-[11px] font-medium text-primary-green-300/80 transition-colors group-hover:text-primary-green-200">
            Read more
            <ArrowUpRight className="size-3" />
          </span>
        )}
      </div>
    </div>
  );
}
