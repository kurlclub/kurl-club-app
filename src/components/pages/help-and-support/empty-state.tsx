'use client';

import Image from 'next/image';

import { ArrowUpRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onRequestSupport?: () => void;
}

function EmptyState({ onRequestSupport }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)] w-full gap-4">
      <Image
        src="/assets/svg/help-empty.svg"
        alt="Empty state"
        width={210}
        height={210}
        className="object-contain"
      />
      <div className="flex flex-col gap-4 items-center">
        <span className="text-[22px] font-medium leading-normal">
          Wow so empty...
        </span>
        <Button className="gap-1" onClick={onRequestSupport}>
          Request support <ArrowUpRight size={18} />
        </Button>
      </div>
    </div>
  );
}

export default EmptyState;
