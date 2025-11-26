import type { Metadata } from 'next';

import Members from '@/components/pages/members';

export const metadata: Metadata = {
  title: 'Members',
  description:
    'Manage gym members, view member details, and track membership status',
};

export default function MembersPage() {
  return <Members />;
}
