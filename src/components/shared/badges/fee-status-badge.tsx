import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import {
  KBadgeCheck,
  KBadgeClose,
  KBadgeContacted,
  KBadgeFlag,
  KBadgeInterest,
  KBadgeMinus,
  KBadgeNew,
} from '../icons';

interface FeeStatusBadgeProps {
  status?:
    | 'paid'
    | 'partially_paid'
    | 'unpaid'
    | 'lost'
    | 'new'
    | 'contacted'
    | 'interested';
  days?: number;
  showIcon?: boolean;
  className?: string;
}

export const FeeStatusBadge = ({
  status = 'paid',
  days,
  showIcon = true,
  className,
}: FeeStatusBadgeProps) => {
  const isLongDay = days && days > 14;

  const getBadgeStyles = () => {
    if (days) {
      return isLongDay
        ? 'bg-alert-red-500/10 border-alert-red-500'
        : 'bg-semantic-blue-500/10 border-semantic-blue-500';
    }

    switch (status) {
      case 'paid':
      case 'interested':
        return 'bg-neutral-green-500/10 border-neutral-green-500';
      case 'partially_paid':
        return 'bg-neutral-ochre-600/10 border-neutral-ochre-500';
      case 'unpaid':
      case 'lost':
        return 'bg-alert-red-500/10 border-alert-red-500';
      case 'new':
        return 'bg-secondary-yellow-500/10 border-secondary-yellow-500';
      case 'contacted':
        return 'bg-semantic-blue-500/10 border-semantic-blue-500';
      default:
        return '';
    }
  };

  const getIcon = () => {
    if (!showIcon) return null;

    if (days) {
      return (
        <KBadgeFlag
          className={
            isLongDay ? 'text-alert-red-500' : 'text-semantic-blue-400'
          }
        />
      );
    }

    switch (status) {
      case 'paid':
        return <KBadgeCheck />;
      case 'partially_paid':
        return <KBadgeMinus />;
      case 'unpaid':
        return <KBadgeClose />;
      case 'lost':
        return <KBadgeClose />;
      case 'new':
        return <KBadgeNew />;
      case 'contacted':
        return <KBadgeContacted />;
      case 'interested':
        return <KBadgeInterest />;
      default:
        return null;
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'rounded-[35px] text-xs h-7 gap-2',
        getBadgeStyles(),
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
