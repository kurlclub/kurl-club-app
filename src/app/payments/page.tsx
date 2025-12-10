import type { Metadata } from 'next';
import { Suspense } from 'react';

import Payments from '@/components/pages/payments';
import { TableSkeleton } from '@/components/shared/table';

export const metadata: Metadata = {
  title: 'Payments',
  description: 'Track member payments, outstanding dues, and payment history',
};

export default function PaymentsPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={10} columns={7} />}>
      <Payments />
    </Suspense>
  );
}
