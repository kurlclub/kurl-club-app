import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const darkCardClassName =
  'bg-secondary-blue-500/80 backdrop-blur-sm border-secondary-blue-400 relative overflow-hidden';

const darkRowClassName =
  'rounded-lg border border-secondary-blue-400 bg-secondary-blue-700';

const lightSkeletonClassName = 'bg-gray-200 dark:bg-secondary-blue-400';

function SectionHeaderSkeleton({
  showAction = false,
  light = false,
}: {
  showAction?: boolean;
  light?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <Skeleton
          className={cn(
            'mt-1 h-5 w-5 rounded-sm',
            light && lightSkeletonClassName
          )}
        />
        <div className="space-y-2">
          <Skeleton
            className={cn('h-5 w-44', light && lightSkeletonClassName)}
          />
          <Skeleton
            className={cn(
              'h-4 w-64 max-w-full',
              light && lightSkeletonClassName
            )}
          />
        </div>
      </div>
      {showAction ? (
        <Skeleton
          className={cn('h-9 w-24 shrink-0', light && lightSkeletonClassName)}
        />
      ) : null}
    </div>
  );
}

function SectionLabelSkeleton({ light = false }: { light?: boolean }) {
  return (
    <Skeleton className={cn('h-4 w-40', light && lightSkeletonClassName)} />
  );
}

function ChannelCardSkeleton() {
  return (
    <div className={cn('flex items-start gap-3 p-3', darkRowClassName)}>
      <Skeleton className="mt-0.5 h-6 w-11 rounded-full shrink-0" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-28" />
      </div>
    </div>
  );
}

function TemplateCardSkeleton() {
  return (
    <div className="rounded-lg border-2 border-gray-200 dark:border-secondary-blue-400 bg-white dark:bg-secondary-blue-500/30 overflow-hidden">
      <Skeleton
        className={cn('aspect-3/4 w-full rounded-none', lightSkeletonClassName)}
      />
      <div className="space-y-2 px-3 pb-3 pt-1">
        <Skeleton className={cn('h-4 w-full', lightSkeletonClassName)} />
        <Skeleton className={cn('mx-auto h-3 w-16', lightSkeletonClassName)} />
      </div>
    </div>
  );
}

function InputGridSkeleton({ columns = 2 }: { columns?: 1 | 2 | 3 }) {
  return (
    <div
      className={cn(
        'grid gap-4',
        columns === 1 && 'grid-cols-1',
        columns === 2 && 'grid-cols-1 md:grid-cols-2',
        columns === 3 && 'grid-cols-1 md:grid-cols-3'
      )}
    >
      {Array.from({ length: columns }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className={cn('h-4 w-28', lightSkeletonClassName)} />
          <Skeleton className={cn('h-11 w-full', lightSkeletonClassName)} />
        </div>
      ))}
    </div>
  );
}

function PricingPlanCardSkeleton() {
  return (
    <div className="flex-1 rounded-xl border border-secondary-blue-400 bg-secondary-blue-700 p-5">
      <Skeleton className="h-5 w-28" />
      <Skeleton className="mt-2 h-3 w-20" />
      <Skeleton className="mt-4 h-9 w-32" />
      <Skeleton className="mt-1 h-3 w-24" />
      <div className="mt-5 space-y-2.5 border-t border-secondary-blue-400/50 pt-5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center gap-2.5">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-3.5 flex-1" />
          </div>
        ))}
      </div>
      <Skeleton className="mt-6 h-9 w-full" />
    </div>
  );
}

function CompactRowSkeleton({
  showLeadingToggle = false,
  showTrailingInput = false,
  divider = true,
}: {
  showLeadingToggle?: boolean;
  showTrailingInput?: boolean;
  divider?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 py-3.5',
        divider && 'border-b border-secondary-blue-400/60'
      )}
    >
      <div className="flex items-start gap-3">
        {showLeadingToggle && (
          <Skeleton className="mt-0.5 h-6 w-11 rounded-full shrink-0" />
        )}
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-64 max-w-full" />
        </div>
      </div>
      <Skeleton
        className={cn('shrink-0', showTrailingInput ? 'h-9 w-24' : 'h-5 w-28')}
      />
    </div>
  );
}

export function MemberActivitySkeleton() {
  return (
    <Card className={darkCardClassName}>
      <CardHeader className="relative z-10 pb-4">
        <SectionHeaderSkeleton />
      </CardHeader>
      <CardContent className="relative z-10 pt-0">
        <div className="rounded-xl border border-secondary-blue-400 bg-secondary-blue-700 px-4">
          <CompactRowSkeleton showTrailingInput />
          <CompactRowSkeleton showTrailingInput divider={false} />
        </div>
      </CardContent>
    </Card>
  );
}

export function AttendanceSettingsSkeleton() {
  return (
    <Card className={darkCardClassName}>
      <CardHeader className="relative z-10 pb-4">
        <SectionHeaderSkeleton />
      </CardHeader>
      <CardContent className="relative z-10 pt-0">
        <div className="rounded-xl border border-secondary-blue-400 bg-secondary-blue-700 px-4">
          <CompactRowSkeleton showLeadingToggle />
          <CompactRowSkeleton showLeadingToggle />
          <CompactRowSkeleton showLeadingToggle />
          <CompactRowSkeleton showLeadingToggle divider={false} />
        </div>
      </CardContent>
    </Card>
  );
}

export function NotificationPreferencesSkeleton() {
  return (
    <Card className={darkCardClassName}>
      <div className="absolute inset-0 opacity-30 pointer-events-none" />
      <CardHeader className="relative z-10">
        <SectionHeaderSkeleton />
      </CardHeader>
      <CardContent className="relative z-10 space-y-6 pt-0">
        <div className="space-y-3">
          <SectionLabelSkeleton />
          <div className="rounded-xl border border-secondary-blue-400 bg-secondary-blue-700 px-4">
            <CompactRowSkeleton showLeadingToggle showTrailingInput />
            <CompactRowSkeleton showLeadingToggle showTrailingInput />
            <CompactRowSkeleton showLeadingToggle divider={false} />
          </div>
        </div>

        <div className="space-y-3">
          <SectionLabelSkeleton />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <ChannelCardSkeleton />
            <ChannelCardSkeleton />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function InvoiceSettingsSkeleton() {
  return (
    <Card className={darkCardClassName}>
      <CardHeader>
        <SectionHeaderSkeleton />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-6">
          <div className="space-y-3">
            <SectionLabelSkeleton />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <TemplateCardSkeleton key={index} />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <SectionLabelSkeleton />
            <InputGridSkeleton columns={2} />
            <Skeleton className="h-3 w-48" />
          </div>

          <div className="space-y-3">
            <SectionLabelSkeleton />
            <InputGridSkeleton columns={2} />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SubscriptionPlansSkeleton() {
  return (
    <div className="py-2">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-9 w-56 rounded-lg" />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <PricingPlanCardSkeleton />
        <PricingPlanCardSkeleton />
        <PricingPlanCardSkeleton />
      </div>
    </div>
  );
}
