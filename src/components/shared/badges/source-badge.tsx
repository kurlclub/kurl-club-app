import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { KBadgeAds, KBadgeOnline, KBadgeWalkIn } from '../icons';

interface SourceBadgeProps {
  status?: 'walk_in' | 'online' | 'ads';
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
