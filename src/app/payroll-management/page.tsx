import type { Metadata } from 'next';

import PayrollManagement from '@/components/pages/payroll-management';

export const metadata: Metadata = {
  title: 'Payroll management',
  description: 'Manage payrolls',
};

export default function PayrollManagementPage() {
  return <PayrollManagement />;
}
