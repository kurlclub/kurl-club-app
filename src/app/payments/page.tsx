import type { Metadata } from 'next';

import Payments from '@/components/pages/payments';

export const metadata: Metadata = {
  title: 'Payments',
  description: 'Track member payments, outstanding dues, and payment history',
};

export default function PaymentsPage() {
  return <Payments />;
}
