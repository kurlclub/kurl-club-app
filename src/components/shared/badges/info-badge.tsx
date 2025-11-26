import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { KBadgeCheck, KBadgeClose, KBadgeFlag } from '../icons';

interface InfoBadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
  className?: string;
  showIcon?: boolean;
}

export const InfoBadge = ({
  variant = 'success',
  children,
  className,
  showIcon = true,
}: InfoBadgeProps) => {
  const getBadgeStyles = () => {
    switch (variant) {
      case 'success':
        return 'bg-neutral-green-500/10 border-neutral-green-500';
      case 'warning':
        return 'bg-neutral-ochre-600/10 border-neutral-ochre-500';
      case 'error':
        return 'bg-alert-red-500/10 border-alert-red-500';
      case 'info':
        return 'bg-semantic-blue-500/10 border-semantic-blue-500';
      default:
        return 'bg-neutral-green-500/10 border-neutral-green-500';
    }
  };

  const getIcon = () => {
    if (!showIcon) return null;

    switch (variant) {
      case 'success':
        return <KBadgeCheck />;
      case 'warning':
        return <KBadgeFlag className="text-neutral-ochre-500" />;
      case 'error':
        return <KBadgeClose />;
      case 'info':
        return <KBadgeFlag className="text-semantic-blue-500" />;
      default:
        return <KBadgeCheck />;
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
      {children}
    </Badge>
  );
};
