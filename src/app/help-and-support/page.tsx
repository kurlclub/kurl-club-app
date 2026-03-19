import type { Metadata } from 'next';

import HelpAndSupport from '@/components/pages/help-and-support';

export const metadata: Metadata = {
  title: 'Help and Support',
  description: 'Get assistance and find answers to your questions',
};

const HelpAndSupportPage = () => {
  return <HelpAndSupport />;
};

export default HelpAndSupportPage;
