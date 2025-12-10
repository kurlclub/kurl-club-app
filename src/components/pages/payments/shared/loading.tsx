import React from 'react';

import { Skeleton } from '@/components/ui/skeleton';

type PaymentTabType = 'outstanding' | 'expired' | 'completed' | 'history';

type Props = {
  type: PaymentTabType;
};

export const Loading: React.FC<Props> = ({ type }) => {
  switch (type) {
    case 'outstanding':
      return (
        <div className="flex flex-col gap-7">
          <div className="grid grid-cols-3 gap-4 h-[74px]">
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3 flex-wrap">
                <Skeleton className="h-10 w-[250px]" />
                <Skeleton className="h-10 w-[110px]" />
                <Skeleton className="h-10 w-[110px]" />
                <Skeleton className="h-10 w-[110px]" />
              </div>
              <Skeleton className="h-10 w-[80px]" />
            </div>

            <Skeleton className="h-[420px]" />
          </div>
        </div>
      );

    case 'expired':
      return (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <Skeleton className="h-10 w-[250px]" />
              <Skeleton className="h-10 w-[110px]" />
              <Skeleton className="h-10 w-[110px]" />
              <Skeleton className="h-10 w-[110px]" />
            </div>
            <Skeleton className="h-10 w-[80px]" />
          </div>

          <Skeleton className="h-[420px]" />
        </div>
      );

    case 'completed':
      return (
        <div className="flex flex-col gap-7">
          <div className="grid grid-cols-3 gap-4 h-[74px]">
            <Skeleton />
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3 flex-wrap">
                <Skeleton className="h-10 w-[250px]" />
                <Skeleton className="h-10 w-[110px]" />
                <Skeleton className="h-10 w-[110px]" />
                <Skeleton className="h-10 w-[110px]" />
              </div>
              <Skeleton className="h-10 w-[80px]" />
            </div>

            <Skeleton className="h-[420px]" />
          </div>
        </div>
      );

    case 'history':
      return (
        <div className="flex flex-col gap-7">
          <div className="grid grid-cols-3 gap-4 h-[74px]">
            <Skeleton />
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3 flex-wrap">
                <Skeleton className="h-10 w-[250px]" />
                <Skeleton className="h-10 w-[110px]" />
                <Skeleton className="h-10 w-[110px]" />
                <Skeleton className="h-10 w-[110px]" />
              </div>
              <Skeleton className="h-10 w-[80px]" />
            </div>
            <Skeleton className="h-[420px]" />
          </div>
        </div>
      );

    default:
      return (
        <div className="flex flex-col gap-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      );
  }
};
