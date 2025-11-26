import type { Metadata } from 'next';

import ActivateScreen from '@/components/auth/activate-page';

export const metadata: Metadata = {
  title: 'Activate Account',
  description: 'Activate your KurlClub Admin account',
};

export default function ActivatePage() {
  return <ActivateScreen />;
}
