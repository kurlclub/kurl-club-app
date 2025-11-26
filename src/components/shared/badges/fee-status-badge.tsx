import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { KBadgeCheck, KBadgeClose, KBadgeFlag, KBadgeMinus } from '../icons';

interface FeeStatusBadgeProps {
  status?: 'paid' | 'partially_paid' | 'unpaid' | 'pending' | 'overdue';
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
        return 'bg-neutral-green-500/10 border-neutral-green-500';
      case 'partially_paid':
        return 'bg-neutral-ochre-600/10 border-neutral-ochre-500';
      case 'pending':
        return 'bg-semantic-blue-500/10 border-semantic-blue-500';
      case 'overdue':
      case 'unpaid':
        return 'bg-alert-red-500/10 border-alert-red-500';
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
      case 'pending':
        return <KBadgeFlag className="text-semantic-blue-400" />;
      case 'overdue':
      case 'unpaid':
        return <KBadgeClose />;
      default:
        return null;
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'rounded-[35px] text-xs h-[28px] gap-2',
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
