import { CircleQuestionMark, UsersRound } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LeadSource } from '@/types/lead';

import { KBadgeAds, KBadgeOnline, KBadgeWalkIn } from '../icons';

interface SourceBadgeProps {
  status?: LeadSource;
  days?: number;
  showIcon?: boolean;
  className?: string;
}

export const SourceBadge = ({
  status = 'walk_in',
  days,
  showIcon = true,
  className,
}: SourceBadgeProps) => {
  const getIcon = () => {
    if (!showIcon) return null;

    switch (status) {
      case 'walk_in':
        return <KBadgeWalkIn />;
      case 'online':
        return <KBadgeOnline />;
      case 'ads':
        return <KBadgeAds />;
      case 'referral':
        return <UsersRound className="size-4" />;
      case 'other':
        return <CircleQuestionMark className="size-4" />;
      default:
        return null;
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'rounded-lg text-sm h-7 gap-2 border-0 bg-primary-blue-400',
        className
      )}
    >
      {getIcon()}
      {days
        ? `${days} days`
        : status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
    </Badge>
  );
};
