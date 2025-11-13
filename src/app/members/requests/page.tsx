import type { Metadata } from 'next';

import Requests from '@/components/pages/members/requests';

export const metadata: Metadata = {
  title: 'Requests Page',
  description: 'Manage gym members request',
};

export default function RequestsPage() {
  return <Requests />;
}
