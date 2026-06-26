import React from 'react';

import { cn } from '@/lib/utils';
import type { MembershipState } from '@/types/member.types';

interface MembershipStateDotProps {
  state?: MembershipState;
  className?: string;
}

const STATE_COLOR: Record<MembershipState, string> = {
  active: 'bg-neutral-green-500',
  inactive: 'bg-alert-red-500',
};

const STATE_LABEL: Record<MembershipState, string> = {
  active: 'Active',
  inactive: 'Inactive',
};

/**
 * A small "breathing" status dot used to indicate a member's membership state.
 * Pure CSS (Tailwind `animate-ping`) so it stays cheap when rendered per table row.
 */
const MembershipStateDot: React.FC<MembershipStateDotProps> = ({
  state = 'active',
  className,
}) => {
  const color = STATE_COLOR[state];
  const label = STATE_LABEL[state];

  return (
    <span
      className={cn('relative flex h-2.5 w-2.5', className)}
      role="img"
      aria-label={label}
      title={label}
    >
      <span
        className={cn(
          'absolute inline-flex h-full w-full animate-ping rounded-full opacity-60',
          color
        )}
      />
      <span
        className={cn(
          'relative inline-flex h-2.5 w-2.5 rounded-full ring-2 ring-primary-blue-500',
          color
        )}
      />
    </span>
  );
};

export default MembershipStateDot;
