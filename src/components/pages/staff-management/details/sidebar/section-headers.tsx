import { KAccordionClose, KAccordionOpen } from '@/components/shared/icons';
import { CollapsibleTrigger } from '@/components/ui/collapsible';

interface SectionHeaderProps {
  title: string;
  isOpen: boolean;
}

export function SectionHeader({ title, isOpen }: SectionHeaderProps) {
  return (
    <CollapsibleTrigger className="flex px-8 py-3 border-y border-secondary-blue-500 justify-between items-center w-full">
      <h3 className="text-[15px] font-normal leading-normal text-primary-blue-50">
        {title}
      </h3>
      {isOpen ? <KAccordionOpen /> : <KAccordionClose />}
    </CollapsibleTrigger>
  );
}
