import type { Metadata } from 'next';

import LeadManagement from '@/components/pages/lead-management';

export const metadata: Metadata = {
  title: 'Lead Management',
  description: 'Manage gym leads, view lead details, and track lead status',
};

export default function MembersPage() {
  return <LeadManagement />;
}
