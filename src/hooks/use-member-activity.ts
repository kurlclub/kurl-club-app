'use client';

import { useQuery } from '@tanstack/react-query';

import { getMemberActivitySettings } from '@/services/gym';

export const memberActivityQueryKey = (gymId?: number | string) => [
  'memberActivitySettings',
  gymId,
];

export function useMemberActivitySettings(gymId?: number | string) {
  return useQuery({
    queryKey: memberActivityQueryKey(gymId),
    queryFn: () => getMemberActivitySettings(Number(gymId)),
    enabled: !!gymId,
    staleTime: 1000 * 60 * 5,
  });
}
