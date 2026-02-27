'use client';

import { SectionHeader } from '@/components/pages/members/details/sidebar/section-headers';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';

interface CollapsibleSectionProps {
  title: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  children: React.ReactNode;
}

export function CollapsibleSection({
  title,
  isOpen,
  setIsOpen,
  children,
}: CollapsibleSectionProps) {
  return (
    <Collapsible defaultOpen={isOpen} onOpenChange={setIsOpen}>
      <SectionHeader title={title} isOpen={isOpen} />
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
}
