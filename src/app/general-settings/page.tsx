import type { Metadata } from 'next';

import GeneralSettings from '@/components/pages/general-settings';

export const metadata: Metadata = {
  title: 'General Settings',
  description:
    'Configure general gym settings, business profile, and operations',
};

export default function GeneralSettingsPage() {
  return <GeneralSettings />;
}
