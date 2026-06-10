import type { Metadata } from 'next';

import WelcomeOnboarding from '@/components/pages/welcome';

export const metadata: Metadata = {
  title: 'Welcome',
  description: 'Set up your first gym to get started with KurlClub',
};

export default function WelcomePage() {
  return <WelcomeOnboarding />;
}
