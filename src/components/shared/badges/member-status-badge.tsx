import React from 'react';

import { cn } from '@/lib/utils';

import { Badge } from '../../ui/badge';

interface MemberStatusBadgeProps {
  status?: 'active' | 'inactive';
}

const MemberStatusBadge: React.FC<MemberStatusBadgeProps> = ({
  status = 'active',
}) => {
  const getIcon = () => {
    switch (status) {
      case 'active':
        return (
          <span className="w-[7px] h-[7px] rounded-full bg-neutral-green-500" />
        );
      case 'inactive':
        return (
          <span className="w-[7px] h-[7px] rounded-full bg-alert-red-500" />
        );
      default:
        return null;
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'rounded-[35px] p-2 h-[30px] gap-2 bg-secondary-blue-500 border-0 text-primary-blue-50'
      )}
    >
      {getIcon()}
      {(() => {
        switch (status) {
          case 'active':
            return 'Active';
          case 'inactive':
            return 'Inactive';
          default:
            return 'Unknown';
        }
      })()}
    </Badge>
  );
};

export default MemberStatusBadge;
