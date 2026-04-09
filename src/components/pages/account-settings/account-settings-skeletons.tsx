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

function ToggleRowSkeleton({
  light = false,
  showTrailingInput = false,
  showExtraOption = false,
}: {
  light?: boolean;
  showTrailingInput?: boolean;
  showExtraOption?: boolean;
}) {
  return (
    <div className={cn('p-4', darkRowClassName)}>
      <div className="flex items-start gap-4">
        <Skeleton className="mt-1 h-6 w-11 rounded-full shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <Skeleton
                className={cn('h-4 w-40', light && lightSkeletonClassName)}
              />
              <Skeleton
                className={cn(
                  'h-3 w-56 max-w-full',
                  light && lightSkeletonClassName
                )}
              />
            </div>
            {showTrailingInput ? (
              <Skeleton
                className={cn(
                  'h-9 w-24 shrink-0',
                  light && lightSkeletonClassName
                )}
              />
            ) : null}
          </div>
          {showExtraOption ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-sm shrink-0" />
              <Skeleton
                className={cn('h-3 w-32', light && lightSkeletonClassName)}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ChannelCardSkeleton() {
  return (
    <div className={cn('flex items-start gap-3 p-4', darkRowClassName)}>
      <Skeleton className="mt-1 h-6 w-11 rounded-full shrink-0" />
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
    <div className="rounded-2xl border border-secondary-blue-400/45 bg-secondary-blue-600/40 p-5 md:p-6">
      <div className="space-y-4">
        <Skeleton className="h-7 w-28 rounded-full" />
        <div className="space-y-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-52 max-w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-y-3 pt-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
        <Skeleton className="mt-4 h-11 w-full" />
      </div>
    </div>
  );
}

export function NotificationPreferencesSkeleton() {
  return (
    <Card className={darkCardClassName}>
      <div className="absolute inset-0 opacity-30 pointer-events-none" />
      <CardHeader className="relative z-10">
        <SectionHeaderSkeleton />
      </CardHeader>
      <CardContent className="relative z-10 space-y-6">
        <div className="space-y-4">
          <SectionLabelSkeleton />
          <ToggleRowSkeleton showTrailingInput />
          <ToggleRowSkeleton showTrailingInput showExtraOption />
          <ToggleRowSkeleton />
        </div>

        <div className="space-y-4">
          <SectionLabelSkeleton />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
    <Card className="bg-white dark:bg-secondary-blue-500 border-gray-200 dark:border-primary-blue-400">
      <CardHeader>
        <SectionHeaderSkeleton light />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-6">
          <div className="space-y-3">
            <SectionLabelSkeleton light />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <TemplateCardSkeleton key={index} />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <SectionLabelSkeleton light />
            <InputGridSkeleton columns={2} />
            <Skeleton className={cn('h-3 w-48', lightSkeletonClassName)} />
          </div>

          <div className="space-y-3">
            <SectionLabelSkeleton light />
            <InputGridSkeleton columns={2} />
          </div>

          <div className="space-y-2">
            <Skeleton className={cn('h-4 w-32', lightSkeletonClassName)} />
            <Skeleton className={cn('h-24 w-full', lightSkeletonClassName)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SubscriptionPlansSkeleton() {
  return (
    <div className="space-y-8 px-2 py-6">
      <div className="space-y-3 text-center">
        <Skeleton className="mx-auto h-8 w-56" />
        <Skeleton className="mx-auto h-4 w-80 max-w-full" />
      </div>

      <div className="flex justify-center">
        <Skeleton className="h-11 w-64 rounded-xl" />
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 lg:grid-cols-2">
        <PricingPlanCardSkeleton />
        <PricingPlanCardSkeleton />
      </div>
    </div>
  );
}
